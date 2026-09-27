import { Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function WorldCard() {
  return (
    <Card title="Universo & Regras" icon={<Globe size={20} />}>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 h-44 bg-emerald-100 rounded-xl border border-cozy-card-border flex items-center justify-center relative overflow-hidden">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-200/80 px-2 py-1 rounded shadow">
            📍 Cidade do Vale
          </span>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-200/80 px-2 py-1 rounded shadow absolute bottom-4 right-4">
            📍 Cachoeira do Mistério
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-cozy-brown">Regras:</h4>
          <ul className="list-disc pl-4 space-y-1 text-stone-600">
            <li>Magia Elementar</li>
            <li>Religião Lunar</li>
            <li>Política Feudal</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}