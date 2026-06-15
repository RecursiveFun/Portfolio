const { promises: fs } = require('fs')
const path = require('path')
const RSS = require('rss')
const { SITE_URL, SITE_NAME } = require('./site-config')
const { getPosts } = require('./get-posts')

async function generate() {
  const feed = new RSS({
    title: SITE_NAME,
    site_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.xml`,
    description:
      'Software development projects, tutorials, and updates from Felix Berinde.'
  })

  const allPosts = await getPosts()
  allPosts.forEach((post) => {
    feed.item({
      title: post.title,
      url: '/posts/' + post.slug,
      date: post.date,
      description: post.description,
      categories: post.tag ? post.tag.split(', ') : [],
      author: post.author
    })
  })
  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }))
}

generate()
