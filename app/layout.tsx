import './globals.css'
import { Montserrat, Open_Sans } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-titles' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-body' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${openSans.variable} font-body bg-black text-white`}>
        {children}
      </body>
    </html>
  )
}
