const YEAR = new Date().getFullYear()

export default {
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>
      <time>{YEAR}</time> © Felix Berinde.
      <span className="footer-links">
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/feed.xml">RSS</a>
      </span>
      <style jsx>{`
        .footer-links {
          float: right;
        }
        .footer-links a {
          margin-left: 1rem;
        }
      `}</style>
    </small>
  )
}
