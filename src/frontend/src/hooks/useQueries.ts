import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Listing, ListingFilters, ListingsResult, Inquiry, InquiryStatus } from '../backend';

export function useGetListings(pageSize: number, pageNumber: number, filters: ListingFilters | null) {
  const { actor, isFetching } = useActor();

  return useQuery<ListingsResult>({
    queryKey: ['listings', pageSize, pageNumber, filters],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getListings(BigInt(pageSize), BigInt(pageNumber), filters);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(id: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Listing | null>({
    queryKey: ['listing', id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getListing(BigInt(id));
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listing: Listing) => {
      if (!actor) throw new Error('Actor not available');
      return actor.create_listing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, listing }: { id: bigint; listing: Listing }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.update_listing(id, listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing'] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.delete_listing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}

export function useGetListingInquiries(listingId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Inquiry[]>({
    queryKey: ['listingInquiries', listingId?.toString()],
    queryFn: async () => {
      if (!actor || !listingId) return [];
      return actor.getListingInquiries(listingId);
    },
    enabled: !!actor && !isFetching && !!listingId,
  });
}

export function useGetUserInquiries(userPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Inquiry[]>({
    queryKey: ['userInquiries', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserInquiries(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
  });
}

export function useCreateInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      listingId,
      startDate,
      endDate,
      message,
    }: {
      listingId: bigint;
      startDate: string;
      endDate: string;
      message: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.create_inquiry(listingId, startDate, endDate, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['listingInquiries'] });
    },
  });
}

export function useUpdateInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inquiryId, newStatus }: { inquiryId: bigint; newStatus: InquiryStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.update_inquiry(inquiryId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInquiries'] });
      queryClient.invalidateQueries({ queryKey: ['listingInquiries'] });
    },
  });
}
