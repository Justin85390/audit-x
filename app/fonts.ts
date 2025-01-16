import localFont from 'next/font/local'

export const geist = localFont({
  src: [
    {
      path: './fonts/GeistVF.woff2',
      weight: '400',
    },
  ],
  variable: '--font-geist'
})

export const geistMono = localFont({
  src: [
    {
      path: './fonts/GeistMonoVF.woff2',
      weight: '400',
    },
  ],
  variable: '--font-geist-mono'
}) 