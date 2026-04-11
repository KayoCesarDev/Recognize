import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import RankingPodium from '@/components/ranking/RankingPodium';
import RankingListItem from '@/components/ranking/RankingListItem';
import LocationFilter from '@/components/ranking/LocationFilter';
import { ensureArray } from '@/lib/utils';

export default function Ranking() {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const { data: profilesData, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.Profile.list('-recognition_count', 500),
  });
  const profiles = ensureArray(profilesData);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (selectedState !== 'all' && p.state !== selectedState) return false;
      if (selectedCity !== 'all' && p.city !== selectedCity) return false;
      return true;
    });
  }, [profiles, selectedState, selectedCity]);

  const cities = useMemo(() => {
    if (selectedState === 'all') return [];
    return [...new Set(profiles.filter(p => p.state === selectedState).map(p => p.city).filter(Boolean))].sort();
  }, [profiles, selectedState]);

  const topThree = filteredProfiles.slice(0, 3);
  const restList = filteredProfiles.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Trophy className="w-4 h-4" />
          Ranking
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
          Ranking de Reconhecimento
        </h1>
        <p className="text-muted-foreground">
          As pessoas mais reconhecidas, filtradas por localidade
        </p>
      </div>

      {/* Location Filter */}
      <div className="bg-card rounded-2xl border border-border/50 p-4 mb-8">
        <LocationFilter
          state={selectedState}
          city={selectedCity}
          cities={cities}
          onStateChange={(v) => { setSelectedState(v); setSelectedCity('all'); }}
          onCityChange={setSelectedCity}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Podium */}
          {topThree.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/50 p-4 mb-6 overflow-hidden">
              <RankingPodium topThree={topThree} />
            </div>
          )}

          {/* List */}
          <div className="space-y-2">
            {restList.map((profile, i) => (
              <RankingListItem key={profile.id} profile={profile} rank={i + 4} index={i} />
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Nenhum resultado encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de localidade</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
