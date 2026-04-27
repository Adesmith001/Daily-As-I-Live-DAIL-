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
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <LogoMark />
        <div className="page-header border-b-0 pb-0">
          <div className="space-y-3">
            <p className="theme-chip inline-flex px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
                Welcome
            </p>
            <h1 className="text-4xl tracking-[-0.06em]">{title}</h1>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="space-y-6 p-6">

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
