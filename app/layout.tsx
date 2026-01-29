import './globals.css'
import { Providers } from "./providers"
import React from 'react'

export const metadata = {
  title: 'GEN ALIXIR',
  description: 'Incubateur Numérique',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
