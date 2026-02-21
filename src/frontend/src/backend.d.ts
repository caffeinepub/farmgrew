import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Order {
    id: bigint;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    customer: Principal;
    tracking: Array<OrderTrackingEntry>;
    totalPriceCents: bigint;
    pickupTime?: Time;
    timestamp: Time;
    items: Array<[bigint, bigint]>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Customer {
    principal: Principal;
    name: string;
    pickupAddress: string;
    phoneNumber: string;
}
export interface OrderTrackingEntry {
    status: OrderStatus;
    note: string;
    timestamp: Time;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Cart {
    items: Array<[bigint, bigint]>;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type PaymentStatus = {
    __kind__: "pending";
    pending: null;
} | {
    __kind__: "completed";
    completed: {
        amountCents: bigint;
        timestamp: Time;
        sessionId: string;
    };
} | {
    __kind__: "failed";
    failed: {
        reason: string;
    };
};
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: string;
    image?: ExternalBlob;
    priceCents: bigint;
}
export enum OrderStatus {
    canceled = "canceled",
    expired = "expired",
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    stripe = "stripe",
    cashOnDelivery = "cashOnDelivery"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    authenticateAdmin(username: string, password: string): Promise<void>;
    checkUserRole(user: Principal): Promise<UserRole>;
    clearCart(): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createProduct(name: string, description: string, priceCents: bigint, category: string, image: ExternalBlob | null): Promise<Product>;
    deleteProduct(productId: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCatalogMetadata(): Promise<{
        productCount: bigint;
    }>;
    getCustomerByPrincipal(principal: Principal): Promise<Customer>;
    getIdForCaller(): Promise<Principal>;
    getOrderById(orderId: bigint): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getProductById(productId: bigint): Promise<Product>;
    getProductImage(productId: bigint): Promise<ExternalBlob | null>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    grantAdminRole(user: Principal): Promise<void>;
    grantUserRole(user: Principal): Promise<void>;
    initialize(): Promise<void>;
    initializeAdminAccess(username: string, password: string): Promise<void>;
    isAdminConfigured(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    listAllProducts(): Promise<Array<Product>>;
    listProducts(category: string | null): Promise<Array<Product>>;
    markOrderAsPaidAdmin(orderId: bigint): Promise<void>;
    placeOrder(paymentMethod: PaymentMethod, pickupTime: Time | null): Promise<bigint>;
    registerCustomer(name: string, phoneNumber: string, pickupAddress: string): Promise<void>;
    removeFromCart(productId: bigint): Promise<void>;
    revokeAdminRole(user: Principal): Promise<void>;
    setOrderCompleted(orderId: bigint): Promise<void>;
    setOrderPaid(orderId: bigint, sessionId: string, amountCents: bigint): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateAdminCredentials(username: string, password: string): Promise<void>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, priceCents: bigint, category: string, image: ExternalBlob | null): Promise<Product>;
    uploadProductImage(productId: bigint, image: ExternalBlob): Promise<ExternalBlob>;
}
