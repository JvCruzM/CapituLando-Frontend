import { BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ProjectsCard() {
  return (
    <Card title="Projetos Atuais" icon={<BookOpen size={20} />}>
      <div className="space-y-3">
        <ProgressBar 
          title="O Guardião da Floresta" 
          percent={60} 
          subtitle="60% - 12 capítulos" 
          color="bg-emerald-600" 
        />
        <ProgressBar 
          title="Segredos de Algures" 
          percent={25} 
          subtitle="25% - 5 capítulos" 
          color="bg-amber-600" 
        />
      </div>
    </Card>
  );
}