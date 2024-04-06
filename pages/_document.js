import { Html, Head, Main, NextScript } from 'next/document'


export default function Document() {
  const meta = {
    title: 'Felix Berinde\'s Portfolio',
    description: 'Welcome to my portfolio page that showcases some of my projects and what I\'m up to.',
    image: 'https://assets.vercel.com/image/upload/q_auto/front/vercel/dps.png'
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@FelixBerinde" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0032622662460947"
        crossOrigin="anonymous"></script>

        {/* Google adsense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0032622662460947"
        crossorigin="anonymous"></script>
        <meta name="google-adsense-account" content="ca-pub-0032622662460947"></meta>
        
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
