export function formatPrice(price: number, currency: string): string {
  const currencySymbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = new Intl.NumberFormat('fr-FR').format(price);

  return `${formatted} ${symbol}`;
}

export function formatArea(areaSqm: number): string {
  return `${areaSqm} m²`;
}

export function formatCompactAddress(city: string, neighborhood?: string): string {
  if (neighborhood) {
    return `${neighborhood}, ${city}`;
  }
  return city;
}
