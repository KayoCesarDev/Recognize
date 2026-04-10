import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeCheck, CreditCard, Loader2, CheckCircle2, Instagram, Linkedin, Link as LinkIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RequestVerificationButton({ profile }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [justification, setJustification] = useState('');
  const [links, setLinks] = useState('');
  const [instagram, setInstagram] = useState(profile?.instagram || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin || '');
  const queryClient = useQueryClient();

  if (profile?.verified || profile?.verified_paid) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700">
        <CheckCircle2 className="w-4 h-4" />
        {profile.verified_paid ? '⭐ Verificado Premium' : '✓ Perfil Verificado'}
      </div>
    );
  }

  if (profile?.verification_requested) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700">
        <BadgeCheck className="w-4 h-4" />
        Verificação em análise pelo admin...
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!justification.trim()) {
      toast.error('Preencha a justificativa antes de enviar');
      return;
    }
    setLoading(true);
    await base44.entities.Profile.update(profile.id, {
      verification_requested: true,
      verification_justification: justification,
      verification_links: links,
      instagram,
      linkedin,
    });
    await base44.integrations.Core.SendEmail({
      to: 'admin@reconheca.com.br',
      subject: `🔔 Nova solicitação de verificação - ${profile.full_name}`,
      body: `Usuário: ${profile.full_name} (${profile.user_email})\nCidade: ${profile.city}, ${profile.state}\nProfissão: ${profile.profession || '-'}\n\nJustificativa:\n${justification}\n\nLinks/Redes:\n${links || '-'}\nInstagram: ${instagram || '-'}\nLinkedIn: ${linkedin || '-'}\n\nID do Perfil: ${profile.id}\n\nAcesse o painel: /admin/verificacoes`,
    });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    toast.success('Solicitação enviada! Entraremos em contato em breve.');
    setOpen(false);
    setLoading(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2 border-yellow-400 text-yellow-600 hover:bg-yellow-50">
        <BadgeCheck className="w-4 h-4" />
        Verificar Perfil
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-yellow-500" />
              Solicitar Verificação Premium
            </DialogTitle>
            <DialogDescription>
              Comprove sua autenticidade e ganhe o selo ⭐ no seu perfil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Benefícios */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-yellow-800 text-sm">O que você ganha:</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ Selo dourado ⭐ visível em todo o ranking</li>
                <li>✅ Identidade autenticada pela equipe</li>
                <li>✅ Mais confiança e credibilidade</li>
                <li>✅ Destaque no perfil público</li>
              </ul>
              <div className="pt-2 border-t border-yellow-200 flex items-center justify-between">
                <span className="text-yellow-800 font-bold text-xl">R$ 35,00</span>
                <span className="text-xs text-yellow-600">pagamento único</span>
              </div>
            </div>

            {/* Formulário de comprovação */}
            <div>
              <Label className="text-sm font-semibold">Por que você merece ser verificado? *</Label>
              <Textarea
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Ex: Sou professor com 15 anos de carreira, fundador da ONG X, atleta profissional registrado na federação Y..."
                className="mt-1.5 h-24 resize-none text-sm"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </Label>
              <Input
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@seu_usuario"
                className="mt-1.5 text-sm"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </Label>
              <Input
                value={linkedin}
                onChange={e => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/seu-perfil"
                className="mt-1.5 text-sm"
              />
            </div>

            <div>
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <LinkIcon className="w-3.5 h-3.5" /> Links de mídia / referências
              </Label>
              <Textarea
                value={links}
                onChange={e => setLinks(e.target.value)}
                placeholder="Links de notícias, reportagens, site pessoal, canal do YouTube, etc."
                className="mt-1.5 h-20 resize-none text-sm"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !justification.trim()}
              className="w-full gap-2 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Enviar Solicitação
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Nossa equipe analisará suas informações e entrará em contato em até 2 dias úteis para confirmar o pagamento e ativar o selo.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}