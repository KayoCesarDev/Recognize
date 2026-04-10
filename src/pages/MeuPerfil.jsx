import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User, MapPin, Save, Loader2, Camera, ThumbsUp, Trophy, Images, ExternalLink, Instagram, Linkedin } from 'lucide-react';
import FeedGrid from '@/components/feed/FeedGrid';
import AddPostButton from '@/components/feed/AddPostButton';
import VerifiedBadge from '@/components/verification/VerifiedBadge';
import RequestVerificationButton from '@/components/verification/RequestVerificationButton';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function MeuPerfil() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    photo_url: '',
    state: '',
    city: '',
    profession: '',
    instagram: '',
    linkedin: '',
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-recognition_count', 500),
    enabled: !!user,
  });

  const myProfile = profiles.find(p => p.user_email === user?.email);

  useEffect(() => {
    if (myProfile) {
      setForm({
        full_name: myProfile.full_name || '',
        bio: myProfile.bio || '',
        photo_url: myProfile.photo_url || '',
        state: myProfile.state || '',
        city: myProfile.city || '',
        profession: myProfile.profession || '',
        instagram: myProfile.instagram || '',
        linkedin: myProfile.linkedin || '',
      });
    } else if (user) {
      setForm(prev => ({ ...prev, full_name: user.full_name || '' }));
    }
  }, [myProfile, user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, photo_url: file_url }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.state || !form.city) {
      toast.error('Preencha nome, estado e cidade');
      return;
    }
    setSaving(true);
    const data = { ...form, user_email: user.email };

    if (myProfile) {
      await base44.entities.Profile.update(myProfile.id, data);
    } else {
      await base44.entities.Profile.create({ ...data, recognition_count: 0 });
    }

    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    toast.success(myProfile ? 'Perfil atualizado!' : 'Perfil criado com sucesso!');
    setSaving(false);
  };

  const initials = form.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // Find rank
  const myRank = myProfile ? profiles.findIndex(p => p.id === myProfile.id) + 1 : null;

  const { data: myFeedPosts = [], isLoading: loadingFeed } = useQuery({
    queryKey: ['feedposts', myProfile?.id],
    queryFn: () => base44.entities.FeedPost.filter({ profile_id: myProfile.id }, '-created_date', 100),
    enabled: !!myProfile?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-2">
          <h1 className="font-display text-3xl font-bold">Meu Perfil</h1>
          {myProfile && (
            <div className="flex items-center gap-2">
              <VerifiedBadge verified={myProfile.verified} verifiedPaid={myProfile.verified_paid} size="md" />
              <Link
                to={`/perfil/${myProfile.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                Ver perfil público
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mb-8">
          {myProfile ? 'Edite suas informações' : 'Crie seu perfil para aparecer no ranking'}
        </p>

        {/* Stats bar */}
        {myProfile && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{myProfile.recognition_count || 0}</p>
                <p className="text-xs text-muted-foreground">Reconhecimentos</p>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xl font-bold">{myRank ? `${myRank}º` : '-'}</p>
                <p className="text-xs text-muted-foreground">No Ranking</p>
              </div>
            </div>
          </div>
        )}

        {/* Photo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar className="w-28 h-28 ring-4 ring-border ring-offset-2 ring-offset-background">
              <AvatarImage src={form.photo_url} />
              <AvatarFallback className="text-2xl font-bold bg-secondary">{initials || <User className="w-8 h-8" />}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5">
          <div>
            <Label>Nome completo *</Label>
            <Input value={form.full_name} onChange={e => setForm(prev => ({ ...prev, full_name: e.target.value }))} placeholder="Seu nome completo" className="mt-1.5" />
          </div>

          <div>
            <Label>Profissão</Label>
            <Input value={form.profession} onChange={e => setForm(prev => ({ ...prev, profession: e.target.value }))} placeholder="Ex: Estudante, Professor, Empreendedor..." className="mt-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estado *</Label>
              <Select value={form.state} onValueChange={v => setForm(prev => ({ ...prev, state: v }))}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade *</Label>
              <Input value={form.city} onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))} placeholder="Sua cidade" className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Conte um pouco sobre você..."
              className="mt-1.5 h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </Label>
              <Input
                value={form.instagram}
                onChange={e => setForm(prev => ({ ...prev, instagram: e.target.value }))}
                placeholder="@seu_usuario"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </Label>
              <Input
                value={form.linkedin}
                onChange={e => setForm(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="linkedin.com/in/voce"
                className="mt-1.5"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {myProfile ? 'Salvar Alterações' : 'Criar Perfil'}
          </Button>
        </div>
        {/* Verificação */}
        {myProfile && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 mt-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">Status de Verificação</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {myProfile.verified_paid ? 'Seu perfil tem verificação premium ⭐' :
                 myProfile.verified ? 'Seu perfil foi verificado pelo admin ✓' :
                 myProfile.verification_requested ? 'Sua solicitação está em análise...' :
                 'Verifique seu perfil para ganhar mais credibilidade'}
              </p>
            </div>
            <RequestVerificationButton profile={myProfile} />
          </div>
        )}

        {/* Feed Section */}
        {myProfile && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Images className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Minhas Fotos</h2>
                {myFeedPosts.length > 0 && (
                  <span className="text-sm text-muted-foreground">{myFeedPosts.length} publicações</span>
                )}
              </div>
              <AddPostButton profileId={myProfile.id} userEmail={user?.email} />
            </div>
            {myFeedPosts.length > 0 ? (
              <FeedGrid posts={myFeedPosts} />
            ) : (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <Images className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Nenhuma foto ainda</p>
                <p className="text-xs mt-1">Clique em "Adicionar foto" para publicar</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}