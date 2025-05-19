// src/components/statistics/report-exporter.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';

interface ReportExporterProps {
    statsData: any;
    period: string;
}

export default function ReportExporter({ statsData, period }: ReportExporterProps) {
    const [isExporting, setIsExporting] = useState(false);

    // Função para formatar a data atual
    const formatDate = () => {
        const date = new Date();
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Função para exportar para Excel
    const exportToExcel = () => {
        // Criar uma nova pasta de trabalho
        const wb = XLSX.utils.book_new();

        // Dados de visão geral
        const overviewData = [
            ['HelpDesk - Relatório de Estatísticas'],
            [`Período: ${period}`],
            [`Gerado em: ${formatDate()}`],
            [''],
            ['Visão Geral'],
            ['Métrica', 'Valor', 'Percentual'],
            ['Chamados Totais', statsData.totals.total, '100%'],
            ['Chamados Abertos', statsData.totals.open, `${Math.round((statsData.totals.open / statsData.totals.total) * 100) || 0}%`],
            ['Em Atendimento', statsData.totals.inProgress, `${Math.round((statsData.totals.inProgress / statsData.totals.total) * 100) || 0}%`],
            ['Resolvidos', statsData.totals.resolved, `${Math.round((statsData.totals.resolved / statsData.totals.total) * 100) || 0}%`],
            ['Fechados', statsData.totals.closed, `${Math.round((statsData.totals.closed / statsData.totals.total) * 100) || 0}%`],
            ['Taxa de Resolução', `${Math.round((statsData.totals.resolved / statsData.totals.total) * 100) || 0}%`],
        ];

        // Chamados por Status
        const statusData = [
            [''],
            ['Chamados por Status'],
            ['Status', 'Quantidade', 'Percentual'],
            ['Aberto', statsData.byStatus.ABERTO, `${Math.round((statsData.byStatus.ABERTO / statsData.totals.total) * 100) || 0}%`],
            ['Em Análise', statsData.byStatus.EM_ANALISE, `${Math.round((statsData.byStatus.EM_ANALISE / statsData.totals.total) * 100) || 0}%`],
            ['Em Atendimento', statsData.byStatus.EM_ATENDIMENTO, `${Math.round((statsData.byStatus.EM_ATENDIMENTO / statsData.totals.total) * 100) || 0}%`],
            ['Aguardando Cliente', statsData.byStatus.AGUARDANDO_CLIENTE, `${Math.round((statsData.byStatus.AGUARDANDO_CLIENTE / statsData.totals.total) * 100) || 0}%`],
            ['Resolvido', statsData.byStatus.RESOLVIDO, `${Math.round((statsData.byStatus.RESOLVIDO / statsData.totals.total) * 100) || 0}%`],
            ['Fechado', statsData.byStatus.FECHADO, `${Math.round((statsData.byStatus.FECHADO / statsData.totals.total) * 100) || 0}%`],
        ];

        // Chamados por Prioridade
        const priorityData = [
            [''],
            ['Chamados por Prioridade'],
            ['Prioridade', 'Quantidade', 'Percentual'],
            ['Alta', statsData.byPriority.ALTA, `${Math.round((statsData.byPriority.ALTA / statsData.totals.total) * 100) || 0}%`],
            ['Média', statsData.byPriority.MEDIA, `${Math.round((statsData.byPriority.MEDIA / statsData.totals.total) * 100) || 0}%`],
            ['Baixa', statsData.byPriority.BAIXA, `${Math.round((statsData.byPriority.BAIXA / statsData.totals.total) * 100) || 0}%`],
        ];

        // Conformidade com SLA
        const slaData = [
            [''],
            ['Conformidade com SLA'],
            ['Status', 'Percentual'],
            ['Dentro do SLA', `${statsData.slaCompliance.withinSLA}%`],
            ['Fora do SLA', `${statsData.slaCompliance.outsideSLA}%`],
        ];

        // Tempo Médio de Resolução por Categoria
        const resolutionTimeRows = [
            [''],
            ['Tempo Médio de Resolução por Categoria'],
            ['Categoria', 'Tempo Médio (horas)'],
        ];

        statsData.resolutionTimes.forEach((item: { nome: any; valor: any; }) => {
            resolutionTimeRows.push([item.nome, item.valor]);
        });

        // Desempenho dos Técnicos
        const technicianRows = [
            [''],
            ['Desempenho dos Técnicos'],
            ['Técnico', 'Chamados Atribuídos', 'Chamados Resolvidos', 'Taxa de Resolução', 'Tempo Médio (horas)', 'Classificação'],
        ];

        statsData.byTechnician.forEach((tech: { nome: any; atribuidos: any; resolvidos: any; taxa: any; avgHours: any; classificacao: any; }) => {
            technicianRows.push([tech.nome, tech.atribuidos, tech.resolvidos, tech.taxa, tech.avgHours, tech.classificacao]);
        });

        // Distribuição por Categoria
        const categoryRows = [
            [''],
            ['Distribuição por Categoria'],
            ['Categoria', 'Quantidade', 'Percentual'],
        ];

        Object.entries(statsData.byCategory).forEach(([name, value]) => {
            categoryRows.push([
                name,
                String(value),
                `${Math.round((Number(value) / statsData.totals.total) * 100) || 0}%`
            ]);
        });

        // Concatenar todos os dados
        const allData = [
            ...overviewData,
            ...statusData,
            ...priorityData,
            ...slaData,
            ...resolutionTimeRows,
            ...technicianRows,
            ...categoryRows,
        ];

        // Criar planilha e adicionar à pasta de trabalho
        const ws = XLSX.utils.aoa_to_sheet(allData);
        XLSX.utils.book_append_sheet(wb, ws, "Estatísticas");

        // Exportar para arquivo
        const fileName = `HelpDesk_Relatório_Estatísticas_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Função para exportar para PDF - Versão corrigida
    const exportToPDF = () => {
        try {
            // Importar jsPDF com autoTable de forma dinâmica
            import('jspdf').then(async (jsPDFModule) => {
                const { default: jsPDF } = jsPDFModule;
                const autoTable = (await import('jspdf-autotable')).default;

                // Criar novo documento PDF
                const doc = new jsPDF();

                // Título e cabeçalho
                doc.setFontSize(18);
                doc.text('HelpDesk - Relatório de Estatísticas', 14, 20);

                doc.setFontSize(12);
                doc.text(`Período: ${period}`, 14, 30);
                doc.text(`Gerado em: ${formatDate()}`, 14, 36);

                // Visão Geral
                doc.setFontSize(14);
                doc.text('Visão Geral', 14, 46);

                // Tabela de visão geral
                autoTable(doc, {
                    startY: 50,
                    head: [['Métrica', 'Valor', 'Percentual']],
                    body: [
                        ['Chamados Totais', String(statsData.totals.total), '100%'],
                        ['Chamados Abertos', String(statsData.totals.open), `${Math.round((statsData.totals.open / statsData.totals.total) * 100) || 0}%`],
                        ['Em Atendimento', String(statsData.totals.inProgress), `${Math.round((statsData.totals.inProgress / statsData.totals.total) * 100) || 0}%`],
                        ['Resolvidos', String(statsData.totals.resolved), `${Math.round((statsData.totals.resolved / statsData.totals.total) * 100) || 0}%`],
                        ['Fechados', String(statsData.totals.closed), `${Math.round((statsData.totals.closed / statsData.totals.total) * 100) || 0}%`],
                        ['Taxa de Resolução', `${Math.round((statsData.totals.resolved / statsData.totals.total) * 100) || 0}%`, ''],
                    ],
                });

                // Chamados por Status
                doc.setFontSize(14);
                let finalY = (doc as any).lastAutoTable.finalY || 50;
                doc.text('Chamados por Status', 14, finalY + 10);

                autoTable(doc, {
                    startY: finalY + 15,
                    head: [['Status', 'Quantidade', 'Percentual']],
                    body: [
                        ['Aberto', String(statsData.byStatus.ABERTO), `${Math.round((statsData.byStatus.ABERTO / statsData.totals.total) * 100) || 0}%`],
                        ['Em Análise', String(statsData.byStatus.EM_ANALISE), `${Math.round((statsData.byStatus.EM_ANALISE / statsData.totals.total) * 100) || 0}%`],
                        ['Em Atendimento', String(statsData.byStatus.EM_ATENDIMENTO), `${Math.round((statsData.byStatus.EM_ATENDIMENTO / statsData.totals.total) * 100) || 0}%`],
                        ['Aguardando Cliente', String(statsData.byStatus.AGUARDANDO_CLIENTE), `${Math.round((statsData.byStatus.AGUARDANDO_CLIENTE / statsData.totals.total) * 100) || 0}%`],
                        ['Resolvido', String(statsData.byStatus.RESOLVIDO), `${Math.round((statsData.byStatus.RESOLVIDO / statsData.totals.total) * 100) || 0}%`],
                        ['Fechado', String(statsData.byStatus.FECHADO), `${Math.round((statsData.byStatus.FECHADO / statsData.totals.total) * 100) || 0}%`],
                    ],
                });

                // Chamados por Prioridade
                doc.setFontSize(14);
                finalY = (doc as any).lastAutoTable.finalY || finalY + 15;
                doc.text('Chamados por Prioridade', 14, finalY + 10);

                autoTable(doc, {
                    startY: finalY + 15,
                    head: [['Prioridade', 'Quantidade', 'Percentual']],
                    body: [
                        ['Alta', String(statsData.byPriority.ALTA), `${Math.round((statsData.byPriority.ALTA / statsData.totals.total) * 100) || 0}%`],
                        ['Média', String(statsData.byPriority.MEDIA), `${Math.round((statsData.byPriority.MEDIA / statsData.totals.total) * 100) || 0}%`],
                        ['Baixa', String(statsData.byPriority.BAIXA), `${Math.round((statsData.byPriority.BAIXA / statsData.totals.total) * 100) || 0}%`],
                    ],
                });

                // Conformidade com SLA
                doc.setFontSize(14);
                finalY = (doc as any).lastAutoTable.finalY || finalY + 15;
                doc.text('Conformidade com SLA', 14, finalY + 10);

                autoTable(doc, {
                    startY: finalY + 15,
                    head: [['Status', 'Percentual']],
                    body: [
                        ['Dentro do SLA', `${statsData.slaCompliance.withinSLA}%`],
                        ['Fora do SLA', `${statsData.slaCompliance.outsideSLA}%`],
                    ],
                });

                // Tempo Médio de Resolução por Categoria
                doc.setFontSize(14);
                finalY = (doc as any).lastAutoTable.finalY || finalY + 15;
                doc.text('Tempo Médio de Resolução por Categoria', 14, finalY + 10);

                const resolutionTimeData = statsData.resolutionTimes.map((item: { nome: string; valor: number; }) => [
                    item.nome, String(item.valor)
                ]);

                autoTable(doc, {
                    startY: finalY + 15,
                    head: [['Categoria', 'Tempo Médio (horas)']],
                    body: resolutionTimeData,
                });

                // Nova página para Desempenho dos Técnicos
                doc.addPage();

                // Desempenho dos Técnicos
                doc.setFontSize(14);
                doc.text('Desempenho dos Técnicos', 14, 20);

                const technicianData = statsData.byTechnician.map((tech: { nome: string; atribuidos: number; resolvidos: number; taxa: string; avgHours: number; classificacao: string; }) => [
                    tech.nome,
                    String(tech.atribuidos),
                    String(tech.resolvidos),
                    tech.taxa,
                    String(tech.avgHours),
                    tech.classificacao
                ]);

                autoTable(doc, {
                    startY: 25,
                    head: [['Técnico', 'Chamados Atribuídos', 'Chamados Resolvidos', 'Taxa de Resolução', 'Tempo Médio (h)', 'Classificação']],
                    body: technicianData,
                });

                // Distribuição por Categoria
                finalY = (doc as any).lastAutoTable.finalY || 25;
                doc.text('Distribuição por Categoria', 14, finalY + 10);

                const categoryData = Object.entries(statsData.byCategory).map(([name, value]) => [
                    name,
                    String(value),
                    `${Math.round((Number(value) / statsData.totals.total) * 100) || 0}%`
                ]);

                autoTable(doc, {
                    startY: finalY + 15,
                    head: [['Categoria', 'Quantidade', 'Percentual']],
                    body: categoryData,
                });

                autoTable(doc, {
                    startY: finalY + 15,
                    head: [['Categoria', 'Quantidade', 'Percentual']],
                    body: categoryData,
                });

                // Salvar o PDF
                const fileName = `HelpDesk_Relatório_Estatísticas_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(fileName);
            });
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            alert('Ocorreu um erro ao gerar o relatório em PDF. Tente novamente.');
        }
    };

    const handleExport = async (format: 'pdf' | 'excel') => {
        try {
            setIsExporting(true);

            if (format === 'pdf') {
                exportToPDF();
            } else {
                exportToExcel();
            }
        } catch (error) {
            console.error('Erro ao exportar relatório:', error);
            alert('Ocorreu um erro ao exportar o relatório. Tente novamente.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="relative inline-block">
            <Button
                onClick={() => document.getElementById('exportOptions')?.classList.toggle('hidden')}
                variant="outline"
                className="flex items-center gap-2"
                disabled={isExporting}
            >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isExporting ? 'Exportando...' : 'Exportar Relatório'}
            </Button>

            <div
                id="exportOptions"
                className="hidden absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10"
            >
                <ul className="py-1">
                    <li>
                        <button
                            onClick={() => handleExport('pdf')}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 3C5.9 3 5 3.9 5 5v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8.4L13.6 3H7zM13 9V4.4L17.6 9H13z" />
                                </svg>
                                Exportar como PDF
                            </div>
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => handleExport('excel')}
                            className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 6v12h18V6H3zm5.3 10L6 13.6l1.1-1.1 1.2 1.2 3.2-3.2L12.6 12l-4.3 4zm7.7-5h-4v-1h4v1zm0 2h-4v-1h4v1zm0 2h-4v-1h4v1z" />
                                </svg>
                                Exportar como Excel
                            </div>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}