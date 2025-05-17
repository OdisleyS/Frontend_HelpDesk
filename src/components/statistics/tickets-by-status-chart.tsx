// src/components/statistics/tickets-by-status-chart.tsx

'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface TicketsByStatusChartProps {
    data: {
        ABERTO: number;
        EM_ANALISE: number;
        EM_ATENDIMENTO: number;
        AGUARDANDO_CLIENTE: number;
        RESOLVIDO: number;
        FECHADO: number;
    };
}

export default function TicketsByStatusChart({ data }: TicketsByStatusChartProps) {
    // Converter os dados para o formato esperado pelo Recharts
    const chartData = [
        { name: 'Aberto', value: data.ABERTO, color: '#3B82F6' },
        { name: 'Em Análise', value: data.EM_ANALISE, color: '#8B5CF6' },
        { name: 'Em Atendimento', value: data.EM_ATENDIMENTO, color: '#FBBF24' },
        { name: 'Aguardando Cliente', value: data.AGUARDANDO_CLIENTE, color: '#F97316' },
        { name: 'Resolvido', value: data.RESOLVIDO, color: '#22C55E' },
        { name: 'Fechado', value: data.FECHADO, color: '#64748B' }
    ];

    // Personalização do tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm">
                        <span className="font-medium">Quantidade:</span> {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                    dataKey="value"
                    name="Quantidade"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                    animationDuration={1000}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}