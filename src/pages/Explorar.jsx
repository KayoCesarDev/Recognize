import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ThumbsUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import LocationFilter from '@/components/ranking/LocationFilter';
import VerifiedBadge from '@/components/verification/VerifiedBadge';
import { ensureArray } from '@/lib/utils';

export default function Explorar() {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-recognition_count', 500),
  });
  const profiles = ensureArray(profilesData);

  const cities = useMemo(() => {
    if (selectedState === 'all') return [];
    return [...new Set(profiles.filter(p => p.state === selectedState).map(p => p.city).filter(Boolean))].sort();
  }, [profiles, selectedState]);

  const filtered = useMemo(() => {
    return profiles.filter(p => {
      if (selectedState !== 'all' && p.state !== selectedState) return false;
      if (selectedCity !== 'all' && p.city !== selectedCity) return false;
      if (search) {
        const q = search.toLowerCase();
        return (p.full_name?.toLowerCase().includes(q) || p.profession?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q));
      }
      return true;
    });
  }, [profiles, selectedState, selectedCity, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Explorar Pessoas</h1>
        <p className="text-muted-foreground">Encontre e reconheça pessoas incríveis</p>
      </div>

      <div className="space-y-3 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, profissão ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <LocationFilter
          state={selectedState}
          city={selectedCity}
          cities={cities}
          onStateChange={(v) => { setSelectedState(v); setSelectedCity('all'); }}
          onCityChange={setSelectedCity}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((profile, i) => {
            const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  to={`/perfil/${profile.id}`}
                  className="block bg-card rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={profile.photo_url} />
                      <AvatarFallback className="bg-secondary font-bold text-lg">{initials}</AvatarFallback>
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
                  </div>
                  {profile.profession && (
                    <Badge variant="secondary" className="mb-2">{profile.profession}</Badge>
                  )}
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-3 text-primary font-semibold text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    {profile.recognition_count || 0} reconhecimentos
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Nenhuma pessoa encontrada</p>
          <p className="text-sm">Tente ajustar sua busca</p>
        </div>
      )}
    </div>
  );
}
