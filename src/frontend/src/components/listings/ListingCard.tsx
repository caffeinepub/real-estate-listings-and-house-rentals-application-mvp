import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Maximize, MapPin } from 'lucide-react';
import { formatPrice, formatArea } from '../../lib/formatters';
import type { Listing } from '../../backend';

interface ListingCardProps {
  listing: Listing;
  viewMode: 'grid' | 'list';
}

export default function ListingCard({ listing, viewMode }: ListingCardProps) {
  const navigate = useNavigate();

  const statusLabels = {
    available: 'Disponible',
    sold: 'Vendu',
    rented: 'Loué',
    temporarilyUnavailable: 'Indisponible',
  };

  const typeLabels = {
    sale: 'Vente',
    rent: 'Location',
  };

  if (viewMode === 'list') {
    return (
      <Card
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate({ to: '/listing/$id', params: { id: listing.id.toString() } })}
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            {listing.photos.length > 0 ? (
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-64 md:h-full object-cover"
              />
            ) : (
              <div className="w-full h-64 md:h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Aucune photo</span>
              </div>
            )}
          </div>
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-2xl font-bold mb-1">{listing.title}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.address.city}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{typeLabels[listing.listingType]}</Badge>
                <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
                  {statusLabels[listing.status]}
                </Badge>
              </div>
            </div>
            <p className="text-3xl font-bold text-primary mb-4">
              {formatPrice(Number(listing.price), listing.currency)}
            </p>
            <div className="flex gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-muted-foreground" />
                <span>{Number(listing.bedrooms)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-muted-foreground" />
                <span>{Number(listing.bathrooms)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Maximize className="h-5 w-5 text-muted-foreground" />
                <span>{formatArea(Number(listing.areaSqm))}</span>
              </div>
            </div>
            <p className="text-muted-foreground line-clamp-2">{listing.description}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate({ to: '/listing/$id', params: { id: listing.id.toString() } })}
    >
      <div className="relative">
        {listing.photos.length > 0 ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">Aucune photo</span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant="outline" className="bg-background/90 backdrop-blur">
            {typeLabels[listing.listingType]}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold line-clamp-1">{listing.title}</h3>
          <Badge variant={listing.status === 'available' ? 'default' : 'secondary'}>
            {statusLabels[listing.status]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
          <MapPin className="h-4 w-4" />
          <span>{listing.address.city}</span>
        </div>
        <p className="text-2xl font-bold text-primary mb-4">
          {formatPrice(Number(listing.price), listing.currency)}
        </p>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4 text-muted-foreground" />
            <span>{Number(listing.bedrooms)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4 text-muted-foreground" />
            <span>{Number(listing.bathrooms)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span>{formatArea(Number(listing.areaSqm))}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">
          Voir les détails
        </Button>
      </CardFooter>
    </Card>
  );
}
