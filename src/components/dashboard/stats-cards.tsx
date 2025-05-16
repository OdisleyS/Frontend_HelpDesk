// src/components/dashboard/stats-cards.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Chamados Abertos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              Todos atualizados
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Nenhum chamado pendente
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Em Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-yellow-500">0</div>
            <div className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
              0% do total
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Nenhum chamado em andamento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-500">
            Resolvidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="ml-2 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
              0% de taxa de resolução
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Nenhum chamado resolvido até o momento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}