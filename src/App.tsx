import { Toaster } from 'sonner'

import { AppRouter } from '@/app/router'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/contexts/theme-context'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRouter />
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast:
                'border border-border bg-card text-card-foreground shadow-lg',
              title: 'text-sm font-semibold',
              description: 'text-sm text-muted-foreground',
            },
          }}
        />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
