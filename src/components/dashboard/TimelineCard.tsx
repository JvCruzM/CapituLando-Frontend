import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TimelineCard() {
  return (
    <Card title="Timeline / Signos" icon={<Calendar size={20} />}>
      <div className="text-xs space-y-2">
        <div className="flex justify-between font-bold border-b pb-1 border-cozy-card-border">
          <span>&lt; Maio 2024 &gt;</span>
        </div>
        
        <div className="space-y-1 text-stone-600">
          <p><strong>Personagem:</strong> Anya</p>
          <p><strong>Signo:</strong> Gêmeos</p>
          <p><strong>Data:</strong> 12 Maio 1999</p>
        </div>

        <div className="pt-2 border-t border-cozy-card-border space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cozy-brown"></div>
            <span>Nascimento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cozy-brown"></div>
            <span>Entrada na Academia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-cozy-brown"></div>
            <span>Encontro com o Sábio</span>
          </div>
        </div>
      </div>
    </Card>
  );
}