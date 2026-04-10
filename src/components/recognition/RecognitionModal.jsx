import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'lideranca', label: '🏅 Liderança' },
  { value: 'comunidade', label: '🤝 Comunidade' },
  { value: 'inovacao', label: '💡 Inovação' },
  { value: 'solidariedade', label: '❤️ Solidariedade' },
  { value: 'cultura', label: '🎨 Cultura' },
  { value: 'esporte', label: '⚽ Esporte' },
  { value: 'educacao', label: '📚 Educação' },
  { value: 'empreendedorismo', label: '🚀 Empreendedorismo' },
];

export default function RecognitionModal({ open, onOpenChange, profile, userEmail }) {
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!category) return;
    setLoading(true);
    
    await base44.entities.Recognition.create({
      from_email: userEmail,
      to_profile_id: profile.id,
      to_name: profile.full_name,
      message,
      category,
    });

    await base44.entities.Profile.update(profile.id, {
      recognition_count: (profile.recognition_count || 0) + 1,
    });

    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['recognitions'] });
    toast.success('Reconhecimento enviado com sucesso!');
    setLoading(false);
    setCategory('');
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Reconhecer {profile?.full_name}
          </DialogTitle>
          <DialogDescription>
            Mostre seu reconhecimento por essa pessoa incrível
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Mensagem (opcional)</label>
            <Textarea
              placeholder="Por que você reconhece essa pessoa?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="h-24 resize-none"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!category || loading}
            className="w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Heart className="w-4 h-4 mr-2" />}
            Enviar Reconhecimento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}