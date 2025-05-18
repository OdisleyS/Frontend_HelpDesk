'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import StatsOverview from '@/components/statistics/stats-overview';
import TicketsByStatusChart from '@/components/statistics/tickets-by-status-chart';
import TicketsByPriorityChart from '@/components/statistics/tickets-by-priority-chart';
import ResolutionTimeChart from '@/components/statistics/resolution-time-chart';
import TechnicianPerformanceTable from '@/components/statistics/technician-performance-table';
import SLAComplianceChart from '@/components/statistics/sla-compliance-chart';
import CategoryDistributionChart from '@/components/statistics/category-distribution-chart';

// Interface para os dados otimizados do dashboard
interface DashboardStats {
  totalChamados: number;
  chamadosAbertos: number;
  chamadosEmAnalise: number;
  chamadosEmAtendimento: number;
  chamadosAguardandoCliente: number;
  chamadosResolvidos: number;
  chamadosFechados: number;
  chamadosBaixa: number;
  chamadosMedia: number;
  chamadosAlta: number;
  slaConformidade: number;
  usuariosAtivos: number;
}

// Interface para tempo médio de resolução por categoria
interface ResolutionTime {
  nome: string;
  valor: number;
}

// Interface para desempenho de técnico
interface TechnicianPerformance {
  nome: string;
  atribuidos: number;
  resolvidos: number;
  taxa: string;
  avgHours: number;
  classificacao: string;
}

// Interface para categoria distribuição
interface CategoryDistributionItem {
  nome: string;
  quantidade: number;
  percentual: number;
}

// Interface para o objeto de estatísticas consolidado
interface StatsData {
  dashboardStats: DashboardStats;
  byStatus: {
    ABERTO: number;
    EM_ANALISE: number;
    EM_ATENDIMENTO: number;
    AGUARDANDO_CLIENTE: number;
    RESOLVIDO: number;
    FECHADO: number;
  };
  byPriority: {
    BAIXA: number;
    MEDIA: number;
    ALTA: number;
  };
  byCategory: {
    [key: string]: number;
  };
  byTechnician: TechnicianPerformance[];
  resolutionTimes: ResolutionTime[];
  slaCompliance: {
    withinSLA: number;
    outsideSLA: number;
  };
  totals: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    total: number;
  };
}

