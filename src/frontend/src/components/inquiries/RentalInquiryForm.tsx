import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useCreateInquiry } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar } from 'lucide-react';

interface RentalInquiryFormProps {
  listingId: bigint;
}

export default function RentalInquiryForm({ listingId }: RentalInquiryFormProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const createMutation = useCreateInquiry();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!startDate) newErrors.startDate = 'La date de début est requise';
    if (!endDate) newErrors.endDate = 'La date de fin est requise';
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      newErrors.endDate = 'La date de fin doit être après la date de début';
    }
    if (!message.trim()) newErrors.message = 'Un message est requis';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createMutation.mutateAsync({
        listingId,
        startDate,
        endDate,
        message: message.trim(),
      });
      toast.success('Demande envoyée avec succès');
      setStartDate('');
      setEndDate('');
      setMessage('');
      setErrors({});
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'envoi de la demande');
    }
  };

  if (!identity) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          Connectez-vous pour envoyer une demande de location
        </p>
        <Button
          onClick={login}
          disabled={loginStatus === 'logging-in'}
          className="w-full"
          size="lg"
        >
          Se Connecter
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="startDate">Date de début</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
      </div>

      <div>
        <Label htmlFor="endDate">Date de fin</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate}</p>}
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Présentez-vous et expliquez votre demande..."
          rows={4}
        />
        {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
      </div>

      <Button type="submit" disabled={createMutation.isPending} className="w-full" size="lg">
        {createMutation.isPending ? 'Envoi...' : 'Envoyer la demande'}
      </Button>
    </form>
  );
}
