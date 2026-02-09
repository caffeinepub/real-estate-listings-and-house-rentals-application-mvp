import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Listing } from '../../backend';
import { ListingType, PropertyType, ListingStatus } from '../../backend';

interface ListingFormProps {
  initialData?: Listing;
  onSubmit: (listing: Listing) => void;
  isSubmitting: boolean;
}

export default function ListingForm({ initialData, onSubmit, isSubmitting }: ListingFormProps) {
  const { identity } = useInternetIdentity();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData ? Number(initialData.price).toString() : '');
  const [currency, setCurrency] = useState(initialData?.currency || 'EUR');
  const [listingType, setListingType] = useState<ListingType>(initialData?.listingType || ListingType.sale);
  const [propertyType, setPropertyType] = useState<PropertyType>(initialData?.propertyType || PropertyType.house);
  const [status, setStatus] = useState<ListingStatus>(initialData?.status || ListingStatus.available);
  const [city, setCity] = useState(initialData?.address.city || '');
  const [neighborhood, setNeighborhood] = useState(initialData?.address.neighborhood || '');
  const [street, setStreet] = useState(initialData?.address.street || '');
  const [bedrooms, setBedrooms] = useState(initialData ? Number(initialData.bedrooms).toString() : '');
  const [bathrooms, setBathrooms] = useState(initialData ? Number(initialData.bathrooms).toString() : '');
  const [areaSqm, setAreaSqm] = useState(initialData ? Number(initialData.areaSqm).toString() : '');
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [amenityInput, setAmenityInput] = useState('');
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [photoInput, setPhotoInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Le titre est requis';
    if (!description.trim()) newErrors.description = 'La description est requise';
    if (!price || Number(price) <= 0) newErrors.price = 'Le prix doit être supérieur à 0';
    if (!city.trim()) newErrors.city = 'La ville est requise';
    if (!bedrooms || Number(bedrooms) < 0) newErrors.bedrooms = 'Le nombre de chambres est requis';
    if (!bathrooms || Number(bathrooms) < 0) newErrors.bathrooms = 'Le nombre de salles de bain est requis';
    if (!areaSqm || Number(areaSqm) <= 0) newErrors.areaSqm = 'La surface doit être supérieure à 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !identity) return;

    const listing: Listing = {
      id: initialData?.id || BigInt(0),
      title: title.trim(),
      description: description.trim(),
      price: BigInt(price),
      currency,
      listingType,
      propertyType,
      status,
      address: {
        city: city.trim(),
        neighborhood: neighborhood.trim() || undefined,
        street: street.trim() || undefined,
      },
      bedrooms: BigInt(bedrooms),
      bathrooms: BigInt(bathrooms),
      areaSqm: BigInt(areaSqm),
      amenities,
      photos,
      owner: initialData?.owner || identity.getPrincipal(),
      createdAt: initialData?.createdAt || BigInt(Date.now() * 1000000),
      updatedAt: BigInt(Date.now() * 1000000),
    };

    onSubmit(listing);
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const addPhoto = () => {
    if (photoInput.trim() && !photos.includes(photoInput.trim())) {
      setPhotos([...photos, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  const removePhoto = (photo: string) => {
    setPhotos(photos.filter((p) => p !== photo));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Informations Générales</h2>

          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Belle maison avec jardin"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre propriété..."
              rows={5}
            />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="listingType">Type d'annonce *</Label>
              <Select value={listingType} onValueChange={(v) => setListingType(v as ListingType)}>
                <SelectTrigger id="listingType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ListingType.sale}>Vente</SelectItem>
                  <SelectItem value={ListingType.rent}>Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="propertyType">Type de propriété *</Label>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                <SelectTrigger id="propertyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PropertyType.house}>Maison</SelectItem>
                  <SelectItem value={PropertyType.apartment}>Appartement</SelectItem>
                  <SelectItem value={PropertyType.studio}>Studio</SelectItem>
                  <SelectItem value={PropertyType.land}>Terrain</SelectItem>
                  <SelectItem value={PropertyType.other}>Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Prix *</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="150000"
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
            </div>

            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ListingStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ListingStatus.available}>Disponible</SelectItem>
                  <SelectItem value={ListingStatus.sold}>Vendu</SelectItem>
                  <SelectItem value={ListingStatus.rented}>Loué</SelectItem>
                  <SelectItem value={ListingStatus.temporarilyUnavailable}>Temporairement indisponible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Adresse</h2>

          <div>
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Paris"
            />
            {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="neighborhood">Quartier</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Marais"
              />
            </div>

            <div>
              <Label htmlFor="street">Rue</Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="123 Rue de Rivoli"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Caractéristiques</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bedrooms">Chambres *</Label>
              <Input
                id="bedrooms"
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="3"
              />
              {errors.bedrooms && <p className="text-sm text-destructive mt-1">{errors.bedrooms}</p>}
            </div>

            <div>
              <Label htmlFor="bathrooms">Salles de bain *</Label>
              <Input
                id="bathrooms"
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="2"
              />
              {errors.bathrooms && <p className="text-sm text-destructive mt-1">{errors.bathrooms}</p>}
            </div>

            <div>
              <Label htmlFor="areaSqm">Surface (m²) *</Label>
              <Input
                id="areaSqm"
                type="number"
                value={areaSqm}
                onChange={(e) => setAreaSqm(e.target.value)}
                placeholder="120"
              />
              {errors.areaSqm && <p className="text-sm text-destructive mt-1">{errors.areaSqm}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="amenityInput">Équipements</Label>
            <div className="flex gap-2">
              <Input
                id="amenityInput"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Parking, Jardin, Piscine..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {amenities.map((amenity) => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="photoInput">Photos (URLs)</Label>
            <div className="flex gap-2">
              <Input
                id="photoInput"
                value={photoInput}
                onChange={(e) => setPhotoInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
              />
              <Button type="button" onClick={addPhoto} variant="outline">
                Ajouter
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((photo) => (
                <Badge key={photo} variant="secondary" className="max-w-xs truncate">
                  {photo}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer l\'annonce'}
        </Button>
      </div>
    </form>
  );
}
