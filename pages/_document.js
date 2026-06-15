import { Html, Head, Main, NextScript } from 'next/document'

const ADSENSE_CLIENT = 'ca-pub-0032622662460947'

export default function Document() {
  const meta = {
    title: "Felix Berinde's Portfolio",
    description:
      'Software developer portfolio featuring full-stack web, mobile, and desktop projects, tutorials, and technical writing.',
    image: 'https://www.berinde.dev/images/scuba.jpg'
  }

  return (
    <Html lang="en">
      <Head>
        <meta name="robots" content="follow, index" />
        <meta name="description" content={meta.description} />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta property="og:url" content="https://www.berinde.dev" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@FelixBerinde" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
