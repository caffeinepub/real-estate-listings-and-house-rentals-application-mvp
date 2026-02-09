import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetListing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ListingPhotoGallery from '../components/listings/ListingPhotoGallery';
import RentalInquiryForm from '../components/inquiries/RentalInquiryForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { formatPrice, formatArea } from '../lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { ListingType } from '../backend';

export default function ListingDetailsPage() {
  const { id } = useParams({ from: '/listing/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: listing, isLoading, error } = useGetListing(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-[500px] w-full mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Annonce introuvable</h2>
        <p className="text-muted-foreground mb-6">Cette propriété n'existe pas ou a été supprimée.</p>
        <Button onClick={() => navigate({ to: '/' })}>Retour aux annonces</Button>
      </div>
    );
  }

  const statusLabels = {
    available: 'Disponible',
    sold: 'Vendu',
    rented: 'Loué',
    temporarilyUnavailable: 'Temporairement indisponible',
  };

  const propertyTypeLabels = {
    house: 'Maison',
    apartment: 'Appartement',
    studio: 'Studio',
    land: 'Terrain',
    other: 'Autre',
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux annonces
        </Button>

        {/* Photo Gallery */}
        <ListingPhotoGallery photos={listing.photos} title={listing.title} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {listing.address.street && `${listing.address.street}, `}
                      {listing.address.neighborhood && `${listing.address.neighborhood}, `}
                      {listing.address.city}
                    </span>
                  </div>
                </div>
                <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                  {statusLabels[listing.status]}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span>{Number(listing.bedrooms)} chambres</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span>{Number(listing.bathrooms)} salles de bain</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted-foreground" />
                  <span>{formatArea(Number(listing.areaSqm))}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {listing.amenities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Équipements</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h2 className="text-2xl font-semibold mb-2">Type de propriété</h2>
              <p className="text-muted-foreground">{propertyTypeLabels[listing.propertyType]}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatPrice(Number(listing.price), listing.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {listing.listingType === ListingType.rent ? 'par mois' : ''}
                  </div>
                </div>

                {listing.listingType === ListingType.rent && listing.status === 'available' && (
                  <RentalInquiryForm listingId={listing.id} />
                )}

                {listing.listingType === ListingType.sale && listing.status === 'available' && (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Contacter le propriétaire
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      Connectez-vous pour envoyer un message
                    </p>
                  </div>
                )}

                {listing.status !== 'available' && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Cette propriété n'est plus disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
