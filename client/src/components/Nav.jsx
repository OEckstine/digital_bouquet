const LINKS = ["build", "share", "collab", "garden"];

export default function Nav({ page, onNavigate, showLinks = true }) {
  return (
    <nav className="nav">
      <button className="nav-logo" onClick={() => onNavigate?.("home")}>
        FlowerFinder
      </button>
      {showLinks && (
        <div className="nav-links">
          {LINKS.map((link) => (
            <button
              key={link}
              className={`nav-link ${page === link ? "active" : ""}`}
              onClick={() => onNavigate(link)}
            >
              {link[0].toUpperCase() + link.slice(1)}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
