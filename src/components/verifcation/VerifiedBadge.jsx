import { BadgeCheck, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function VerifiedBadge({ verified, verifiedPaid, size = 'sm' }) {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (verifiedPaid) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center">
              <BadgeCheck className={`${iconSize} text-yellow-500 fill-yellow-100`} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Perfil Verificado Premium ⭐</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (verified) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center">
              <BadgeCheck className={`${iconSize} text-blue-500 fill-blue-100`} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Perfil Verificado ✓</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}