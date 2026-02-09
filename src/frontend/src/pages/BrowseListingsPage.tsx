import { useState } from 'react';
import { useGetListings } from '../hooks/useQueries';
import ListingCard from '../components/listings/ListingCard';
import ListingFiltersBar from '../components/listings/ListingFiltersBar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Grid3x3, List } from 'lucide-react';
import type { ListingFilters } from '../backend';
import { Skeleton } from '@/components/ui/skeleton';

export default function BrowseListingsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState<ListingFilters | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const pageSize = 12;

  const { data, isLoading, error } = useGetListings(pageSize, pageNumber, filters);

  const totalPages = data ? Math.ceil(Number(data.totalCount) / pageSize) : 0;

  const handleFilterChange = (newFilters: ListingFilters | null) => {
    setFilters(newFilters);
    setPageNumber(1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="/assets/generated/realty-hero.dim_1600x600.png"
          alt="Find your dream home"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Trouvez Votre Maison Idéale</h1>
            <p className="text-xl md:text-2xl text-white/90">Des milliers d'annonces immobilières à votre portée</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-8">
          <ListingFiltersBar onFilterChange={handleFilterChange} />
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-muted-foreground">
            {data && (
              <span>
                {Number(data.totalCount)} {Number(data.totalCount) === 1 ? 'propriété trouvée' : 'propriétés trouvées'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">Une erreur s'est produite lors du chargement des annonces.</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && data && data.listings.length === 0 && (
          <div className="text-center py-16">
            <img
              src="/assets/generated/realty-empty-search.dim_900x600.png"
              alt="Aucun résultat"
              className="w-full max-w-md mx-auto mb-6"
            />
            <h3 className="text-2xl font-semibold mb-2">Aucune propriété trouvée</h3>
            <p className="text-muted-foreground mb-6">Essayez d'ajuster vos filtres de recherche</p>
            <Button onClick={() => handleFilterChange(null)}>Réinitialiser les filtres</Button>
          </div>
        )}

        {/* Listings Grid/List */}
        {!isLoading && !error && data && data.listings.length > 0 && (
          <>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {data.listings.map((listing) => (
                <ListingCard key={listing.id.toString()} listing={listing} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pageNumber} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNumber === totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
