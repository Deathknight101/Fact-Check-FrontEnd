import { Button } from "~/components/ui/button"
import { Home, Info, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "~/lib/utils"
import { NavLink, useLocation } from "react-router"

export function Navigation() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = location.pathname

  const navItems = [
    {
      to: "/",
      label: "হোম",
      labelEn: "Home",
      icon: Home,
    },
    {
      to: "/about",
      label: "সম্পর্কে",
      labelEn: "About",
      icon: Info,
    },
  ]

  return (
    <nav className="bg-card shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-text">বাংলা ফ্যাক্ট চেকার</h1>
              <p className="text-xs text-text/70">Bengali Fact Checker</p>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.to

              return (
                <NavLink key={item.to} to={item.to}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2",
                      isActive && "bg-primary text-white hover:bg-primary/90",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                    <span className="text-xs opacity-75">({item.labelEn})</span>
                  </Button>
                </NavLink>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.to

                return (
                  <NavLink key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start space-x-2 px-4 py-3",
                        isActive && "bg-primary text-white hover:bg-primary/90",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs opacity-75">({item.labelEn})</span>
                    </Button>
                  </NavLink>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
