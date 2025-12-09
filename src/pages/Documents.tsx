import { useState, useMemo, useEffect } from 'react'
import { Eye, FileText, Receipt, TrendingUp, Building, Landmark, Search, Filter, ArrowUpDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { reportsApi } from '@/api/Reports'

const getFileIcon = (type: string) => {
  switch (type) {
    case 'Налоги': return <Landmark className="h-4 w-4 text-red-500" />
    case 'Продажи': return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'Закупки': return <Receipt className="h-4 w-4 text-orange-500" />
    case 'Аренда': return <Building className="h-4 w-4 text-blue-500" />
    default: return <FileText className="h-4 w-4 text-gray-500" />
  }
}

// const parseDate = (dateStr: string) => {
//   // Handle both DD.MM.YYYY and ISO strings
//   if (dateStr.includes('T')) {
//     return new Date(dateStr).getTime();
//   }
//   const [day, month, year] = dateStr.split('.').map(Number)
//   return new Date(year, month - 1, day).getTime()
// }

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await reportsApi.getAll();
        const mappedDocs = data.map((report: any) => ({
          id: report.id,
          name: report.filename || `Report ${report.id.substring(0, 8)}`,
          type: report.type || 'General',
          date: new Date(report.createdAt).toLocaleDateString('ru-RU'),
          revenue: report.totalIncome - report.totalConsumption,
          rawDate: report.createdAt
        }));
        setDocuments(mappedDocs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  const documentTypes = ['all', ...new Set(documents.map(d => d.type))]

  const filteredAndSortedDocuments = useMemo(() => {
    return documents
      .filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = selectedType === 'all' || doc.type === selectedType
        return matchesSearch && matchesType
      })
      .sort((a, b) => {
        const dateA = new Date(a.rawDate).getTime()
        const dateB = new Date(b.rawDate).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
  }, [searchQuery, selectedType, sortOrder, documents])

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Документы</h1>
        <p className="text-muted-foreground">Управление финансовыми документами и отчетами</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список документов</CardTitle>
          <CardDescription>Все загруженные и сгенерированные документы</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск документов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Тип документа" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {documentTypes.filter(t => t !== 'all').map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={toggleSort} className="w-full md:w-auto">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {sortOrder === 'asc' ? 'Сначала старые' : 'Сначала новые'}
            </Button>
          </div>

          <div className="relative w-full overflow-auto rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Название</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Тип</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Дата оформления</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Сумма</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredAndSortedDocuments.length > 0 ? (
                  filteredAndSortedDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">
                        <div className="flex items-center gap-2">
                          {getFileIcon(doc.type)}
                          {doc.name}
                        </div>
                      </td>
                      <td className="p-4 align-middle">{doc.type}</td>
                      <td className="p-4 align-middle">{doc.date}</td>
                      <td className={`p-4 align-middle text-right font-medium ${doc.revenue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {doc.revenue > 0 ? '+' : ''}{doc.revenue.toLocaleString()} ₸
                      </td>
                      <td className="p-4 align-middle text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Просмотреть
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Документы не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Documents