import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserInquiries, useUpdateInquiry, useGetListings } from '../hooks/useQueries';
import RequireAuth from '../components/auth/RequireAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { InquiryStatus } from '../backend';
import { useNavigate } from '@tanstack/react-router';

function MyInquiriesContent() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: inquiries, isLoading } = useGetUserInquiries(identity?.getPrincipal().toString());
  const { data: listingsData } = useGetListings(1000, 1, null);
  const updateMutation = useUpdateInquiry();

  const handleCancel = async (inquiryId: bigint) => {
    try {
      await updateMutation.mutateAsync({ inquiryId, newStatus: InquiryStatus.cancelled });
      toast.success('Demande annulée');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'annulation');
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

  const getListingById = (id: bigint) => {
    return listingsData?.listings.find((l) => l.id === id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mes Demandes de Location</h1>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      )}

      {!isLoading && (!inquiries || inquiries.length === 0) && (
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-2xl font-semibold mb-2">Aucune demande</h3>
            <p className="text-muted-foreground mb-6">Vous n'avez pas encore envoyé de demande de location</p>
            <Button onClick={() => navigate({ to: '/' })}>Parcourir les annonces</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && inquiries && inquiries.length > 0 && (
        <div className="space-y-4">
          {inquiries.map((inquiry) => {
            const listing = getListingById(inquiry.listingId);
            return (
              <Card key={inquiry.id.toString()}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">
                        {listing ? listing.title : `Annonce #${inquiry.listingId}`}
                      </CardTitle>
                      {listing && (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate({ to: '/listing/$id', params: { id: listing.id.toString() } })}
                        >
                          Voir l'annonce
                        </Button>
                      )}
                    </div>
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
                    <Button
                      variant="outline"
                      onClick={() => handleCancel(inquiry.id)}
                      disabled={updateMutation.isPending}
                    >
                      Annuler la demande
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MyInquiriesPage() {
  return (
    <RequireAuth>
      <MyInquiriesContent />
    </RequireAuth>
  );
}
