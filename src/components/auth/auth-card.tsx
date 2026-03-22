import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { LogoMark } from '@/components/common/logo-mark'
import { Card, CardContent } from '@/components/ui/card'

export function AuthCard({
  title,
  description,
  footerLabel,
  footerLink,
  footerText,
  children,
}: {
  title: string
  description: string
  footerLabel: string
  footerLink: string
  footerText: string
  children: ReactNode
}) {
  return (
    <div className="app-frame justify-center pb-10 pt-6">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <LogoMark />
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Welcome
              </p>
              <h1 className="text-4xl">{title}</h1>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {children}

            <p className="text-center text-sm text-muted-foreground">
              {footerText}{' '}
              <Link className="font-semibold text-foreground underline-offset-4 hover:underline" to={footerLink}>
                {footerLabel}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
