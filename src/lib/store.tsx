import { type ReactNode, createContext, useContext, useReducer } from "react";
import type {
  Product,
  Customer,
  PaymentMethod,
  Sale,
  Conditional,
} from "../types";
import { nanoid } from "nanoid";

// --- State ---
interface AppState {
  products: Product[];
  customers: Customer[];
  paymentMethods: PaymentMethod[];
  sales: Sale[];
  conditionals: Conditional[];
}

const defaultPaymentMethods: PaymentMethod[] = [
  { id: "dinheiro", name: "Dinheiro" },
  { id: "credito", name: "Cartão de Crédito" },
  { id: "debito", name: "Cartão de Débito" },
  { id: "pix", name: "Pix" },
  { id: "transferencia", name: "Transferência" },
  { id: "boleto", name: "Boleto" },
];

const initialState: AppState = {
  products: [],
  customers: [],
  paymentMethods: defaultPaymentMethods,
  sales: [],
  conditionals: [],
};

// --- Actions ---
type Action =
  | { type: "ADD_PRODUCT"; payload: Omit<Product, "createdAt"> }
  | { type: "ADD_CUSTOMER"; payload: Omit<Customer, "id" | "createdAt"> }
  | { type: "ADD_PAYMENT_METHOD"; payload: Omit<PaymentMethod, "id"> }
  | { type: "ADD_SALE"; payload: Sale }
  | {
      type: "UPDATE_INSTALLMENT_STATUS";
      payload: { saleId: string; installmentId: string };
    }
  | {
      type: "PAY_INSTALLMENT_PARTIAL";
      payload: { saleId: string; installmentId: string; paidAmount: number };
    }
  | { type: "ADD_CONDITIONAL"; payload: Conditional }
  | {
      type: "UPDATE_CONDITIONAL_PRODUCT_RETURN";
      payload: { conditionalId: string; productBarcode: string };
    }
  | {
      type: "COMPLETE_CONDITIONAL";
      payload: { conditionalId: string };
    };

