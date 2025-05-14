// src/app/cliente/meus-chamados/page.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

// Enum para filtro de status
enum StatusFilter {
  TODOS = 'TODOS',
  ABERTO = 'ABERTO',
  EM_ANALISE = 'EM_ANALISE',
  EM_ATENDIMENTO = 'EM_ATENDIMENTO',
  AGUARDANDO_CLIENTE = 'AGUARDANDO_CLIENTE',
  RESOLVIDO = 'RESOLVIDO',
  FECHADO = 'FECHADO'
}

// Componente de status visuais
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColorClasses = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EM_ANALISE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'EM_ATENDIMENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'AGUARDANDO_CLIENTE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESOLVIDO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FECHADO':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return 'Aberto';
      case 'EM_ANALISE':
        return 'Em Análise';
      case 'EM_ATENDIMENTO':
        return 'Em Atendimento';
      case 'AGUARDANDO_CLIENTE':
        return 'Aguardando Cliente';
      case 'RESOLVIDO':
        return 'Resolvido';
      case 'FECHADO':
        return 'Fechado';
      default:
        return status;
    }
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColorClasses(status)}`}>
      {getStatusDisplayName(status)}
    </span>
  );
};

export default function MeusChamadosPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(StatusFilter.TODOS);
  
  // Chamados simulados (vazio para demonstração)
  const chamados: any[] = [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Meus Chamados</h2>
          <p className="text-slate-600 mt-1">Visualize e gerencie seus chamados de suporte.</p>
        </div>
        <Button onClick={() => window.location.href = '/cliente/abrir-chamado'}>
          Novo Chamado
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={statusFilter === StatusFilter.TODOS ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.TODOS)}
            size="sm"
          >
            Todos
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.ABERTO ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.ABERTO)}
            size="sm"
          >
            Abertos
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.EM_ATENDIMENTO ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.EM_ATENDIMENTO)}
            size="sm"
          >
            Em Atendimento
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.AGUARDANDO_CLIENTE ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.AGUARDANDO_CLIENTE)}
            size="sm"
          >
            Aguardando Você
          </Button>
          <Button 
            variant={statusFilter === StatusFilter.RESOLVIDO ? 'default' : 'outline'}
            onClick={() => setStatusFilter(StatusFilter.RESOLVIDO)}
            size="sm"
          >
            Resolvidos
          </Button>
        </div>
      </div>

      {/* Lista de chamados */}
      {chamados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-medium text-slate-700 mt-4">Nenhum chamado encontrado</h3>
            <p className="text-slate-500 mt-2">Você ainda não possui chamados registrados.</p>
            <Button className="mt-4" onClick={() => window.location.href = '/cliente/abrir-chamado'}>
              Abrir Novo Chamado
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Aqui seria renderizada a lista de chamados */}
        </div>
      )}

      {/* Alerta informativo */}
      <Alert variant="info" title="Dica">
        Você pode filtrar seus chamados por status clicando nos botões acima. Para mais detalhes sobre um chamado específico, clique nele para ver seu histórico completo.
      </Alert>
    </div>
  );
}