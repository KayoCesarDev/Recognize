import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import VerifiedBadge from '@/components/verification/VerifiedBadge';

export default function RankingListItem({ profile, rank, index }) {
  const initials = profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/perfil/${profile.id}`}
        className="flex items-center gap-4 p-4 rounded-xl bg-card hover:bg-secondary/50 border border-border/50 transition-all group"
      >
        <div className="w-8 text-center">
          <span className="text-lg font-bold text-muted-foreground">{rank}</span>
        </div>
        <Avatar className="w-12 h-12">
          <AvatarImage src={profile.photo_url} alt={profile.full_name} />
          <AvatarFallback className="bg-secondary font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold truncate group-hover:text-primary transition-colors">{profile.full_name}</p>
            <VerifiedBadge verified={profile.verified} verifiedPaid={profile.verified_paid} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{profile.city}, {profile.state}</span>
          </div>
          {profile.profession && (
            <Badge variant="secondary" className="mt-1 text-xs">{profile.profession}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-primary font-bold">
          <ThumbsUp className="w-4 h-4" />
          <span>{profile.recognition_count || 0}</span>
        </div>
      </Link>
    </motion.div>
  );
}