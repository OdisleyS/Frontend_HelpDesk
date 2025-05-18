// src/components/statistics/resolution-time-chart.tsx

'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface ResolutionTimeChartProps {
  data: {
    nome: string;
    valor: number;
  }[];
}

export default function ResolutionTimeChart({ data }: ResolutionTimeChartProps) {
  // Ordenar dados pelo tempo médio (decrescente)
  const sortedData = [...data].sort((a, b) => b.valor - a.valor);
  
  // Personalização do tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="font-medium">Tempo médio:</span> {payload[0].value} horas
          </p>
        </div>
      );
    }
    return null;
  };

  // Converter dados para o formato esperado pelo componente de gráfico
  const chartData = sortedData.map(item => ({
    category: item.nome,
    avgTime: item.valor
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" label={{ value: 'Horas', position: 'insideBottom', offset: -5 }} />
        <YAxis 
          dataKey="category" 
          type="category" 
          scale="band" 
          tick={{ fontSize: 12 }}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="avgTime" 
          fill="#8884d8" 
          name="Tempo Médio (horas)" 
          radius={[0, 4, 4, 0]}
          barSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}