'use client';

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface CategoryDistributionChartProps {
  data: {
    [key: string]: number;
  };
}

export default function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  // Converter o objeto de dados em um array para o Recharts
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0) // Remover categorias sem chamados
    .sort((a, b) => b.value - a.value); // Ordenar por quantidade (decrescente)
  
  // Definir cores para o gráfico
  const COLORS = [
    '#3B82F6', // Azul
    '#8B5CF6', // Roxo
    '#EC4899', // Rosa
    '#F59E0B', // Âmbar
    '#10B981', // Esmeralda
    '#6366F1', // Índigo
    '#EF4444', // Vermelho
    '#14B8A6', // Verde-azulado
    '#F97316', // Laranja
    '#8B5CF6', // Violeta
    '#64748B', // Cinza ardósia
    '#6B7280', // Cinza
  ];
  
  // Calcular o total para percentuais
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
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
            <span className="font-medium">Percentual:</span> {((data.value / total) * 100).toFixed(0)}%
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
          labelLine={true}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          wrapperStyle={{ fontSize: '12px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}