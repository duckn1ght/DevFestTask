import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

interface AddEmployeesProps {
  onClose: () => void
  onAdd: (employee: any) => void
}

const AddEmployees = ({ onClose, onAdd }: AddEmployeesProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    salary: '',
    email: '',
    hireDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      firstName: formData.firstName,
      lastName: formData.lastName,
      position: formData.position,
      salary: Number(formData.salary),
      email: formData.email,
      hireDate: formData.hireDate ? new Date(formData.hireDate).toISOString() : undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-4 top-4" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <CardTitle>Добавить сотрудника</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Иван"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Иванов"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Должность</Label>
              <Select 
                value={formData.position} 
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите должность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Разработчик">Разработчик</SelectItem>
                  <SelectItem value="Маркетолог">Маркетолог</SelectItem>
                  <SelectItem value="Менеджер по продажам">Менеджер по продажам</SelectItem>
                  <SelectItem value="HR-менеджер">HR-менеджер</SelectItem>
                  <SelectItem value="Бухгалтер">Бухгалтер</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Заработная плата (₸)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ivan@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hireDate">Дата найма</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Отмена</Button>
            <Button type="submit">Добавить</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default AddEmployees