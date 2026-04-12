import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { LoadingScreen } from '@/components/common/loading-screen'
import { useAuth } from '@/contexts/auth-context'
import { DailyDetailPage } from '@/pages/daily-detail-page'
import { ExercisesPage } from '@/pages/exercises-page'
import { HistoryPage } from '@/pages/history-page'
import { LandingPage } from '@/pages/landing-page'
import { SettingsPage } from '@/pages/settings-page'
import { SignInPage } from '@/pages/sign-in-page'
import { SignUpPage } from '@/pages/sign-up-page'
import { TodayPage } from '@/pages/today-page'
import { TrackersPage } from '@/pages/trackers-page'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return <Navigate to="/today" replace />
  }

  return <Outlet />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/today" element={<TodayPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/trackers" element={<TrackersPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:date" element={<DailyDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
