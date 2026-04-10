import { motion } from 'framer-motion';
import { Crown, Medal, Award } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import VerifiedBadge from '@/components/verification/VerifiedBadge';

const podiumConfig = [
  { place: 1, height: 'h-32', icon: Crown, color: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-400', size: 'w-20 h-20', delay: 0.2 },
  { place: 2, height: 'h-24', icon: Medal, color: 'from-slate-300 to-slate-400', ring: 'ring-slate-300', size: 'w-16 h-16', delay: 0.4 },
  { place: 3, height: 'h-20', icon: Award, color: 'from-amber-600 to-amber-700', ring: 'ring-amber-600', size: 'w-14 h-14', delay: 0.6 },
];

// Display order: 2nd, 1st, 3rd
const displayOrder = [1, 0, 2];

export default function RankingPodium({ topThree }) {
  if (!topThree || topThree.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 py-8">
      {displayOrder.map((orderIdx) => {
        const config = podiumConfig[orderIdx];
        const profile = topThree[orderIdx];
        if (!profile) return <div key={orderIdx} className="w-24" />;
        const Icon = config.icon;
        const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

        return (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: config.delay, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-2">
              <Avatar className={`${config.size} ring-4 ${config.ring} ring-offset-2 ring-offset-background`}>
                <AvatarImage src={profile.photo_url} alt={profile.full_name} />
                <AvatarFallback className="text-lg font-bold bg-secondary">{initials}</AvatarFallback>
              </Avatar>
              <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm text-center max-w-[90px] truncate">{profile.full_name}</p>
              <VerifiedBadge verified={profile.verified} verifiedPaid={profile.verified_paid} />
            </div>
            <p className="text-xs text-muted-foreground">{profile.city}</p>
            <div className={`mt-2 w-24 md:w-28 ${config.height} rounded-t-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-2xl">{config.place}º</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-primary">{profile.recognition_count || 0} votos</p>
          </motion.div>
        );
      })}
    </div>
  );
}