// src/components/statistics/stats-overview.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';

interface StatsOverviewProps {
  data: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  };
}

export default function StatsOverview({ data }: StatsOverviewProps) {
  // Cálculo da taxa de resolução (chamados resolvidos dividido pelo total)
  const resolutionRate = data.total > 0 
    ? Math.round((data.resolved / data.total) * 100) 
    : 0;

  // Função para definir cores baseadas no valor
  const getColorClass = (value: number, type: 'text' | 'bg') => {
    if (type === 'text') {
      return value > 70 ? 'text-green-600' : 
             value > 40 ? 'text-yellow-600' : 
             'text-red-600';
    } else {
      return value > 70 ? 'bg-green-100' : 
             value > 40 ? 'bg-yellow-100' : 
             'bg-red-100';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Chamados Totais</span>
            <span className="text-3xl font-bold text-slate-900">{data.total}</span>
            <span className="text-xs text-slate-500 mt-1">
              Todos os chamados registrados
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Chamados Abertos</span>
            <span className="text-3xl font-bold text-blue-600">{data.open}</span>
            <span className="text-xs text-slate-500 mt-1">
              {Math.round((data.open / data.total) * 100) || 0}% do total
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Em Atendimento</span>
            <span className="text-3xl font-bold text-yellow-600">{data.inProgress}</span>
            <span className="text-xs text-slate-500 mt-1">
              {Math.round((data.inProgress / data.total) * 100) || 0}% do total
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Resolvidos</span>
            <span className="text-3xl font-bold text-green-600">{data.resolved}</span>
            <span className="text-xs text-slate-500 mt-1">
              {Math.round((data.resolved / data.total) * 100) || 0}% do total
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500">Taxa de Resolução</span>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${getColorClass(resolutionRate, 'text')}`}>
                {resolutionRate}%
              </span>
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getColorClass(resolutionRate, 'bg')} ${getColorClass(resolutionRate, 'text')}`}>
                {resolutionRate > 70 ? 'Excelente' : resolutionRate > 40 ? 'Regular' : 'Baixa'}
              </span>
            </div>
            <span className="text-xs text-slate-500 mt-1">
              Chamados resolvidos vs. total
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}