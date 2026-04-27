import {
  ChartNoAxesColumn,
  ChevronDown,
  Dumbbell,
  ListTodo,
  LogOut,
  Settings,
  SunMedium,
  Trophy,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { FirebaseBanner } from '@/components/common/firebase-banner'
import { LogoMark } from '@/components/common/logo-mark'
import { WeekStrip } from '@/components/common/week-strip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { signOutUser } from '@/services/auth-service'
import { cn } from '@/lib/utils'

const navigationItems = [
  { to: '/today', label: 'Today', icon: SunMedium },
  { to: '/exercises', label: 'Exercises', icon: Dumbbell },
  { to: '/trackers', label: 'Trackers', icon: ListTodo },
  { to: '/history', label: 'History', icon: ChartNoAxesColumn },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
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
  '/exercises': {
    title: 'Exercises',
    description: 'Follow your day-by-day plan, lock in progress, and tune each movement.',
  },
  '/history': {
    title: 'History',
    description: 'Review past days, scores, streaks, and trend lines.',
  },
  '/leaderboard': {
    title: 'Leaderboard',
    description: 'Track weekly XP rankings and rivalry progress.',
  },
  '/settings': {
    title: 'Settings',
    description: 'Tune your theme and account details.',
  },
}

function getUserInitials(displayName: string) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'D'
}

export function AppShell() {
  const { pathname } = useLocation()
  const { profile, user } = useAuth()
  const navigate = useNavigate()

  const pageMeta = pathname.startsWith('/history/')
    ? {
        title: 'Daily detail',
        description: 'Review every logged value for a specific day.',
      }
    : pageTitles[pathname] ?? pageTitles['/today']

  const displayName = profile?.displayName || user?.displayName || 'DAIL member'
  const accountEmail = profile?.email || user?.email || ''
  const profilePhotoUrl = user?.photoURL || null
  const userInitials = getUserInitials(displayName)
  const showWeekStrip = pathname !== '/exercises'

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
    <div className="app-frame">
      <div className="shell-layout">
        <aside className="shell-sidebar">
          <div className="space-y-8">
            <LogoMark />
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavLink key={item.to} to={item.to} className="block">
                  {({ isActive }) => (
                    <div
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground',
                        isActive && 'text-foreground',
                      )}
                    >
                      <item.icon className="size-4" />
                      <span className="flex flex-1 items-center justify-between gap-3">
                        <span>{item.label}</span>
                        <span
                          className={cn(
                            'size-1.5 rounded-full transition',
                            isActive ? 'bg-foreground' : 'bg-transparent',
                          )}
                        />
                      </span>
                    </div>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="shell-main">
          <header className="space-y-5 border-b border-border pb-5">
            <div className="flex items-start justify-between gap-4 lg:justify-end">
              <LogoMark className="lg:hidden" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Open account menu"
                    className="flex items-center gap-3 rounded-full border border-border bg-card px-2.5 py-1.5 text-left transition hover:border-foreground/15 hover:bg-muted/70"
                    type="button"
                  >
                    <span className="flex min-w-0 flex-col text-right">
                      <span className="max-w-32 truncate text-sm font-semibold text-foreground">
                        {displayName}
                      </span>
                    </span>
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-semibold text-foreground">
                      {profilePhotoUrl ? (
                        <img
                          alt={displayName}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                          src={profilePhotoUrl}
                        />
                      ) : (
                        userInitials
                      )}
                    </span>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel className="space-y-1">
                    <p className="font-semibold text-foreground">{displayName}</p>
                    {accountEmail ? (
                      <p className="truncate text-xs font-normal tracking-normal text-muted-foreground">
                        {accountEmail}
                      </p>
                    ) : null}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 size-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="section-kicker">
                  {pathname === '/today' ? 'Daily focus' : pageMeta.title}
                </p>
                <h1 className="mt-2 text-[2.3rem] leading-none sm:text-[2.7rem]">
                  {pathname === '/today' ? 'You are doing great!' : pageMeta.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {pageMeta.description}
                </p>
              </div>
              {showWeekStrip ? (
                <div className="lg:w-[28rem]">
                  <WeekStrip />
                </div>
              ) : null}
            </div>
          </header>

          <FirebaseBanner />

          <main className="flex-1 space-y-6 pb-6">
            <Outlet />
          </main>
        </div>
      </div>

      <nav className="frosted-strip fixed inset-x-4 bottom-0 z-40 px-3 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-2">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="block">
              {({ isActive }) => (
                <div
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center rounded-xl text-[0.7rem] font-medium text-muted-foreground transition hover:text-foreground',
                    isActive && 'text-foreground',
                  )}
                >
                  <item.icon className="size-4" />
                  <span className="mt-1">{item.label}</span>
                  <span
                    className={cn(
                      'mt-1 h-1 w-6 rounded-full transition',
                      isActive ? 'bg-foreground' : 'bg-transparent',
                    )}
                  />
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
