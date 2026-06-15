const { promises: fs } = require('fs')
const path = require('path')
const { getPosts } = require('./get-posts')

async function generate() {
  const posts = await getPosts()
  const outDir = path.join(__dirname, '..', 'data')

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(
    path.join(outDir, 'posts-index.json'),
    JSON.stringify(posts, null, 2)
  )
}

generate()
