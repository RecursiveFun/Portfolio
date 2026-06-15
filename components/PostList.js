import Link from 'next/link'
import posts from '../data/posts-index.json'

export default function PostList() {
  return (
    <>
      {posts.map((post) => {
        const date = post.date ? new Date(post.date) : null
        const href = `/posts/${post.slug}`

        return (
          <div className="post-item" key={post.slug}>
            <h3>
              <Link href={href} passHref legacyBehavior>
                <a className="!nx-no-underline">{post.title}</a>
              </Link>
            </h3>
            {post.description && (
              <p className="nx-mb-2 dark:nx-text-gray-400 nx-text-gray-600">
                {post.description}
                <Link href={href} passHref legacyBehavior>
                  <a className="post-item-more nx-ml-2">Read More →</a>
                </Link>
              </p>
            )}
            {date && !Number.isNaN(date.getTime()) && (
              <time
                className="nx-text-sm dark:nx-text-gray-400 nx-text-gray-600"
                dateTime={date.toISOString()}
              >
                {date.toDateString()}
              </time>
            )}
          </div>
        )
      })}
    </>
  )
}
