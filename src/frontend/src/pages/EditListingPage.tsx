import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing, useUpdateListing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RequireAuth from '../components/auth/RequireAuth';
import ListingForm from '../components/listings/ListingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { Listing } from '../backend';

function EditListingContent() {
  const { id } = useParams({ from: '/edit-listing/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: listing, isLoading } = useGetListing(id);
  const updateMutation = useUpdateListing();

  const isOwner = listing && identity && listing.owner.toString() === identity.getPrincipal().toString();

  const handleSubmit = async (updatedListing: Listing) => {
    if (!listing) return;
    try {
      await updateMutation.mutateAsync({ id: listing.id, listing: updatedListing });
      toast.success('Annonce mise à jour avec succès');
      navigate({ to: '/my-listings' });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!listing || !isOwner) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Accès refusé</h2>
        <p className="text-muted-foreground mb-6">Vous n'êtes pas autorisé à modifier cette annonce.</p>
        <Button onClick={() => navigate({ to: '/my-listings' })}>Retour à mes annonces</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/my-listings' })} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à mes annonces
      </Button>

      <h1 className="text-4xl font-bold mb-8">Modifier l'Annonce</h1>

      <ListingForm
        initialData={listing}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}

export default function EditListingPage() {
  return (
    <RequireAuth>
      <EditListingContent />
    </RequireAuth>
  );
}
