import { useNavigate } from '@tanstack/react-router';
import { useGetListings, useDeleteListing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import RequireAuth from '../components/auth/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '../lib/formatters';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

function MyListingsContent() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data, isLoading } = useGetListings(100, 1, null);
  const deleteMutation = useDeleteListing();

  const myListings = data?.listings.filter(
    (listing) => identity && listing.owner.toString() === identity.getPrincipal().toString()
  ) || [];

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Annonce supprimée avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const statusLabels = {
    available: 'Disponible',
    sold: 'Vendu',
    rented: 'Loué',
    temporarilyUnavailable: 'Temporairement indisponible',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Mes Annonces</h1>
        <Button onClick={() => navigate({ to: '/create-listing' })}>
          <Plus className="h-4 w-4 mr-2" />
          Créer une annonce
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[300px]" />
          ))}
        </div>
      )}

      {!isLoading && myListings.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <h3 className="text-2xl font-semibold mb-2">Aucune annonce</h3>
            <p className="text-muted-foreground mb-6">Vous n'avez pas encore créé d'annonce</p>
            <Button onClick={() => navigate({ to: '/create-listing' })}>
              <Plus className="h-4 w-4 mr-2" />
              Créer votre première annonce
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && myListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myListings.map((listing) => (
            <Card key={listing.id.toString()} className="overflow-hidden">
              <CardHeader className="p-0">
                {listing.photos.length > 0 ? (
                  <img
                    src={listing.photos[0]}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground">Aucune photo</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
                  <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                    {statusLabels[listing.status]}
                  </Badge>
                </div>
                <p className="text-xl font-bold text-primary mb-2">
                  {formatPrice(Number(listing.price), listing.currency)}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate({ to: '/edit-listing/$id', params: { id: listing.id.toString() } })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(listing.id)}>
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <RequireAuth>
      <MyListingsContent />
    </RequireAuth>
  );
}
