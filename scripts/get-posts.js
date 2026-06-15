const { promises: fs } = require('fs')
const path = require('path')
const matter = require('gray-matter')

const POSTS_DIR = path.join(__dirname, '..', 'pages', 'posts')

async function getPosts() {
  const files = await fs.readdir(POSTS_DIR)
  const posts = await Promise.all(
    files.map(async (name) => {
      if (name.startsWith('index.')) return null

      const content = await fs.readFile(path.join(POSTS_DIR, name), 'utf8')
      const { data } = matter(content)
      const slug = name.replace(/\.mdx?$/, '')

      return {
        slug,
        title: data.title,
        date: data.date,
        description: data.description,
        tag: data.tag,
        author: data.author
      }
    })
  )

  return posts
    .filter(Boolean)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

module.exports = { getPosts }
