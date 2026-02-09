import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetListings, useGetListingInquiries, useUpdateInquiry } from '../hooks/useQueries';
import RequireAuth from '../components/auth/RequireAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { InquiryStatus } from '../backend';
import { Check, X } from 'lucide-react';

function InquiriesForMyListingsContent() {
  const { identity } = useInternetIdentity();
  const { data: listingsData, isLoading: listingsLoading } = useGetListings(1000, 1, null);
  const updateMutation = useUpdateInquiry();

  const myListings = listingsData?.listings.filter(
    (listing) => identity && listing.owner.toString() === identity.getPrincipal().toString()
  ) || [];

  const handleAccept = async (inquiryId: bigint) => {
    try {
      await updateMutation.mutateAsync({ inquiryId, newStatus: InquiryStatus.accepted });
      toast.success('Demande acceptée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'acceptation');
    }
  };

  const handleReject = async (inquiryId: bigint) => {
    try {
      await updateMutation.mutateAsync({ inquiryId, newStatus: InquiryStatus.rejected });
      toast.success('Demande refusée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du refus');
    }
  };

  const statusLabels = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Refusée',
    cancelled: 'Annulée',
  };

  const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'default',
    accepted: 'default',
    rejected: 'destructive',
    cancelled: 'secondary',
  };

  if (listingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (myListings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Demandes pour Mes Annonces</h1>
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-2xl font-semibold mb-2">Aucune annonce</h3>
            <p className="text-muted-foreground">Créez une annonce pour recevoir des demandes</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Demandes pour Mes Annonces</h1>

      <Tabs defaultValue={myListings[0]?.id.toString()} className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          {myListings.map((listing) => (
            <TabsTrigger key={listing.id.toString()} value={listing.id.toString()}>
              {listing.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {myListings.map((listing) => (
          <TabsContent key={listing.id.toString()} value={listing.id.toString()}>
            <ListingInquiries
              listingId={listing.id}
              onAccept={handleAccept}
              onReject={handleReject}
              statusLabels={statusLabels}
              statusVariants={statusVariants}
              isUpdating={updateMutation.isPending}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ListingInquiries({
  listingId,
  onAccept,
  onReject,
  statusLabels,
  statusVariants,
  isUpdating,
}: {
  listingId: bigint;
  onAccept: (id: bigint) => void;
  onReject: (id: bigint) => void;
  statusLabels: Record<string, string>;
  statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'>;
  isUpdating: boolean;
}) {
  const { data: inquiries, isLoading } = useGetListingInquiries(listingId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-[200px]" />
        ))}
      </div>
    );
  }

  if (!inquiries || inquiries.length === 0) {
    return (
      <Card className="text-center py-16">
        <CardContent>
          <p className="text-muted-foreground">Aucune demande pour cette annonce</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id.toString()}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Demande de location</CardTitle>
              <Badge variant={statusVariants[inquiry.status]}>
                {statusLabels[inquiry.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Date de début</p>
                <p className="font-medium">{inquiry.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de fin</p>
                <p className="font-medium">{inquiry.endDate}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Message</p>
              <p className="text-sm">{inquiry.message}</p>
            </div>
            {inquiry.status === InquiryStatus.pending && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onAccept(inquiry.id)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Accepter
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onReject(inquiry.id)}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function InquiriesForMyListingsPage() {
  return (
    <RequireAuth>
      <InquiriesForMyListingsContent />
    </RequireAuth>
  );
}
