import './globals.css'
import type { Metadata } from 'next'
import { NotificationProvider } from '@/components/NotificationProvider'

export const metadata: Metadata = {
  title: 'Panaya',
  description: 'E-commerce website',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  )
}
