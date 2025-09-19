import Head from 'next/head'

export function Favicon() {
  return (
    <Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <meta name="theme-color" content="#FFBC1F" />
      <meta name="msapplication-TileColor" content="#FFBC1F" />
      <meta name="msapplication-TileImage" content="/favicon-64x64.png" />
    </Head>
  )
}
