import Array "mo:core/Array";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let nextListingId = Map.empty<Nat, ()>();
  let nextInquiryId = Map.empty<Nat, ()>();

  let listingsStore = Map.empty<Nat, Listing>();
  let inquiriesStore = Map.empty<Nat, Inquiry>();

  let listingIds = Set.empty<Nat>();

  /// Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  /// User Profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type ListingType = {
    #sale;
    #rent;
  };

  type PropertyType = {
    #house;
    #apartment;
    #studio;
    #land;
    #other;
  };

  type ListingStatus = {
    #available;
    #sold;
    #rented;
    #temporarilyUnavailable;
  };

  type Address = {
    city : Text;
    neighborhood : ?Text;
    street : ?Text;
  };

  public type Listing = {
    id : Nat;
    title : Text;
    description : Text;
    price : Nat;
    currency : Text;
    listingType : ListingType;
    address : Address;
    propertyType : PropertyType;
    bedrooms : Nat;
    bathrooms : Nat;
    areaSqm : Nat;
    amenities : [Text];
    photos : [Text];
    status : ListingStatus;
    owner : Principal;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type InquiryStatus = {
    #pending;
    #accepted;
    #rejected;
    #cancelled;
  };

  public type Inquiry = {
    id : Nat;
    listingId : Nat;
    requester : Principal;
    startDate : Text;
    endDate : Text;
    message : Text;
    status : InquiryStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type ListingFilters = {
    listingType : ?ListingType;
    city : ?Text;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    minBedrooms : ?Nat;
    propertyType : ?PropertyType;
    searchText : ?Text;
  };

  public type ListingsResult = {
    listings : [Listing];
    totalCount : Nat;
  };

  module Listing {
    public func compareByUpdatedAt(listing1 : Listing, listing2 : Listing) : Order.Order {
      Nat.compare(listing1.id, listing2.id);
    };
  };

  func getNextId(store : Map.Map<Nat, ()>) : Nat {
    var id = 1;
    while (store.containsKey(id)) {
      id += 1;
    };
    store.add(id, ());
    id;
  };

  // Public query - no auth required (browsing allowed for all)
  public query ({ caller }) func getListing(id : Nat) : async ?Listing {
    listingsStore.get(id);
  };

  // Public query - no auth required (browsing allowed for all)
  public query ({ caller }) func getListings(pageSize : Nat, pageNumber : Nat, filters : ?ListingFilters) : async ListingsResult {
    let allListings = listingsStore.values().toArray();

    let filtered = allListings.filter(
      func(l) {
        switch (filters) {
          case (null) { true };
          case (?f) {
            let matchesType = switch (f.listingType) {
              case (null) { true };
              case (?lt) { l.listingType == lt };
            };
            let matchesCity = switch (f.city) {
              case (null) { true };
              case (?c) { l.address.city.contains(#text(c)) };
            };
            let matchesPrice = switch (f.minPrice, f.maxPrice) {
              case (null, null) { true };
              case (?min, null) { l.price >= min };
              case (null, ?max) { l.price <= max };
              case (?min, ?max) { l.price >= min and l.price <= max };
            };
            let matchesBedrooms = switch (f.minBedrooms) {
              case (null) { true };
              case (?b) { l.bedrooms >= b };
            };
            let matchesPropType = switch (f.propertyType) {
              case (null) { true };
              case (?pt) { l.propertyType == pt };
            };
            let matchesText = switch (f.searchText) {
              case (null) { true };
              case (?t) { l.title.contains(#text(t)) or l.description.contains(#text(t)) };
            };

            matchesType and matchesCity and matchesPrice and matchesBedrooms and matchesPropType and matchesText;
          };
        };
      }
    );

    let sortedListings = filtered.sort(Listing.compareByUpdatedAt);
    let total = sortedListings.size();

    let startIndex = (pageNumber - 1) * pageSize;
    if (startIndex >= total) {
      return {
        listings = [];
        totalCount = total;
      };
    };

    let endIndex = startIndex + pageSize;
    let slicedListings = Array.tabulate(
      Nat.min(pageSize, sortedListings.size() - startIndex),
      func(i) {
        sortedListings[startIndex + i];
      },
    );

    {
      listings = slicedListings;
      totalCount = total;
    };
  };

  public shared ({ caller }) func create_listing(listing : Listing) : async Nat {
    // Only authenticated users can create listings
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create listings");
    };

    let id = getNextId(nextListingId);
    let timestamp = Time.now();

    let newListing : Listing = {
      id;
      title = listing.title;
      description = listing.description;
      price = listing.price;
      currency = listing.currency;
      listingType = listing.listingType;
      address = listing.address;
      propertyType = listing.propertyType;
      bedrooms = listing.bedrooms;
      bathrooms = listing.bathrooms;
      areaSqm = listing.areaSqm;
      amenities = listing.amenities;
      photos = listing.photos;
      status = listing.status;
      owner = caller;
      createdAt = timestamp;
      updatedAt = timestamp;
    };

    listingsStore.add(id, newListing);
    id;
  };

  public shared ({ caller }) func update_listing(id : Nat, updated : Listing) : async () {
    // Only authenticated users can update listings
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update listings");
    };

    // Only owner can update
    let existing = switch (listingsStore.get(id)) {
      case (null) { Runtime.trap("Listing not found!") };
      case (?l) { l };
    };

    if (existing.owner != caller) {
      Runtime.trap("You are not the owner of this listing");
    };

    let timestamp = Time.now();
    let updatedListing : Listing = {
      id = existing.id;
      createdAt = existing.createdAt;
      updatedAt = timestamp;
      title = updated.title;
      description = updated.description;
      price = updated.price;
      currency = updated.currency;
      listingType = updated.listingType;
      address = updated.address;
      propertyType = updated.propertyType;
      bedrooms = updated.bedrooms;
      bathrooms = updated.bathrooms;
      areaSqm = updated.areaSqm;
      amenities = updated.amenities;
      photos = updated.photos;
      status = updated.status;
      owner = existing.owner;
    };

    listingsStore.add(id, updatedListing);
  };

  public shared ({ caller }) func delete_listing(id : Nat) : async () {
    // Only authenticated users can delete listings
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete listings");
    };

    let existing = switch (listingsStore.get(id)) {
      case (null) { Runtime.trap("Listing not found!") };
      case (?l) { l };
    };

    if (existing.owner != caller) {
      Runtime.trap("You are not the owner of this listing");
    };

    listingsStore.remove(id);
  };

  public shared ({ caller }) func create_inquiry(listingId : Nat, startDate : Text, endDate : Text, message : Text) : async Nat {
    // Only authenticated users can create inquiries
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create inquiries");
    };

    let inquiryId = getNextId(nextInquiryId);
    let timestamp = Time.now();

    let listingExists = listingsStore.containsKey(listingId);
    if (not listingExists) {
      Runtime.trap("Listing does not exist");
    };

    let newInquiry : Inquiry = {
      id = inquiryId;
      listingId;
      requester = caller;
      startDate;
      endDate;
      message;
      status = #pending;
      createdAt = timestamp;
      updatedAt = timestamp;
    };

    inquiriesStore.add(inquiryId, newInquiry);
    inquiryId;
  };

  public shared ({ caller }) func update_inquiry(inquiryId : Nat, newStatus : InquiryStatus) : async () {
    // Only authenticated users can update inquiries
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update inquiries");
    };

    let existing = switch (inquiriesStore.get(inquiryId)) {
      case (null) { Runtime.trap("Inquiry not found! ") };
      case (?i) { i };
    };

    let correspondingListing = switch (listingsStore.get(existing.listingId)) {
      case (null) { Runtime.trap("Listing for inquiry not found! ") };
      case (?l) { l };
    };

    switch (newStatus) {
      case (#accepted or #rejected) {
        if (correspondingListing.owner != caller) {
          Runtime.trap("Only the relevant listing owner can accept/reject inquiries! ");
        };
      };
      case (#cancelled) {
        if (existing.requester != caller) {
          Runtime.trap("Only the requester can cancel the inquiry! ");
        };
      };
      case (_) {};
    };

    let updatedInquiry : Inquiry = {
      existing with
      status = newStatus;
      updatedAt = Time.now();
    };

    inquiriesStore.add(inquiryId, updatedInquiry);
  };

  // Public query - no auth required (browsing allowed for all)
  public query ({ caller }) func getListingInquiries(listingId : Nat) : async [Inquiry] {
    inquiriesStore.values().toArray().filter(
      func(i) { i.listingId == listingId }
    );
  };

  // Public query - no auth required (browsing allowed for all)
  public query ({ caller }) func getUserInquiries(user : Principal) : async [Inquiry] {
    inquiriesStore.values().toArray().filter(
      func(i) { i.requester == user }
    );
  };

  // Public query - no auth required (browsing allowed for all)
  public query ({ caller }) func getListingCount() : async Nat {
    listingsStore.size();
  };

  // Public query - no auth required (browsing allowed for all)
  public query ({ caller }) func getAllAvailableListings() : async [Listing] {
    let listings = listingsStore.values().toArray();
    let availableListings = listings.filter(
      func(listing) {
        listing.status == #available
      }
    );
    availableListings.sort(Listing.compareByUpdatedAt);
  };
};
