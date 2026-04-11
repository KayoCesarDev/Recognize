import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, ThumbsUp, Heart, ArrowLeft, Briefcase, Trophy, Images } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import RecognitionModal from '@/components/recognition/RecognitionModal';
import FeedGrid from '@/components/feed/FeedGrid';
import VerifiedBadge from '@/components/verification/VerifiedBadge';
import RequestVerificationButton from '@/components/verification/RequestVerificationButton';
import { Instagram, Linkedin } from 'lucide-react';
import { ensureArray } from '@/lib/utils';

const categoryLabels = {
  lideranca: '🏅 Liderança',
  comunidade: '🤝 Comunidade',
  inovacao: '💡 Inovação',
  solidariedade: '❤️ Solidariedade',
  cultura: '🎨 Cultura',
  esporte: '⚽ Esporte',
  educacao: '📚 Educação',
  empreendedorismo: '🚀 Empreendedorismo',
};

export default function PerfilPublico() {
  const urlParams = new URLSearchParams(window.location.search);
  const pathParts = window.location.pathname.split('/');
  const profileId = pathParts[pathParts.length - 1];

  const [showRecognition, setShowRecognition] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profilesData = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-recognition_count', 500),
  });
  const profiles = ensureArray(profilesData);

  const profile = profiles.find(p => p.id === profileId);
  const rank = profile ? profiles.findIndex(p => p.id === profile.id) + 1 : null;
  const isOwnProfile = profile && user && profile.user_email === user.email;

  const { data: recognitionsData = [], isLoading: loadingRecognitions } = useQuery({
    queryKey: ['recognitions', profileId],
    queryFn: () => base44.entities.Recognition.filter({ to_profile_id: profileId }, '-created_date', 50),
    enabled: !!profileId,
  });
  const recognitions = ensureArray(recognitionsData);

  const { data: feedPostsData = [] } = useQuery({
    queryKey: ['feedposts', profileId],
    queryFn: () => base44.entities.FeedPost.filter({ profile_id: profileId }, '-created_date', 100),
    enabled: !!profileId,
  });
  const feedPosts = ensureArray(feedPostsData);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/ranking" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar ao Ranking
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={profile.photo_url} alt={profile.full_name} />
              <AvatarFallback className="text-2xl font-bold bg-secondary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
                {profile.full_name}
                <VerifiedBadge verified={profile.verified} verifiedPaid={profile.verified_paid} size="md" />
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>{profile.city}, {profile.state}</span>
              </div>
              {profile.profession && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-muted-foreground mt-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{profile.profession}</span>
                </div>
              )}
              {profile.bio && (
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{profile.bio}</p>
              )}
              {/* Redes sociais */}
              {(profile.instagram || profile.linkedin) && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 transition-colors font-medium"
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
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{profile.recognition_count || 0}</p>
              <p className="text-xs text-muted-foreground">Reconhecimentos</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 text-accent mb-1">
                <Trophy className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{rank ? `${rank}º` : '-'}</p>
              <p className="text-xs text-muted-foreground">No Ranking Geral</p>
            </div>
          </div>

          {/* Recognize Button / Verification */}
          <div className="flex flex-col gap-3 mt-6">
            {!isOwnProfile && (
              <Button onClick={() => setShowRecognition(true)} className="w-full gap-2" size="lg">
                <Heart className="w-5 h-5" />
                Reconhecer esta pessoa
              </Button>
            )}
            {isOwnProfile && (
              <div className="flex justify-center">
                <RequestVerificationButton profile={profile} />
              </div>
            )}
          </div>
        </div>

        {/* Feed */}
        {feedPosts.length > 0 && (
          <div className="bg-card rounded-2xl border border-border/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Images className="w-5 h-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Fotos</h2>
              <span className="text-sm text-muted-foreground ml-auto">{feedPosts.length} publicações</span>
            </div>
            <FeedGrid posts={feedPosts} />
          </div>
        )}

        {/* Recognitions */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <h2 className="font-display text-xl font-bold mb-4">Reconhecimentos Recebidos</h2>
          {loadingRecognitions ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : recognitions.length > 0 ? (
            <div className="space-y-3">
              {recognitions.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-secondary/30 border border-border/30"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary">{categoryLabels[rec.category] || rec.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {rec.created_date && format(new Date(rec.created_date), "d 'de' MMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {rec.message && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{rec.message}"</p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Ainda não recebeu reconhecimentos</p>
            </div>
          )}
        </div>
      </motion.div>

      {profile && (
        <RecognitionModal
          open={showRecognition}
          onOpenChange={setShowRecognition}
          profile={profile}
          userEmail={user?.email}
        />
      )}
    </div>
  );
}
