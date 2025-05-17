// src/app/gestor/estatisticas/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { api } from '@/lib/api';
import StatsOverview from '@/components/statistics/stats-overview';
import TicketsByStatusChart from '@/components/statistics/tickets-by-status-chart';
import TicketsByPriorityChart from '@/components/statistics/tickets-by-priority-chart';
import ResolutionTimeChart from '@/components/statistics/resolution-time-chart';
import TechnicianPerformanceTable from '@/components/statistics/technician-performance-table';
import SLAComplianceChart from '@/components/statistics/sla-compliance-chart';
import CategoryDistributionChart from '@/components/statistics/category-distribution-chart';

// Interface para os dados de estatísticas
interface StatsData {
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
  byTechnician: {
    name: string;
    assigned: number;
    resolved: number;
    resolutionRate: string;
    avgResolutionTime: number;
    classification: string;
  }[];
  resolutionTimes: {
    category: string;
    avgTime: number;
  }[];
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
  
  // Carregar dados estatísticos
  useEffect(() => {
    const loadStats = async () => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      
      try {
        // Buscar todas as categorias
        const categories = await api.categories.list(token);
        
        // Buscar todos os usuários técnicos
        const users = await api.users.list(token);
        const technicians = users.content 
          ? users.content.filter((user: any) => user.tipo === 'TECNICO')
          : users.filter((user: any) => user.tipo === 'TECNICO');
        
        // Buscar chamados por status
        const openTickets = await api.tickets.listByStatus('ABERTO', token);
        const inAnalysisTickets = await api.tickets.listByStatus('EM_ANALISE', token);
        const inProgressTickets = await api.tickets.listByStatus('EM_ATENDIMENTO', token);
        const waitingClientTickets = await api.tickets.listByStatus('AGUARDANDO_CLIENTE', token);
        const resolvedTickets = await api.tickets.listByStatus('RESOLVIDO', token);
        const closedTickets = await api.tickets.listByStatus('FECHADO', token);
        
        // Combinar todos os chamados para análise
        const allTickets = [
          ...openTickets, 
          ...inAnalysisTickets, 
          ...inProgressTickets, 
          ...waitingClientTickets,
          ...resolvedTickets,
          ...closedTickets
        ];
        
        // Contar por prioridade
        const byPriority = {
          BAIXA: 0,
          MEDIA: 0,
          ALTA: 0
        };
        
        // Contar por categoria
        const byCategory: { [key: string]: number } = {};
        categories.forEach((cat: any) => {
          byCategory[cat.nome] = 0;
        });
        
        // Preparar dados de técnicos
        const technicianStats: { [key: string]: any } = {};
        technicians.forEach((tech: any) => {
          technicianStats[tech.id] = {
            name: tech.nome || tech.email,
            assigned: 0,
            resolved: 0,
            resolutionTimeTotal: 0,
            resolutionCount: 0
          };
        });
        
        // Buscar chamados específicos de cada técnico
        await Promise.all(
          technicians.map(async (tech: any) => {
            try {
              // Se o técnico atual for o usuário autenticado, podemos usar getMyTickets
              // Caso contrário, precisamos usar o endpoint adequado ou filtrar todos os tickets
              const myTickets = await api.tickets.getMyTickets(token);
              
              // Filtrar apenas os tickets que pertencem a este técnico
              const technicianTickets = myTickets.filter((ticket: any) => 
                ticket.tecnico && ticket.tecnico.id === tech.id
              );
              
              // Atualizar estatísticas deste técnico
              if (technicianStats[tech.id]) {
                technicianStats[tech.id].assigned = technicianTickets.length;
                
                technicianTickets.forEach((ticket: any) => {
                  if (ticket.status === 'RESOLVIDO' || ticket.status === 'FECHADO') {
                    technicianStats[tech.id].resolved++;
                    
                    if (ticket.abertoEm && ticket.fechadoEm) {
                      const openTime = new Date(ticket.abertoEm).getTime();
                      const closeTime = new Date(ticket.fechadoEm).getTime();
                      const resolutionTime = (closeTime - openTime) / (1000 * 60 * 60); // Em horas
                      
                      technicianStats[tech.id].resolutionTimeTotal += resolutionTime;
                      technicianStats[tech.id].resolutionCount++;
                    }
                  }
                });
              }
            } catch (error) {
              console.error(`Erro ao buscar chamados do técnico ${tech.nome || tech.email}:`, error);
            }
          })
        );
        
        // Contadores para SLA
        let ticketsWithSLA = 0;
        let ticketsWithinSLA = 0;
        
        // Processar todos os chamados para obter estatísticas completas
        allTickets.forEach((ticket: any) => {
          // Contar por prioridade
          if (ticket.prioridade && byPriority.hasOwnProperty(ticket.prioridade)) {
            byPriority[ticket.prioridade as keyof typeof byPriority]++;
          }
          
          // Contar por categoria
          if (ticket.categoria && byCategory.hasOwnProperty(ticket.categoria)) {
            byCategory[ticket.categoria]++;
          }
          
          // Estatísticas por técnico (complementar à busca específica)
          if (ticket.tecnico && ticket.tecnico.id && technicianStats[ticket.tecnico.id]) {
            // Verificar se o ticket já foi contabilizado
            // Verificar se esse ticket já não foi contado anteriormente
            // Incrementar contagem de chamados atribuídos
            if (technicianStats[ticket.tecnico.id].assigned === 0) {
              technicianStats[ticket.tecnico.id].assigned++;
            }
            
            // Verificar chamados resolvidos
            if ((ticket.status === 'RESOLVIDO' || ticket.status === 'FECHADO') && 
                technicianStats[ticket.tecnico.id].resolved === 0) {
              technicianStats[ticket.tecnico.id].resolved++;
              
              // Calcular tempo de resolução se tiver timestamps
              if (ticket.abertoEm && ticket.fechadoEm && 
                  technicianStats[ticket.tecnico.id].resolutionCount === 0) {
                const openTime = new Date(ticket.abertoEm).getTime();
                const closeTime = new Date(ticket.fechadoEm).getTime();
                const resolutionTime = (closeTime - openTime) / (1000 * 60 * 60); // Em horas
                
                technicianStats[ticket.tecnico.id].resolutionTimeTotal += resolutionTime;
                technicianStats[ticket.tecnico.id].resolutionCount++;
              }
            }
          }
          
          // Análise de SLA
          if (ticket.prazoSla) {
            ticketsWithSLA++;
            
            const slaDeadline = new Date(ticket.prazoSla).getTime();
            const resolvedDate = ticket.fechadoEm 
              ? new Date(ticket.fechadoEm).getTime() 
              : Date.now();
            
            if (resolvedDate <= slaDeadline) {
              ticketsWithinSLA++;
            }
          }
        });
        
        // Calcular média de tempo de resolução por técnico e adicionar classificações
        const technicianData = Object.values(technicianStats).map((tech: any) => {
          // Calcular média de resolução
          const avgResolutionTime = tech.resolutionCount > 0 
            ? Math.round(tech.resolutionTimeTotal / tech.resolutionCount * 10) / 10 
            : 0;
            
          // Calcular taxa de resolução
          const resolutionRate = tech.assigned > 0 
            ? Math.round((tech.resolved / tech.assigned) * 100) 
            : 0;
            
          // Determinar classificação
          let classification = 'Precisa Melhorar';
          
          if (tech.assigned === 0) {
            classification = 'Sem Avaliação';
          } else if (resolutionRate >= 90 && avgResolutionTime <= 24) {
            classification = 'Excelente';
          } else if (resolutionRate >= 75 && avgResolutionTime <= 48) {
            classification = 'Bom';
          } else if (resolutionRate >= 50) {
            classification = 'Regular';
          }
          
          return {
            name: tech.name,
            assigned: tech.assigned,
            resolved: tech.resolved,
            resolutionRate: `${resolutionRate}%`,
            avgResolutionTime,
            classification
          };
        });
        
        // Calcular tempo médio de resolução por categoria
        const resolutionTimesByCategory: { [key: string]: { total: number, count: number } } = {};
        
        categories.forEach((cat: any) => {
          resolutionTimesByCategory[cat.nome] = { total: 0, count: 0 };
        });
        
        // Preencher tempos de resolução por categoria
        allTickets.forEach((ticket: any) => {
          if (ticket.categoria && 
              resolutionTimesByCategory[ticket.categoria] && 
              ticket.abertoEm && 
              ticket.fechadoEm && 
              (ticket.status === 'RESOLVIDO' || ticket.status === 'FECHADO')) {
            
            const openTime = new Date(ticket.abertoEm).getTime();
            const closeTime = new Date(ticket.fechadoEm).getTime();
            const resolutionTime = (closeTime - openTime) / (1000 * 60 * 60); // Em horas
            
            resolutionTimesByCategory[ticket.categoria].total += resolutionTime;
            resolutionTimesByCategory[ticket.categoria].count++;
          }
        });
        
        const resolutionTimes = Object.entries(resolutionTimesByCategory).map(([category, data]) => ({
          category,
          avgTime: data.count > 0 ? Math.round(data.total / data.count * 10) / 10 : 0
        }));
        
        // Calcular percentual de conformidade com SLA
        const withinSLA = ticketsWithSLA > 0 
          ? Math.round((ticketsWithinSLA / ticketsWithSLA) * 100) 
          : 100;
        
        // Montar objeto de estatísticas
        const stats: StatsData = {
          byStatus: {
            ABERTO: openTickets.length,
            EM_ANALISE: inAnalysisTickets.length,
            EM_ATENDIMENTO: inProgressTickets.length,
            AGUARDANDO_CLIENTE: waitingClientTickets.length,
            RESOLVIDO: resolvedTickets.length,
            FECHADO: closedTickets.length
          },
          byPriority,
          byCategory,
          byTechnician: technicianData,
          resolutionTimes,
          slaCompliance: {
            withinSLA,
            outsideSLA: 100 - withinSLA
          },
          totals: {
            open: openTickets.length,
            inProgress: inAnalysisTickets.length + inProgressTickets.length + waitingClientTickets.length,
            resolved: resolvedTickets.length,
            closed: closedTickets.length,
            total: allTickets.length
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
      
      {/* Nota informativa */}
      <Alert variant="info" title="Uso de Dados">
        Este relatório é baseado em {statsData?.totals.total || 0} chamados registrados no sistema.
        Os dados são atualizados em tempo real conforme novos chamados são processados.
      </Alert>
    </div>
  );
}