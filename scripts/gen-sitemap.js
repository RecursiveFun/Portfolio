const { promises: fs } = require('fs')
const path = require('path')
const matter = require('gray-matter')

const SITE_URL = 'https://www.berinde.dev'

const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/resume', priority: '0.8', changefreq: 'monthly' },
  { path: '/posts', priority: '0.9', changefreq: 'weekly' },
  { path: '/contact', priority: '0.6', changefreq: 'yearly' },
  { path: '/privacy', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms', priority: '0.4', changefreq: 'yearly' }
]

function formatDate(date) {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().split('T')[0]
  return parsed.toISOString().split('T')[0]
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function generate() {
  const postsDir = path.join(__dirname, '..', 'pages', 'posts')
  const postFiles = await fs.readdir(postsDir)

  const postEntries = await Promise.all(
    postFiles.map(async (name) => {
      if (name.startsWith('index.')) return null

      const content = await fs.readFile(path.join(postsDir, name))
      const { data } = matter(content)
      const slug = name.replace(/\.mdx?$/, '')

      return urlEntry(
        `${SITE_URL}/posts/${slug}`,
        formatDate(data.date),
        'monthly',
        '0.7'
      )
    })
  )

  const staticEntries = staticPages.map((page) =>
    urlEntry(
      `${SITE_URL}${page.path}`,
      formatDate(new Date()),
      page.changefreq,
      page.priority
    )
  )

  const urls = [...staticEntries, ...postEntries.filter(Boolean)].join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

  await fs.writeFile(
    path.join(__dirname, '..', 'public', 'sitemap.xml'),
    sitemap
  )
}

generate()
