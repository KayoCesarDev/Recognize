import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, MapPin, Loader2, ShieldCheck, Star, ChevronDown, ChevronUp, Instagram, Linkedin, Link as LinkIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useState } from 'react';
import VerifiedBadge from '@/components/verification/VerifiedBadge';
import { ensureArray } from '@/lib/utils';

export default function AdminVerificacoes() {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profilesData = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-recognition_count', 500),
  });
  const profiles = ensureArray(profilesData);

  if (user && user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-medium text-lg">Acesso restrito a administradores.</p>
      </div>
    );
  }

  const pendingPaid = profiles.filter(p => p.verification_requested && !p.verified_paid);
  const verifiedProfiles = profiles.filter(p => p.verified || p.verified_paid);
  const unverified = profiles.filter(p => !p.verified && !p.verified_paid && !p.verification_requested);

  const approve = async (profile, type) => {
    setLoadingId(profile.id + type);
    if (type === 'paid') {
      await base44.entities.Profile.update(profile.id, { verified_paid: true, verification_requested: false });
      await base44.integrations.Core.SendEmail({
        to: profile.user_email,
        subject: '🌟 Seu perfil foi verificado no Reconheça!',
        body: `Olá ${profile.full_name}!\n\nParabéns! Seu perfil recebeu o Selo de Verificação Premium ⭐ no Reconheça.\n\nSua autenticidade foi confirmada pela nossa equipe. Agora seu nome aparece com destaque em todo o ranking!\n\nAcesse sua conta e confira: https://reconheca.com\n\nEquipe Reconheça`,
      });
      toast.success('✅ Verificação premium ativada! Email enviado ao usuário.');
    } else {
      await base44.entities.Profile.update(profile.id, { verified: true });
      await base44.integrations.Core.SendEmail({
        to: profile.user_email,
        subject: '✅ Seu perfil foi verificado no Reconheça!',
        body: `Olá ${profile.full_name}!\n\nSeu perfil recebeu o Selo de Verificação ✓ no Reconheça.\n\nAgora seu nome aparece com o selo azul em todo o ranking!\n\nEquipe Reconheça`,
      });
      toast.success('✅ Perfil verificado! Email enviado ao usuário.');
    }
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    setLoadingId(null);
  };

  const revoke = async (profile) => {
    setLoadingId(profile.id + 'revoke');
    await base44.entities.Profile.update(profile.id, {
      verified: false,
      verified_paid: false,
      verification_requested: false,
    });
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    toast.success('Verificação removida.');
    setLoadingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <ShieldCheck className="w-4 h-4" />
          Painel Admin
        </div>
        <h1 className="font-display text-3xl font-bold">Verificações</h1>
        <p className="text-muted-foreground">Gerencie os selos de autenticidade dos perfis</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{pendingPaid.length}</p>
          <p className="text-xs text-yellow-600 font-medium">Pendentes</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{verifiedProfiles.length}</p>
          <p className="text-xs text-green-600 font-medium">Verificados</p>
        </div>
        <div className="bg-secondary/50 border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{profiles.length}</p>
          <p className="text-xs text-muted-foreground font-medium">Total</p>
        </div>
      </div>

      {/* Solicitações Pendentes */}
      {pendingPaid.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Solicitações Pendentes ({pendingPaid.length})
          </h2>
          <div className="space-y-3">
            {pendingPaid.map(profile => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                onApproveManual={() => approve(profile, 'manual')}
                onApprovePaid={() => approve(profile, 'paid')}
                onRevoke={() => revoke(profile)}
                loadingId={loadingId}
                expanded={expandedId === profile.id}
                onToggle={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                showAll
                highlight
              />
            ))}
          </div>
        </div>
      )}

      {/* Perfis Verificados */}
      {verifiedProfiles.length > 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-blue-500" />
            Perfis Verificados ({verifiedProfiles.length})
          </h2>
          <div className="space-y-3">
            {verifiedProfiles.map(profile => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                onRevoke={() => revoke(profile)}
                loadingId={loadingId}
                expanded={expandedId === profile.id}
                onToggle={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Todos os perfis sem verificação */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          Sem Verificação ({unverified.length})
        </h2>
        {unverified.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">Todos os perfis estão verificados 🎉</p>
        ) : (
          <div className="space-y-3">
            {unverified.map(profile => (
              <ProfileRow
                key={profile.id}
                profile={profile}
                onApproveManual={() => approve(profile, 'manual')}
                onApprovePaid={() => approve(profile, 'paid')}
                loadingId={loadingId}
                expanded={expandedId === profile.id}
                onToggle={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
                showAll
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileRow({ profile, onApproveManual, onApprovePaid, onRevoke, loadingId, showAll, highlight, expanded, onToggle }) {
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isVerified = profile.verified || profile.verified_paid;
  const hasDetails = profile.verification_justification || profile.verification_links || profile.instagram || profile.linkedin;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-xl border ${highlight ? 'border-yellow-300 bg-white' : 'border-border/40 bg-background'} overflow-hidden`}
    >
      <div className="flex items-center gap-3 p-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={profile.photo_url} />
          <AvatarFallback className="text-sm font-bold bg-secondary">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold truncate text-sm">{profile.full_name}</p>
            <VerifiedBadge verified={profile.verified} verifiedPaid={profile.verified_paid} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3" />
              {profile.city}, {profile.state}
            </span>
            {profile.profession && <span>• {profile.profession}</span>}
            {profile.verification_requested && !profile.verified_paid && (
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 text-xs py-0">Aguardando aprovação</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasDetails && (
            <Button size="sm" variant="ghost" className="text-xs px-2" onClick={onToggle}>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          {showAll && !isVerified && onApproveManual && (
            <Button
              size="sm"
              variant="outline"
              className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs px-2"
              onClick={onApproveManual}
              disabled={!!loadingId}
            >
              {loadingId === profile.id + 'manual' ? <Loader2 className="w-3 h-3 animate-spin" /> : '✓ Verificar'}
            </Button>
          )}
          {!profile.verified_paid && onApprovePaid && (
            <Button
              size="sm"
              variant="outline"
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 text-xs px-2"
              onClick={onApprovePaid}
              disabled={!!loadingId}
            >
              {loadingId === profile.id + 'paid' ? <Loader2 className="w-3 h-3 animate-spin" /> : '⭐ Premium'}
            </Button>
          )}
          {isVerified && onRevoke && (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive text-xs px-2"
              onClick={onRevoke}
              disabled={!!loadingId}
            >
              {loadingId === profile.id + 'revoke' ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Detalhes expandidos */}
      <AnimatePresence>
        {expanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/40 pt-3">
              {profile.verification_justification && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Justificativa:</p>
                  <p className="text-sm bg-secondary/50 rounded-lg p-3">{profile.verification_justification}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    {profile.instagram}
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
              {profile.verification_links && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> Links / Referências:
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap bg-secondary/30 rounded-lg p-2">{profile.verification_links}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
