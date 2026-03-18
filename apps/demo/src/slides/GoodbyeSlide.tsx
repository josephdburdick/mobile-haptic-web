export function GoodbyeSlide() {
  return (
    <div className="goodbyeStack">
      <h2 className="goodbyeTitle">Thanks for exploring.</h2>
      <p className="goodbyeBody">
        This is an open-source proof of concept. The components can be published as
        an npm package and used in any React project.
      </p>
      <div className="goodbyeLinks">
        <a className="primaryLink" href="https://j0e.me" target="_blank" rel="noreferrer">
          j0e.me &rarr;
        </a>
        <a
          className="primaryLink"
          href="https://github.com/josephdburdick/mobile-haptic-web"
          target="_blank"
          rel="noreferrer"
        >
          Source on GitHub
        </a>
      </div>
      <hr className="goodbyeDivider" />
      <p className="goodbyeFooter">Built with web-haptics, Vite, and React.</p>
    </div>
  )
}
