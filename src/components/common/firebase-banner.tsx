import { AlertTriangle } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { isFirebaseConfigured } from '@/lib/firebase'

export function FirebaseBanner() {
  if (isFirebaseConfigured) {
    return null
  }

  return (
    <Card className="border-amber-300/70 bg-amber-50/90 text-amber-950">
      <CardContent className="flex gap-3 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Firebase environment variables are missing.</p>
          <p>
            Add the values from `.env.example` before testing authentication or
            Firestore features.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
