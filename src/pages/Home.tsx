import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Upload, FileText, Bot, DollarSign, Users, Filter, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { ScrollArea } from '../components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import mockData from '../mocks/data.json'

import { KpiCard } from '@/components/features/Charts/KpiCard'
import { RevenueChart } from '@/components/features/Charts/RevenueChart'
import { ChartCard } from '@/components/features/Charts/ChartCard'

const Home = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [stats, setStats] = useState(mockData.periods.month.stats)
  const [taxData, setTaxData] = useState(mockData.periods.month.taxData)
  const [salaryData, setSalaryData] = useState(mockData.periods.month.salaryData)
  const [revenueData, setRevenueData] = useState(mockData.periods.month.revenueChart)
  
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', content: 'Привет! Я ваш ИИ-ассистент. Загрузите документ, и я обновлю аналитику, или спросите меня о платежах.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState('chat')

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as 'week' | 'month' | 'year'
    setPeriod(newPeriod)
    setStats(mockData.periods[newPeriod].stats)
    setTaxData(mockData.periods[newPeriod].taxData)
    setSalaryData(mockData.periods[newPeriod].salaryData)
    setRevenueData(mockData.periods[newPeriod].revenueChart)
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    
    const newMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, newMsg])
    setChatInput('')

    // Mock AI Response
    setTimeout(() => {
      let response = 'Я могу помочь с этим. Пожалуйста, уточните детали.'
      if (chatInput.toLowerCase().includes('оплатить') || chatInput.toLowerCase().includes('налог')) {
        response = 'Для оплаты налогов вам необходимо сформировать платежное поручение. Я могу подготовить его на основе данных из системы.'
      }
      setChatMessages(prev => [...prev, { role: 'ai', content: response }])
    }, 1000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleAnalyze = () => {
    if (!uploadedFile) return
    
    setIsAnalyzing(true)
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false)
      setUploadedFile(null)
      
      // Update stats with "analyzed" data
      setStats({
        revenue: stats.revenue + Math.floor(Math.random() * 50000),
        taxes: stats.taxes + Math.floor(Math.random() * 5000),
        salaries: stats.salaries + Math.floor(Math.random() * 2000),
      })
      
      setTaxData(prev => prev.map(item => ({ ...item, value: item.value + Math.floor(Math.random() * 1000) })))
      setSalaryData(prev => prev.map(item => ({ ...item, value: item.value + Math.floor(Math.random() * 2000) })))
      setRevenueData(prev => prev.map(item => ({ ...item, value: item.value + Math.floor(Math.random() * 500000) })))

      setChatMessages(prev => [...prev, { role: 'ai', content: `Документ "${uploadedFile.name}" проанализирован. Данные аналитики обновлены.` }])
      setActiveTab('chat')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Финансовая Аналитика</h1>
          <p className="text-muted-foreground">Обзор выручки, налогов и зарплат</p>
        </div>
        <div className="flex items-center gap-4">
           <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Эта неделя</SelectItem>
              <SelectItem value="month">Этот месяц</SelectItem>
              <SelectItem value="year">Этот год</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
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

            {/* Revenue Chart */}
            <RevenueChart data={revenueData} />
          </div>

          {/* Right Column: AI Assistant */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col min-h-[500px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Ассистент
                </CardTitle>
                <CardDescription>Загрузите документы или задайте вопрос</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat">Чат</TabsTrigger>
                    <TabsTrigger value="upload">Загрузка</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 mt-4">
                    <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{msg.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
                                <AvatarImage src={msg.role === 'ai' ? '/ai-avatar.png' : ''} />
                              </Avatar>
                              <div className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
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
      </motion.div>
    </div>
  )
}

export default Home