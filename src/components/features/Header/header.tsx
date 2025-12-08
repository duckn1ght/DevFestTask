import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SwitchTheme from '../Themes/switchTheme'

const Header = () => {
  const location = useLocation()

  const navItems = [
    { name: 'Аналитика', href: '/', icon: LayoutDashboard },
    { name: 'Документы', href: '/documents', icon: FileText },
    { name: 'Сотрудники', href: '/employees', icon: Users },
  ]

  return (
    <div className="h-screen w-[300px] border-r bg-card flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">FinAI</h1>
        <SwitchTheme />
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <Button
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", location.pathname === item.href && "bg-secondary")}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Настройки
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </div>
  )
}

export default Header