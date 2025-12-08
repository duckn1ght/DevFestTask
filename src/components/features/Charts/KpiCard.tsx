import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const KpiCard = ({ title, value, icon: Icon, trend }: any) => (
  <Card className='shadow-lg'>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()} ₸</div>
      <p className="text-xs text-muted-foreground flex items-center mt-1">
        <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
        <span className="text-green-500 font-medium">{trend}</span>
        <span className="ml-1">с прошлого месяца</span>
      </p>
    </CardContent>
  </Card>
)
