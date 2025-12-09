import { useState, useMemo, useEffect } from 'react'
import { Search, Filter, UserPlus, Briefcase, DollarSign, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AddEmployees from '@/components/features/Forms/AddEmployees'
import { employeesApi } from '@/api/Employees'
import type { Employee } from '@/api/Employees'

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await employeesApi.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    }
  };

  const departments = ['all', ...new Set(employees.map(e => e.position))]

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`;
      const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDepartment = selectedDepartment === 'all' || employee.position === selectedDepartment
      return matchesSearch && matchesDepartment
    })
  }, [employees, searchQuery, selectedDepartment])

  const handleAddEmployee = async (newEmployee: any) => {
    try {
      await employeesApi.create(newEmployee);
      fetchEmployees();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add employee:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Сотрудники</h1>
          <p className="text-muted-foreground">Управление персоналом и зарплатным фондом</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Добавить сотрудника
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Список сотрудников</CardTitle>
          <CardDescription>Всего сотрудников: {filteredEmployees.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по ФИО..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Должность" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все должности</SelectItem>
                {departments.filter(d => d !== 'all').map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full overflow-auto rounded-md border">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b bg-muted/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ФИО</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Должность</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Заработная плата</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Дата найма</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{employee.firstName} {employee.lastName}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          {employee.position}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          {Number(employee.salary).toLocaleString()} ₸
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('ru-RU') : '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      Сотрудники не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <AddEmployees 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleAddEmployee} 
        />
      )}
    </div>
  )
}

export default Employees
