import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockHistoryPoint } from '../types';

interface StockChartProps {
  data: StockHistoryPoint[];
  color: string;
}

export const StockChart: React.FC<StockChartProps> = ({ data, color }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            width={60}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ color: '#f8fafc' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
