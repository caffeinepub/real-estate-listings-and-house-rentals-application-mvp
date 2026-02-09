import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import type { ListingFilters } from '../../backend';
import { ListingType, PropertyType } from '../../backend';

interface ListingFiltersBarProps {
  onFilterChange: (filters: ListingFilters | null) => void;
}

export default function ListingFiltersBar({ onFilterChange }: ListingFiltersBarProps) {
  const [searchText, setSearchText] = useState('');
  const [listingType, setListingType] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string>('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');

  const handleSearch = () => {
    const filters: ListingFilters = {};

    if (searchText.trim()) filters.searchText = searchText.trim();
    if (listingType) filters.listingType = listingType as ListingType;
    if (propertyType) filters.propertyType = propertyType as PropertyType;
    if (city.trim()) filters.city = city.trim();
    if (minPrice) filters.minPrice = BigInt(minPrice);
    if (maxPrice) filters.maxPrice = BigInt(maxPrice);
    if (minBedrooms) filters.minBedrooms = BigInt(minBedrooms);

    onFilterChange(Object.keys(filters).length > 0 ? filters : null);
  };

  const handleReset = () => {
    setSearchText('');
    setListingType('');
    setPropertyType('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    onFilterChange(null);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="search">Recherche</Label>
            <Input
              id="search"
              placeholder="Mots-clés..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <Label htmlFor="listingType">Type d'annonce</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger id="listingType">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tous</SelectItem>
                <SelectItem value={ListingType.sale}>Vente</SelectItem>
                <SelectItem value={ListingType.rent}>Location</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="propertyType">Type de propriété</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Tous" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tous</SelectItem>
                <SelectItem value={PropertyType.house}>Maison</SelectItem>
                <SelectItem value={PropertyType.apartment}>Appartement</SelectItem>
                <SelectItem value={PropertyType.studio}>Studio</SelectItem>
                <SelectItem value={PropertyType.land}>Terrain</SelectItem>
                <SelectItem value={PropertyType.other}>Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              placeholder="Ville..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <Label htmlFor="minPrice">Prix minimum</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <Label htmlFor="maxPrice">Prix maximum</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Illimité"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <Label htmlFor="minBedrooms">Chambres minimum</Label>
            <Input
              id="minBedrooms"
              type="number"
              placeholder="0"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          <Button onClick={handleReset} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
