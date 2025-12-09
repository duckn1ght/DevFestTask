import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Upload, FileText, Bot, DollarSign, Users, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { KpiCard } from '@/components/features/Charts/KpiCard'
import { RevenueChart } from '@/components/features/Charts/RevenueChart'
import { ChartCard } from '@/components/features/Charts/ChartCard'
import { ragApi } from '@/api/Rag'
import { reportsApi } from '@/api/Reports'
import { transactionsApi, type Transaction } from '@/api/Transactions'

const Home = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [stats, setStats] = useState({ revenue: 0, taxes: 0, salaries: 0 })
  const [taxData, setTaxData] = useState<{ name: string; value: number }[]>([])
  const [salaryData, setSalaryData] = useState<{ name: string; value: number }[]>([])
  const [revenueData, setRevenueData] = useState<{ date: string; value: number }[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Привет! Я ваш ИИ-ассистент. Загрузите документ, и я обновлю аналитику, или спросите меня о платежах.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('chat')

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const scrollBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === 'chat' && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 100);
    }
  }, [chatMessages, activeTab])

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const fetchData = async (selectedPeriod: 'week' | 'month' | 'year') => {
    try {
      const now = new Date();
      let query: any = {};

      if (selectedPeriod === 'week') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const start = new Date(now.setDate(diff));
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        query = {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        };
      } else if (selectedPeriod === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        query = {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        };
      } else if (selectedPeriod === 'year') {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        query = {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        };
      }

      const summary = await reportsApi.getSummary(query);
      
      setStats({
        revenue: summary.totals.income,
        taxes: summary.totals.taxes,
        salaries: summary.totals.salaries,
      });

      const taxes = summary.breakdown?.taxes 
        ? Object.entries(summary.breakdown.taxes).map(([name, value]) => ({ name, value }))
        : [];
      setTaxData(taxes);

      const salaries = summary.breakdown?.salaries
        ? Object.entries(summary.breakdown.salaries).map(([name, value]) => ({ name, value }))
        : [];
      setSalaryData(salaries);
      
      const revenue = summary.breakdown?.revenue || [];
      setRevenueData(revenue); 

      const txs = await transactionsApi.getAll(query);
      setTransactions(txs);

    } catch (error) {
      console.error("Failed to fetch report summary:", error);
    }
  };

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as 'week' | 'month' | 'year'
    setPeriod(newPeriod)
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isSending) return
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setChatInput('')
    setIsSending(true);

    try {
      const response = await ragApi.query({ question: userMsg });
      
      let aiContent = response.answer;
      try {
          const parsed = JSON.parse(response.answer);
          if (parsed.answer) aiContent = parsed.answer;
      } catch (e) {
        console.warn("AI response is not valid JSON:", e);
      }

      setChatMessages(prev => [...prev, { role: 'ai', content: aiContent }])
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'ai', content: "Извините, произошла ошибка при обработке вашего запроса." }])
    } finally {
      setIsSending(false);
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    
    try {
      await ragApi.ingestFile(uploadedFile);
      
      setChatMessages(prev => [...prev, { role: 'ai', content: `Документ "${uploadedFile.name}" успешно загружен и проанализирован. Вы можете задавать вопросы по его содержанию.` }])
      setActiveTab('chat')
      setUploadedFile(null);
      
      // Refresh data after analysis (if the backend updates reports based on files)
      fetchData(period);

    } catch (error) {
      console.error("Analysis error:", error);
       setChatMessages(prev => [...prev, { role: 'ai', content: `Ошибка при загрузке документа "${uploadedFile.name}".` }])
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Финансовая Аналитика</h1>
          <p className="text-sm md:text-base text-muted-foreground">Обзор выручки, налогов и зарплат</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
           <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Эта неделя</SelectItem>
              <SelectItem value="month">Этот месяц</SelectItem>
              <SelectItem value="year">Этот год</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard title="Выручка" value={stats.revenue} icon={DollarSign} trend="+12%" />
              <KpiCard title="Налоги" value={stats.taxes} icon={FileText} trend="+5%" />
              <KpiCard title="Зарплаты" value={stats.salaries} icon={Users} trend="+2%" />
            </div>

            <RevenueChart data={revenueData} />
          </div>

          <div className="lg:col-span-1">
            <Card className="h-[500px] lg:h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Ассистент
                </CardTitle>
                <CardDescription>Загрузите документы или задайте вопрос</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-scroll">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Чат</TabsTrigger>
                    <TabsTrigger value="upload">Загрузка</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-4">
                    <div className="flex-1 overflow-y-auto pr-4" ref={scrollAreaRef}>
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{msg.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                                <AvatarImage src={msg.role === 'ai' ? '/ai-avatar.png' : ''} />
                              </Avatar>
                              <div className={`p-3 rounded-lg text-sm break-all whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={scrollBottomRef} />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-2">
                      <Input 
                        placeholder="Спросите что-нибудь..."  
                        value={chatInput} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setChatInput(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="flex-1 mt-4">
                    <div className="h-full flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-6 space-y-4">
                      <div className="p-4 bg-muted rounded-full">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="font-medium">Загрузите документ</h3>
                        <p className="text-sm text-muted-foreground">Договоры, чеки, выписки</p>
                      </div>
                      <Input type="file" className="max-w-xs" onChange={handleFileUpload} />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 text-sm bg-muted px-3 py-1 rounded">
                          <FileText className="h-4 w-4" />
                          {uploadedFile.name}
                        </div>
                      )}
                      <Button className="w-full max-w-xs" onClick={handleAnalyze} disabled={!uploadedFile || isAnalyzing}>
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Анализ...
                          </>
                        ) : (
                          'Анализировать'
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Структура Налогов" data={taxData} />
          <ChartCard title="Распределение Зарплат" data={salaryData} />
        </div>

        {/* Transactions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Последние транзакции</CardTitle>
            <CardDescription>Список операций за выбранный период</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-muted-foreground text-sm">Нет транзакций за выбранный период</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{tx.description || 'Без описания'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} ₸
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default Home