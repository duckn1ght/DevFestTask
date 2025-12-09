import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const RevenueChart = ({ data }: any) => (
  <Card className="flex flex-col shadow-lg">
    <CardHeader>
      <CardTitle>Динамика Выручки</CardTitle>
      <CardDescription>Ежедневный прирост (значения в тыс. ₸)</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] min-h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value / 1000}`} />
            <RechartsTooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--popover-foreground))',
                borderRadius: 'var(--radius)',
              }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value.toLocaleString()} ₸`, 'Выручка']}
            />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Выручка" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
)
