export interface Product {
  barcode: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
}

export type PaymentStatus = "paid" | "pending";

export interface Installment {
  id: string;
  saleId: string;
  installmentNumber: number;
  value: number;
  paidAmount?: number;
  dueDate: string;
  status: PaymentStatus;
  paymentDate?: string;
}

export type PaymentCondition = "in_full" | "installments";

export interface Sale {
  id: string;
  customer: Customer;
  products: Product[];
  paymentMethod: PaymentMethod;
  totalValue: number;
  paymentCondition: PaymentCondition;
  installments?: Installment[];
  createdAt: string;
}

export type ConditionalStatus = "active" | "returned" | "completed";

export interface ConditionalProduct {
  product: Product;
  quantity: number;
  returned: boolean;
  returnedAt?: string;
}

export interface Conditional {
  id: string;
  customer: Customer;
  products: ConditionalProduct[];
  status: ConditionalStatus;
  createdAt: string;
  returnedAt?: string;
  completedAt?: string;
}
