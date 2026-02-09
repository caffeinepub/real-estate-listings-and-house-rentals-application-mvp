import { useNavigate } from '@tanstack/react-router';
import { useCreateListing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RequireAuth from '../components/auth/RequireAuth';
import ListingForm from '../components/listings/ListingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Listing } from '../backend';

function CreateListingContent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createMutation = useCreateListing();

  const handleSubmit = async (listing: Listing) => {
    try {
      await createMutation.mutateAsync(listing);
      toast.success('Annonce créée avec succès');
      navigate({ to: '/my-listings' });
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate({ to: '/my-listings' })} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à mes annonces
      </Button>

      <h1 className="text-4xl font-bold mb-8">Créer une Annonce</h1>

      <ListingForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <RequireAuth>
      <CreateListingContent />
    </RequireAuth>
  );
}
