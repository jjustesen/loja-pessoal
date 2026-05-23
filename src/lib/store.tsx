import {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import type {
  Product,
  Customer,
  PaymentMethod,
  Sale,
  Conditional,
} from "../types";
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

// Métodos padrão de pagamento
const defaultPaymentMethods: PaymentMethod[] = [
  { id: "dinheiro", name: "Dinheiro" },
  { id: "credito", name: "Cartão de Crédito" },
  { id: "debito", name: "Cartão de Débito" },
  { id: "pix", name: "Pix" },
  { id: "transferencia", name: "Transferência" },
  { id: "boleto", name: "Boleto" },
];

// --- Contexto com Firebase ---
interface AppContextType {
  products: Product[];
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  sales: Sale[];
  conditionals: Conditional[];
  addProduct: (payload: Omit<Product, "createdAt">) => Promise<void>;
  addCustomer: (payload: Omit<Customer, "id" | "createdAt">) => Promise<void>;
  addPaymentMethod: (payload: Omit<PaymentMethod, "id">) => Promise<void>;
  addSale: (sale: Sale) => Promise<void>;
  updateInstallmentStatus: (
    saleId: string,
    installmentId: string
  ) => Promise<void>;
  payInstallmentPartial: (
    saleId: string,
    installmentId: string,
    paidAmount: number
  ) => Promise<void>;
  addConditional: (conditional: Conditional) => Promise<void>;
  updateConditionalProductReturn: (
    conditionalId: string,
    productBarcode: string
  ) => Promise<void>;
  completeConditional: (conditionalId: string) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  deleteConditional: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    defaultPaymentMethods
  );
  const [sales, setSales] = useState<Sale[]>([]);
  const [conditionals, setConditionals] = useState<Conditional[]>([]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(
        snapshot.docs.map(
          (doc) => ({ ...(doc.data() as Product), id: doc.id } as Product)
        )
      );
    });
    const unsubCustomers = onSnapshot(
      collection(db, "customers"),
      (snapshot) => {
        setCustomers(
          snapshot.docs.map(
            (doc) => ({ ...(doc.data() as Customer), id: doc.id } as Customer)
          )
        );
      }
    );
    const unsubPaymentMethods = onSnapshot(
      collection(db, "paymentMethods"),
      (snapshot) => {
        setPaymentMethods(
          snapshot.docs.map(
            (doc) =>
              ({
                ...(doc.data() as PaymentMethod),
                id: doc.id,
              } as PaymentMethod)
          )
        );
      }
    );
    const unsubSales = onSnapshot(collection(db, "sales"), (snapshot) => {
      setSales(
        snapshot.docs.map(
          (doc) => ({ ...(doc.data() as Sale), id: doc.id } as Sale)
        )
      );
    });
    const unsubConditionals = onSnapshot(
      collection(db, "conditionals"),
      (snapshot) => {
        setConditionals(
          snapshot.docs.map(
            (doc) =>
              ({ ...(doc.data() as Conditional), id: doc.id } as Conditional)
          )
        );
      }
    );

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubPaymentMethods();
      unsubSales();
      unsubConditionals();
    };
  }, []);

  const addProduct = async (payload: Omit<Product, "createdAt">) => {
    await addDoc(collection(db, "products"), {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  };
  const addCustomer = async (payload: Omit<Customer, "id" | "createdAt">) => {
    await addDoc(collection(db, "customers"), {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  };
  const addPaymentMethod = async (payload: Omit<PaymentMethod, "id">) => {
    await addDoc(collection(db, "paymentMethods"), payload);
  };
  const addSale = async (sale: Sale) => {
    await addDoc(collection(db, "sales"), sale);
  };
  const updateInstallmentStatus = async (
    saleId: string,
    installmentId: string
  ) => {
    const saleRef = doc(db, "sales", saleId);
    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) return;
    const sale = saleSnap.data() as Sale;
    const installments = sale.installments?.map((inst) =>
      inst.id === installmentId
        ? { ...inst, status: "paid", paymentDate: new Date().toISOString() }
        : inst
    );
    await updateDoc(saleRef, { installments });
  };
  const payInstallmentPartial = async (
    saleId: string,
    installmentId: string,
    paidAmount: number
  ) => {
    const saleRef = doc(db, "sales", saleId);
    const saleSnap = await getDoc(saleRef);
    if (!saleSnap.exists()) return;
    const sale = saleSnap.data() as Sale;
    if (!sale.installments) return;
    const currentInstallments = [...sale.installments];
    const currentInstIndex = currentInstallments.findIndex(
      (inst) => inst.id === installmentId
    );
    if (currentInstIndex === -1) return;
    const currentInst = currentInstallments[currentInstIndex];
    const remainingValue = currentInst.value - (currentInst.paidAmount || 0);

    if (paidAmount >= remainingValue) {
      currentInstallments[currentInstIndex] = {
        ...currentInst,
        paidAmount: currentInst.value,
        status: "paid",
        paymentDate: new Date().toISOString(),
      };
      if (paidAmount > remainingValue) {
        let remainingExcess = paidAmount - remainingValue;
        const pendingInstallments = currentInstallments
          .slice(currentInstIndex + 1)
          .filter((inst) => inst.status === "pending");
        if (pendingInstallments.length > 0) {
          const totalPendingValue = pendingInstallments.reduce(
            (sum, inst) => sum + (inst.value - (inst.paidAmount || 0)),
            0
          );
          if (remainingExcess >= totalPendingValue) {
            pendingInstallments.forEach((inst) => {
              const idx = currentInstallments.findIndex(
                (i) => i.id === inst.id
              );
              currentInstallments[idx] = {
                ...inst,
                paidAmount: inst.value,
                status: "paid",
                paymentDate: new Date().toISOString(),
              };
            });
          } else {
            pendingInstallments.forEach((inst) => {
              if (remainingExcess > 0) {
                const instRemainingValue = inst.value - (inst.paidAmount || 0);
                const proportion = instRemainingValue / totalPendingValue;
                const amountToApply = Math.min(
                  remainingExcess * proportion,
                  instRemainingValue
                );
                const idx = currentInstallments.findIndex(
                  (i) => i.id === inst.id
                );
                const newPaidAmount = (inst.paidAmount || 0) + amountToApply;
                currentInstallments[idx] = {
                  ...inst,
                  paidAmount: newPaidAmount,
                  status: newPaidAmount >= inst.value ? "paid" : "pending",
                  paymentDate:
                    newPaidAmount >= inst.value
                      ? new Date().toISOString()
                      : inst.paymentDate,
                };
                remainingExcess -= amountToApply;
              }
            });
          }
        }
      }
    } else {
      const newPaidAmount = (currentInst.paidAmount || 0) + paidAmount;
      currentInstallments[currentInstIndex] = {
        ...currentInst,
        paidAmount: newPaidAmount,
        status: newPaidAmount >= currentInst.value ? "paid" : "pending",
        paymentDate:
          newPaidAmount >= currentInst.value
            ? new Date().toISOString()
            : currentInst.paymentDate,
      };
      const stillOwed = currentInst.value - newPaidAmount;
      const pendingInstallments = currentInstallments
        .slice(currentInstIndex + 1)
        .filter((inst) => inst.status === "pending");
      if (pendingInstallments.length > 0) {
        const amountPerInstallment = stillOwed / pendingInstallments.length;
        pendingInstallments.forEach((inst) => {
          const idx = currentInstallments.findIndex((i) => i.id === inst.id);
          currentInstallments[idx] = {
            ...inst,
            value: inst.value + amountPerInstallment,
          };
        });
      }
    }

    await updateDoc(saleRef, { installments: currentInstallments });
  };
  const addConditional = async (conditional: Conditional) => {
    await addDoc(collection(db, "conditionals"), conditional);
  };
  const updateConditionalProductReturn = async (
    conditionalId: string,
    productBarcode: string
  ) => {
    const condRef = doc(db, "conditionals", conditionalId);
    const condSnap = await getDoc(condRef);
    if (!condSnap.exists()) return;
    const conditional = condSnap.data() as Conditional;
    const products = conditional.products.map((cp) =>
      cp.product.barcode === productBarcode
        ? { ...cp, returned: true, returnedAt: new Date().toISOString() }
        : cp
    );
    await updateDoc(condRef, { products });
  };
  const completeConditional = async (conditionalId: string) => {
    const condRef = doc(db, "conditionals", conditionalId);
    const condSnap = await getDoc(condRef);
    if (!condSnap.exists()) return;
    const conditional = condSnap.data() as Conditional;
    const allReturned = conditional.products.every((p) => p.returned);
    await updateDoc(condRef, {
      status: allReturned ? "returned" : "completed",
      completedAt: new Date().toISOString(),
    });
  };
  
  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
  };
  const deleteCustomer = async (id: string) => {
    await deleteDoc(doc(db, "customers", id));
  };
  const deleteSale = async (id: string) => {
    await deleteDoc(doc(db, "sales", id));
  };
  const deleteConditional = async (id: string) => {
    await deleteDoc(doc(db, "conditionals", id));
  };

  return (
    <AppContext.Provider
      value={{
        products,
        customers,
        paymentMethods,
        sales,
        conditionals,
        addProduct,
        addCustomer,
        addPaymentMethod,
        addSale,
        updateInstallmentStatus,
        payInstallmentPartial,
        addConditional,
        updateConditionalProductReturn,
        completeConditional,
        deleteProduct,
        deleteCustomer,
        deleteSale,
        deleteConditional,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error("useAppContext must be used within AppProvider");
  return context;
};
