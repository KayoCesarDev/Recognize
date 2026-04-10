import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function LocationFilter({ state, city, cities, onStateChange, onCityChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 flex-1">
        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select value={state || "all"} onValueChange={onStateChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos os estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os estados</SelectItem>
            {STATES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {cities && cities.length > 0 && (
        <Select value={city || "all"} onValueChange={onCityChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}