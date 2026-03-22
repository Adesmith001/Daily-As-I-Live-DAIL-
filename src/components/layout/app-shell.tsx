import {
  CalendarDays,
  ChartNoAxesColumn,
  ListTodo,
  LogOut,
  Settings,
  SunMedium,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { FirebaseBanner } from '@/components/common/firebase-banner'
import { LogoMark } from '@/components/common/logo-mark'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { signOutUser } from '@/services/auth-service'
import { cn } from '@/lib/utils'

const navigationItems = [
  { to: '/today', label: 'Today', icon: SunMedium },
  { to: '/trackers', label: 'Trackers', icon: ListTodo },
  { to: '/history', label: 'History', icon: ChartNoAxesColumn },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const pageTitles: Record<string, { title: string; description: string }> = {
  '/today': {
    title: 'Today',
    description: 'Track the rhythm of today with one-hand friendly logging.',
  },
  '/trackers': {
    title: 'Trackers',
    description: 'Shape the habits and signals you want DAIL to follow.',
  },
  '/history': {
    title: 'History',
    description: 'Review past days, scores, streaks, and trend lines.',
  },
  '/settings': {
    title: 'Settings',
    description: 'Tune your theme and account details.',
  },
}

export function AppShell() {
  const { pathname } = useLocation()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const pageMeta = pathname.startsWith('/history/')
    ? {
        title: 'Daily detail',
        description: 'Review every logged value for a specific day.',
      }
    : pageTitles[pathname] ?? pageTitles['/today']

  async function handleSignOut() {
    try {
      await signOutUser()
      toast.success('Signed out')
      navigate('/signin', { replace: true })
    } catch {
      toast.error('Could not sign out right now.')
    }
  }

  return (
    <div className="app-frame gap-6">
      <header className="surface-card sticky top-4 z-30 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <LogoMark />
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {pageMeta.title}
              </p>
              <h1 className="mt-1 text-3xl sm:text-4xl">{pageMeta.title}</h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {pageMeta.description}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open account menu">
                <CalendarDays className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.displayName || 'DAIL member'}</DropdownMenuLabel>
              <DropdownMenuLabel className="normal-case tracking-normal">
                {profile?.email || ''}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <FirebaseBanner />

      <main className="flex-1 space-y-6 pb-6">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/96 px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur md:left-1/2 md:max-w-2xl md:-translate-x-1/2 md:rounded-t-[2rem] md:border">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-14 flex-col items-center justify-center rounded-2xl text-xs font-medium text-muted-foreground transition',
                  isActive && 'bg-accent text-accent-foreground',
                )
              }
            >
              <item.icon className="mb-1 size-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
