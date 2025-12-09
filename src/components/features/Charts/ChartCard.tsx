import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import mockData from '@/mocks/data.json'

export const ChartCard = ({ title, data }: any) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  return (
    <Card className="flex flex-col h-full w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-1/2 h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={mockData.colors[index % mockData.colors.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: number) => `${value.toLocaleString()} ₸`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 space-y-2">
          {sortedData.map((entry: any, index: number) => {
             const originalIndex = data.findIndex((item: any) => item.name === entry.name);
             const color = mockData.colors[originalIndex % mockData.colors.length];
             return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span>{entry.name}</span>
                </div>
                <span className="font-medium">{entry.value.toLocaleString()} ₸</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
