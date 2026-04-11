import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users, MapPin, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import VerifiedBadge from '@/components/verification/VerifiedBadge';
import { ensureArray } from '@/lib/utils';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 p-6 flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { data: profilesData, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-recognition_count', 100),
  });
  const profiles = ensureArray(profilesData);

  const topProfiles = profiles.slice(0, 5);
  const uniqueStates = [...new Set(profiles.map(p => p.state).filter(Boolean))];
  const uniqueCities = [...new Set(profiles.map(p => p.city).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Star className="w-4 h-4" />
          Plataforma de Reconhecimento
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
          Descubra as pessoas mais<br />
          <span className="text-primary">reconhecidas</span> do Brasil
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Vote, reconheça e celebre as pessoas que fazem a diferença na sua cidade e no seu estado.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link to="/ranking">
            <Button size="lg" className="gap-2 text-base px-8">
              <Trophy className="w-5 h-5" />
              Ver Ranking
            </Button>
          </Link>
          <Link to="/perfil">
            <Button size="lg" variant="outline" className="gap-2 text-base px-8">
              Criar Meu Perfil
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        <StatCard icon={Users} label="Pessoas cadastradas" value={profiles.length} color="bg-primary" />
        <StatCard icon={MapPin} label="Estados representados" value={uniqueStates.length} color="bg-accent" />
        <StatCard icon={TrendingUp} label="Cidades ativas" value={uniqueCities.length} color="bg-chart-3" />
      </div>

      {/* Top 5 */}
      <div className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold">Top Reconhecidos</h2>
            <p className="text-sm text-muted-foreground">As pessoas mais reconhecidas da plataforma</p>
          </div>
          <Link to="/ranking">
            <Button variant="ghost" className="gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topProfiles.map((profile, i) => {
              const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/perfil/${profile.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-all group"
                  >
                    <span className={`w-8 text-center font-bold text-lg ${
                      i === 0 ? 'text-yellow-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                    }`}>
                      {i + 1}º
                    </span>
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profile.photo_url} />
                      <AvatarFallback className="bg-secondary font-semibold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold truncate group-hover:text-primary transition-colors">{profile.full_name}</p>
                        <VerifiedBadge verified={profile.verified} verifiedPaid={profile.verified_paid} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {profile.city}, {profile.state}
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-0 font-bold">
                      {profile.recognition_count || 0} votos
                    </Badge>
                  </Link>
                </motion.div>
              );
            })}
            {topProfiles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Nenhuma pessoa cadastrada ainda.</p>
                <p className="text-sm">Seja o primeiro a criar seu perfil!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
