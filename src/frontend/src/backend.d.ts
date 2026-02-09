import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ListingsResult {
    listings: Array<Listing>;
    totalCount: bigint;
}
export type Time = bigint;
export interface Listing {
    id: bigint;
    status: ListingStatus;
    title: string;
    propertyType: PropertyType;
    bedrooms: bigint;
    owner: Principal;
    createdAt: Time;
    description: string;
    amenities: Array<string>;
    listingType: ListingType;
    updatedAt: Time;
    currency: string;
    address: Address;
    areaSqm: bigint;
    bathrooms: bigint;
    price: bigint;
    photos: Array<string>;
}
export interface ListingFilters {
    propertyType?: PropertyType;
    city?: string;
    minBedrooms?: bigint;
    maxPrice?: bigint;
    listingType?: ListingType;
    searchText?: string;
    minPrice?: bigint;
}
export interface Inquiry {
    id: bigint;
    status: InquiryStatus;
    requester: Principal;
    endDate: string;
    listingId: bigint;
    createdAt: Time;
    updatedAt: Time;
    message: string;
    startDate: string;
}
export interface UserProfile {
    name: string;
}
export interface Address {
    street?: string;
    city: string;
    neighborhood?: string;
}
export enum InquiryStatus {
    cancelled = "cancelled",
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export enum ListingStatus {
    rented = "rented",
    sold = "sold",
    available = "available",
    temporarilyUnavailable = "temporarilyUnavailable"
}
export enum ListingType {
    rent = "rent",
    sale = "sale"
}
export enum PropertyType {
    studio = "studio",
    house = "house",
    other = "other",
    land = "land",
    apartment = "apartment"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    create_inquiry(listingId: bigint, startDate: string, endDate: string, message: string): Promise<bigint>;
    create_listing(listing: Listing): Promise<bigint>;
    delete_listing(id: bigint): Promise<void>;
    getAllAvailableListings(): Promise<Array<Listing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: bigint): Promise<Listing | null>;
    getListingCount(): Promise<bigint>;
    getListingInquiries(listingId: bigint): Promise<Array<Inquiry>>;
    getListings(pageSize: bigint, pageNumber: bigint, filters: ListingFilters | null): Promise<ListingsResult>;
    getUserInquiries(user: Principal): Promise<Array<Inquiry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    update_inquiry(inquiryId: bigint, newStatus: InquiryStatus): Promise<void>;
    update_listing(id: bigint, updated: Listing): Promise<void>;
}
