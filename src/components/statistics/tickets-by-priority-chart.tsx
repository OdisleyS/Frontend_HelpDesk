// src/components/statistics/tickets-by-priority-chart.tsx

'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface TicketsByPriorityChartProps {
  data: {
    BAIXA: number;
    MEDIA: number;
    ALTA: number;
  };
}

export default function TicketsByPriorityChart({ data }: TicketsByPriorityChartProps) {
  // Converter os dados para o formato esperado pelo Recharts
  const chartData = [
    { name: 'Alta', value: data.ALTA },
    { name: 'Média', value: data.MEDIA },
    { name: 'Baixa', value: data.BAIXA }
  ].filter(item => item.value > 0); // Filtrar itens com valor 0
  
  // Definir cores para cada fatia do gráfico
  const COLORS = ['#EF4444', '#F59E0B', '#22C55E'];
  
  // Calcular o total para percentuais
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Formatar label com percentual
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Personalização do tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-md rounded-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Quantidade:</span> {data.value}
          </p>
          <p className="text-sm">
            <span className="font-medium">Percentual:</span> {((data.value / total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          wrapperStyle={{ paddingTop: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}