// --- Reducer ---
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [
          ...state.products,
          { ...action.payload, createdAt: new Date().toISOString() },
        ],
      };
    case "ADD_CUSTOMER":
      return {
        ...state,
        customers: [
          ...state.customers,
          {
            ...action.payload,
            id: nanoid(),
            createdAt: new Date().toISOString(),
          },
        ],
      };
    case "ADD_PAYMENT_METHOD":
      return {
        ...state,
        paymentMethods: [
          ...state.paymentMethods,
          { ...action.payload, id: nanoid() },
        ],
      };
    case "ADD_SALE":
      return {
        ...state,
        sales: [...state.sales, action.payload],
      };
    case "UPDATE_INSTALLMENT_STATUS": {
      const { saleId, installmentId } = action.payload;
      return {
        ...state,
        sales: state.sales.map((sale) => {
          if (sale.id === saleId) {
            return {
              ...sale,
              installments: sale.installments?.map((inst) => {
                if (inst.id === installmentId) {
                  return {
                    ...inst,
                    status: "paid",
                    paymentDate: new Date().toISOString(),
                  };
                }
                return inst;
              }),
            };
          }
          return sale;
        }),
      };
    }
    case "PAY_INSTALLMENT_PARTIAL": {
      const { saleId, installmentId, paidAmount } = action.payload;
      return {
        ...state,
        sales: state.sales.map((sale) => {
          if (sale.id === saleId && sale.installments) {
            const currentInstallments = [...sale.installments];
            const currentInstIndex = currentInstallments.findIndex(
              (inst) => inst.id === installmentId
            );

            if (currentInstIndex === -1) return sale;

            const currentInst = currentInstallments[currentInstIndex];
            const remainingValue =
              currentInst.value - (currentInst.paidAmount || 0);

            // Se o valor pago é igual ou maior que o valor restante
            if (paidAmount >= remainingValue) {
              currentInstallments[currentInstIndex] = {
                ...currentInst,
                paidAmount: currentInst.value,
                status: "paid",
                paymentDate: new Date().toISOString(),
              };

              // Se pagou mais que o necessário, distribui o excesso
              if (paidAmount > remainingValue) {
                const excess = paidAmount - remainingValue;
                let remainingExcess = excess;

                // Encontra parcelas pendentes posteriores
                const pendingInstallments = currentInstallments
                  .slice(currentInstIndex + 1)
                  .filter((inst) => inst.status === "pending");

                if (pendingInstallments.length > 0) {
                  const totalPendingValue = pendingInstallments.reduce(
                    (sum, inst) => sum + (inst.value - (inst.paidAmount || 0)),
                    0
                  );

                  if (remainingExcess >= totalPendingValue) {
                    // Paga todas as parcelas restantes
                    pendingInstallments.forEach((inst) => {
                      const instIndex = currentInstallments.findIndex(
                        (i) => i.id === inst.id
                      );
                      currentInstallments[instIndex] = {
                        ...inst,
                        paidAmount: inst.value,
                        status: "paid",
                        paymentDate: new Date().toISOString(),
                      };
                    });
                  } else {
                    // Distribui proporcionalmente
                    pendingInstallments.forEach((inst) => {
                      if (remainingExcess > 0) {
                        const instRemainingValue =
                          inst.value - (inst.paidAmount || 0);
                        const proportion =
                          instRemainingValue / totalPendingValue;
                        const amountToApply = Math.min(
                          remainingExcess * proportion,
                          instRemainingValue
                        );

                        const instIndex = currentInstallments.findIndex(
                          (i) => i.id === inst.id
                        );
                        const newPaidAmount =
                          (inst.paidAmount || 0) + amountToApply;

                        currentInstallments[instIndex] = {
                          ...inst,
                          paidAmount: newPaidAmount,
                          status:
                            newPaidAmount >= inst.value ? "paid" : "pending",
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
              // Pagamento parcial
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

              // Distribui o valor restante nas próximas parcelas
              const stillOwed = currentInst.value - newPaidAmount;
              const pendingInstallments = currentInstallments
                .slice(currentInstIndex + 1)
                .filter((inst) => inst.status === "pending");

              if (pendingInstallments.length > 0) {
                const amountPerInstallment =
                  stillOwed / pendingInstallments.length;
                pendingInstallments.forEach((inst) => {
                  const instIndex = currentInstallments.findIndex(
                    (i) => i.id === inst.id
                  );
                  currentInstallments[instIndex] = {
                    ...inst,
                    value: inst.value + amountPerInstallment,
                  };
                });
              }
            }

            return {
              ...sale,
              installments: currentInstallments,
            };
          }
          return sale;
        }),
      };
    }
    case "ADD_CONDITIONAL":
      return {
        ...state,
        conditionals: [...state.conditionals, action.payload],
      };
    case "UPDATE_CONDITIONAL_PRODUCT_RETURN": {
      const { conditionalId, productBarcode } = action.payload;
      return {
        ...state,
        conditionals: state.conditionals.map((conditional) => {
          if (conditional.id === conditionalId) {
            return {
              ...conditional,
              products: conditional.products.map((conditionalProduct) => {
                if (conditionalProduct.product.barcode === productBarcode) {
                  return {
                    ...conditionalProduct,
                    returned: true,
                    returnedAt: new Date().toISOString(),
                  };
                }
                return conditionalProduct;
              }),
            };
          }
          return conditional;
        }),
      };
    }
    case "COMPLETE_CONDITIONAL": {
      const { conditionalId } = action.payload;
      return {
        ...state,
        conditionals: state.conditionals.map((conditional) => {
          if (conditional.id === conditionalId) {
            const allReturned = conditional.products.every((p) => p.returned);
            return {
              ...conditional,
              status: allReturned ? "returned" : "completed",
              completedAt: new Date().toISOString(),
            };
          }
          return conditional;
        }),
      };
    }
    default:
      return state;
  }
};

// --- Context ---
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider ---
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Hook ---
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
