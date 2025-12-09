import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Users, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import SwitchTheme from '../Themes/switchTheme'
import { useAuth } from '@/context/AuthContext'

const Header = () => {
  const location = useLocation()
  const { logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Аналитика', href: '/', icon: LayoutDashboard },
    { name: 'Документы', href: '/documents', icon: FileText },
    { name: 'Сотрудники', href: '/employees', icon: Users },
  ]

  const NavLinks = () => (
    <nav className="flex-1 flex flex-col px-4 space-y-2 mt-6 lg:mt-0">
      {navItems.map((item) => (
        <Link key={item.href} to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
          <Button
            variant={location.pathname === item.href ? "secondary" : "ghost"}
            className={cn("w-full justify-start gap-4 py-6 lg:py-8 text-sm", location.pathname === item.href && "bg-secondary")}
          >
            <item.icon className="h-6 w-6" />
            {item.name}
          </Button>
        </Link>
      ))}
    </nav>
  )

  const LogoutButton = () => (
    <div className="p-4 border-t space-y-2 mt-auto">
      <Button 
        variant="ghost" 
        className="w-full justify-start gap-2 text-destructive hover:text-destructive dark:text-red-400 dark:hover:text-red-300"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" />
        Выйти
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-[300px] border-r bg-card flex-col fixed left-0 top-0 z-50">
        <div className="p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">AccountingAI</h1>
          <SwitchTheme />
        </div>
        <NavLinks />
        <LogoutButton />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b bg-card flex items-center justify-between px-4 z-50">
        <h1 className="text-xl font-bold text-primary">FinAI</h1>
        <div className="flex items-center gap-2">
          <SwitchTheme />
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-background z-40 flex flex-col animate-in slide-in-from-top-5 duration-200">
          <NavLinks />
          <LogoutButton />
        </div>
      )}
    </>
  )
}

export default Header