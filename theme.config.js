const YEAR = new Date().getFullYear()

export default {
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>
      <time>{YEAR}</time> © Felix Berinde.
      <a href="/feed.xml">RSS</a>
      <style jsx>{`
        a {
          float: right;
        }
      `}</style>
    </small>
  )
}
