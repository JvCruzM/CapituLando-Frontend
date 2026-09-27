import { User, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function CharacterCard() {
  return (
    <Card title="Personagem Destaque" icon={<User size={20} />}>
      <div className="flex gap-3 items-center">
        <div className="w-16 h-16 bg-amber-200 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xl text-cozy-brown">
          A
        </div>
        <div className="text-xs space-y-0.5">
          <h3 className="font-bold text-sm text-cozy-brown">Anya Silva</h3>
          <p><strong>Idade:</strong> 23</p>
          <p><strong>MBTI:</strong> INFJ</p>
          <p><strong>Motivação:</strong> Salvar sua terra natal</p>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-cozy-card-border flex items-center justify-between text-xs">
        <span>Relação de mistério: <strong>Ben (Amigo)</strong></span>
        <div className="flex text-rose-500 gap-0.5">
          <Heart size={14} fill="currentColor" />
          <Heart size={14} fill="currentColor" />
          <Heart size={14} fill="currentColor" />
          <Heart size={14} fill="currentColor" />
          <Heart size={14} className="text-stone-300" />
        </div>
      </div>
    </Card>
  );
}