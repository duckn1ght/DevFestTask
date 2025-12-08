import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const RevenueChart = ({ data }: any) => (
  <Card className="flex flex-col shadow-lg">
    <CardHeader>
      <CardTitle>Динамика Выручки</CardTitle>
      <CardDescription>Ежедневный прирост за последнюю неделю (значения в тыс. ₸)</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value / 1000}`} />
            <RechartsTooltip formatter={(value: number) => [`${value.toLocaleString()} ₸`, 'Выручка']} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} name="Выручка" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
    <CardFooter>
      <Button className="w-full" asChild>
        <Link to="#">
          Подробнее <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
)
