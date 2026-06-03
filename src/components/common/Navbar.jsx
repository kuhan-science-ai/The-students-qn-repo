import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Search, 
  FolderHeart, 
  GraduationCap, 
  Sun, 
  Moon,
  Library
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, theme, toggleTheme }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'navigator', label: 'Curriculum Roadmap', icon: Map },
    { id: 'search', label: 'Search Hub', icon: Search },
    { id: 'collections', label: 'My Study Binder', icon: FolderHeart },
  ];

  return (
    <>
      {/* Mobile top navigation header */}
      <header className="mobile-header glass-panel">
        <div className="logo-section">
          <GraduationCap className="logo-icon animate-pulse" />
          <span className="logo-text">Study<span className="logo-accent">Space</span></span>
        </div>
        <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Desktop sidebar navigation */}
      <aside className="sidebar-nav glass-panel">
        <div className="logo-section">
          <GraduationCap className="logo-icon" size={32} />
          <span className="logo-text">Study<span className="logo-accent">Space</span></span>
        </div>

        <div className="student-profile">
          <div className="profile-avatar">
            <Library size={20} />
          </div>
          <div className="profile-info">
            <span className="profile-name">Student Workbench</span>
            <span className="profile-grade">Grade 11 & 12</span>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.label}</span>
                {isActive && <div className="active-indicator" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? (
              <>
                <Sun size={18} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={18} />
                <span>Dark Mode</span>
              </>
            )}
          </button>
          <div className="credits">v1.1.0 • Academic Hub</div>
        </div>
      </aside>

      <style>{`
        /* Sidebar container styles */
        .sidebar-nav {
          position: fixed;
          top: 1.5rem;
          left: 1.5rem;
          bottom: 1.5rem;
          width: 240px;
          display: flex;
          flex-direction: column;
          padding: 1.75rem 1.25rem;
          z-index: 100;
          border-radius: 20px;
          height: calc(100vh - 3rem);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .logo-text {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1.4rem;
          letter-spacing: -0.03em;
        }

        .logo-accent {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Profile card widget */
        .student-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: var(--bg-tertiary);
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid var(--border-color);
        }

        .profile-avatar {
          background: var(--accent-glow);
          color: var(--accent-primary);
          padding: 0.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .profile-grade {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Nav menu links */
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--accent-glow);
          color: var(--accent-primary);
        }

        .nav-icon {
          transition: transform 0.2s ease;
        }

        .nav-link:hover .nav-icon {
          transform: scale(1.08);
        }

        .nav-link.active .nav-icon {
          color: var(--accent-primary);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 4px;
          background: var(--accent-primary);
          border-radius: 0 4px 4px 0;
        }

        /* Sidebar Footer details */
        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sidebar-footer .theme-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.7rem;
          border-radius: 10px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-footer .theme-toggle-btn:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .credits {
          font-size: 0.65rem;
          color: var(--text-muted);
          text-align: center;
          font-weight: 500;
        }

        /* Mobile Layout */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.25rem;
          z-index: 100;
          border-radius: 0;
          border-bottom: 1px solid var(--border-color);
        }

        .mobile-header .theme-toggle-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 0.4rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .sidebar-nav {
            display: none;
          }
          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
