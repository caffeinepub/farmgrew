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
export interface Customer {
    principal: Principal;
    name: string;
    pickupAddress: string;
    phoneNumber: string;
}
export type Time = bigint;
export interface Cart {
    items: Array<[bigint, bigint]>;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    customer: Principal;
    totalPriceCents: bigint;
    pickupTime?: Time;
    timestamp: Time;
    items: Array<[bigint, bigint]>;
}
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCart(): Promise<void>;
    createProduct(name: string, description: string, priceCents: bigint, category: string, image: ExternalBlob | null): Promise<Product>;
    deleteProduct(productId: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Cart>;
    getCustomerByPrincipal(principal: Principal): Promise<Customer>;
    getIdForCaller(): Promise<Principal>;
    getOrderById(orderId: bigint): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getProductById(productId: bigint): Promise<Product>;
    getProductImage(productId: bigint): Promise<ExternalBlob | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllProducts(): Promise<Array<Product>>;
    listProducts(category: string | null): Promise<Array<Product>>;
    placeOrder(pickupTime: Time | null): Promise<bigint>;
    registerCustomer(name: string, phoneNumber: string, pickupAddress: string): Promise<void>;
    removeFromCart(productId: bigint): Promise<void>;
    updateCartItem(productId: bigint, quantity: bigint): Promise<void>;
    updateProduct(productId: bigint, name: string, description: string, priceCents: bigint, category: string, image: ExternalBlob | null): Promise<Product>;
    uploadProductImage(productId: bigint, image: ExternalBlob): Promise<ExternalBlob>;
}