export default function GestorEstatisticasPage() {
  const { token } = useAuth();
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('thisMonth'); // 'thisWeek', 'thisMonth', 'lastMonth', 'thisYear'
  const [reportType, setReportType] = useState('all'); // 'all', 'status', 'priority', 'sla', 'technicians'

  // Carregar dados estatísticos otimizados
  useEffect(() => {
    const loadStats = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);

      try {
        // Carregar dados em paralelo para melhor performance
        const [
          dashboardStats,
          resolutionTimes,
          technicianPerformance,
          categoryDistribution
        ] = await Promise.all([
          api.statistics.getDashboardStats(token),
          api.statistics.getResolutionTime(token),
          api.statistics.getTechnicianPerformance(token),
          api.statistics.getCategoryDistribution(token)
        ]);

        // Preparar dados da categoria
        const categoryData: { [key: string]: number } = {};
        categoryDistribution.forEach((item: CategoryDistributionItem) => {
          categoryData[item.nome] = item.quantidade;
        });

        // Agora usamos os dados reais do backend para construir o objeto de estatísticas
        const stats: StatsData = {
          dashboardStats,
          byStatus: {
            ABERTO: dashboardStats.chamadosAbertos,
            EM_ANALISE: dashboardStats.chamadosEmAnalise,
            EM_ATENDIMENTO: dashboardStats.chamadosEmAtendimento,
            AGUARDANDO_CLIENTE: dashboardStats.chamadosAguardandoCliente,
            RESOLVIDO: dashboardStats.chamadosResolvidos,
            FECHADO: dashboardStats.chamadosFechados,
          },
          byPriority: {
            BAIXA: dashboardStats.chamadosBaixa,
            MEDIA: dashboardStats.chamadosMedia,
            ALTA: dashboardStats.chamadosAlta,
          },
          byCategory: categoryData,
          byTechnician: technicianPerformance,
          resolutionTimes,
          slaCompliance: {
            withinSLA: dashboardStats.slaConformidade,
            outsideSLA: 100 - dashboardStats.slaConformidade
          },
          totals: {
            open: dashboardStats.chamadosAbertos,
            inProgress: dashboardStats.chamadosEmAtendimento,
            resolved: dashboardStats.chamadosResolvidos,
            closed: dashboardStats.chamadosFechados,
            total: dashboardStats.totalChamados
          }
        };

        setStatsData(stats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [token, dateRange]);

  // Função para exportar relatório
  const exportReport = () => {
    alert('Funcionalidade de exportação de relatório será implementada em breve!');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da página */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Estatísticas e Relatórios</h2>
          <p className="text-slate-600 mt-1">
            Análise de desempenho e métricas de atendimento do help desk
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border border-slate-300 rounded-md"
          >
            <option value="thisWeek">Esta Semana</option>
            <option value="thisMonth">Este Mês</option>
            <option value="lastMonth">Mês Anterior</option>
            <option value="thisYear">Este Ano</option>
            <option value="all">Todo o Período</option>
          </select>

          <Button onClick={exportReport} variant="outline">
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive" title="Erro">
          {error}
        </Alert>
      )}

      {/* Filtros para diferentes tipos de relatórios */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={reportType === 'all' ? 'default' : 'outline'}
              onClick={() => setReportType('all')}
              size="sm"
            >
              Visão Geral
            </Button>
            <Button
              variant={reportType === 'status' ? 'default' : 'outline'}
              onClick={() => setReportType('status')}
              size="sm"
            >
              Status
            </Button>
            <Button
              variant={reportType === 'priority' ? 'default' : 'outline'}
              onClick={() => setReportType('priority')}
              size="sm"
            >
              Prioridade
            </Button>
            <Button
              variant={reportType === 'category' ? 'default' : 'outline'}
              onClick={() => setReportType('category')}
              size="sm"
            >
              Categorias
            </Button>
            <Button
              variant={reportType === 'sla' ? 'default' : 'outline'}
              onClick={() => setReportType('sla')}
              size="sm"
            >
              SLA
            </Button>
            <Button
              variant={reportType === 'technicians' ? 'default' : 'outline'}
              onClick={() => setReportType('technicians')}
              size="sm"
            >
              Técnicos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo de estatísticas */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <span className="ml-3">Carregando estatísticas...</span>
        </div>
      ) : !statsData ? (
        <Alert variant="info" title="Sem dados">
          Não há dados estatísticos disponíveis para o período selecionado.
        </Alert>
      ) : (
        <div className="space-y-6">
          {/* Cards de estatísticas gerais - sempre visíveis */}
          <StatsOverview data={statsData.totals} />

          {/* Conteúdo baseado no tipo de relatório selecionado */}
          {(reportType === 'all' || reportType === 'status') && (
            <Card>
              <CardHeader>
                <CardTitle>Chamados por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <TicketsByStatusChart data={statsData.byStatus} />
                </div>
              </CardContent>
            </Card>
          )}

          {(reportType === 'all' || reportType === 'priority') && (
            <Card>
              <CardHeader>
                <CardTitle>Chamados por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <TicketsByPriorityChart data={statsData.byPriority} />
                </div>
              </CardContent>
            </Card>
          )}

          {(reportType === 'all' || reportType === 'category') && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <CategoryDistributionChart data={statsData.byCategory} />
                </div>
              </CardContent>
            </Card>
          )}

          {(reportType === 'all' || reportType === 'sla') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conformidade com SLA</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <SLAComplianceChart data={statsData.slaCompliance} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tempo Médio de Resolução por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResolutionTimeChart data={statsData.resolutionTimes} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(reportType === 'all' || reportType === 'technicians') && (
            <Card>
              <CardHeader>
                <CardTitle>Desempenho dos Técnicos</CardTitle>
              </CardHeader>
              <CardContent>
                <TechnicianPerformanceTable data={statsData.byTechnician} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}