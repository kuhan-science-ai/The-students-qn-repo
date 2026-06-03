import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  Clock, 
  CheckCircle, 
  Play, 
  ArrowRight,
  BookOpen,
  Atom,
  TestTube,
  Dna,
  Terminal,
  Globe2
} from 'lucide-react';

export default function Dashboard({ setActivePage, setFilters, setQuery, savedItems }) {
  const [stats, setStats] = useState({ saved: 0, inProgress: 0, completed: 0 });
  const [recents, setRecents] = useState([]);

  // Calculate statistics and active items on mount and update
  useEffect(() => {
    const savedCount = savedItems.length;
    const inProgressCount = savedItems.filter(item => item.status === 'in-progress').length;
    const completedCount = savedItems.filter(item => item.status === 'completed').length;
    
    setStats({
      saved: savedCount,
      inProgress: inProgressCount,
      completed: completedCount
    });

    // Get the top 3 most recently added/updated items
    const sortedRecents = [...savedItems]
      .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0))
      .slice(0, 3);
    setRecents(sortedRecents);
  }, [savedItems]);

  const handleSubjectClick = (subjectName) => {
    setQuery('');
    setFilters({
      subject: subjectName,
      resourceType: 'All Types',
      gradeLevel: 'All Grades',
      difficulty: 'All Difficulties'
    });
    setActivePage('search');
  };

  const handleSpotlightSearch = () => {
    setQuery('Quantum entanglement');
    setFilters({
      subject: 'Physics',
      resourceType: 'All Types',
      gradeLevel: 'All Grades',
      difficulty: 'All Difficulties'
    });
    setActivePage('search');
  };

  const subjects = [
    { name: 'Mathematics', icon: BookOpen, color: '#6366f1', count: '3 Resources', desc: 'Calculus, Algebra & Matrices' },
    { name: 'Physics', icon: Atom, color: '#3b82f6', count: '3 Resources', desc: 'Kinematics, Electromagnetism & Circuits' },
    { name: 'Chemistry', icon: TestTube, color: '#f59e0b', count: '3 Resources', desc: 'Bonding, Atoms & Organic Chemistry' },
    { name: 'Biology', icon: Dna, color: '#10b981', count: '3 Resources', desc: 'Genetics, Cells & Biochemistry' },
    { name: 'Computer Science', icon: Terminal, color: '#06b6d4', count: '2 Resources', desc: 'CS50 Programming & Systems' },
    { name: 'Humanities', icon: Globe2, color: '#ec4899', count: '2 Resources', desc: 'World History & Macroeconomics' },
  ];

  return (
    <div className="dashboard-view animate-fade-in">
      <div className="welcome-banner">
        <div>
          <h1 className="welcome-title">Hello, Scholar! <span className="hand-wave">👋</span></h1>
          <p className="welcome-subtitle">Explore curriculum topics, search for academic papers, and build your note repository.</p>
        </div>
        <div className="welcome-glow-icon">
          <Sparkles size={28} className="glow-sparkle" />
        </div>
      </div>

      {/* Stats Board */}
      <section className="stats-row">
        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper purple-bg">
            <Bookmark size={22} className="purple-text" />
          </div>
          <div>
            <h3>{stats.saved}</h3>
            <p>Saved Binder Items</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper amber-bg">
            <Clock size={22} className="amber-text" />
          </div>
          <div>
            <h3>{stats.inProgress}</h3>
            <p>Sessions In Progress</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-wrapper emerald-bg">
            <CheckCircle size={22} className="emerald-text" />
          </div>
          <div>
            <h3>{stats.completed}</h3>
            <p>Completed Studies</p>
          </div>
        </div>
      </section>

      {/* Two column split */}
      <div className="dashboard-content-split">
        {/* Left Column: Subjects Grid */}
        <section className="subjects-section">
          <div className="section-header">
            <h2>Explore Core Subjects</h2>
            <p>Navigate mapped grade 11 & 12 curriculum blocks</p>
          </div>

          <div className="subjects-grid">
            {subjects.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <div 
                  key={sub.name}
                  className="subject-tile glass-card"
                  onClick={() => handleSubjectClick(sub.name)}
                >
                  <div className="subject-icon" style={{ backgroundColor: `${sub.color}15`, color: sub.color }}>
                    <SubIcon size={24} />
                  </div>
                  <div>
                    <h4>{sub.name}</h4>
                    <p className="subject-desc">{sub.desc}</p>
                    <div className="subject-meta">
                      <span className="resource-count">{sub.count}</span>
                      <ArrowRight size={14} className="tile-arrow" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Spotlight and Recents */}
        <div className="dashboard-aside">
          {/* Spotlight Card */}
          <section className="spotlight-card glass-panel">
            <div className="spotlight-badge">Daily Spotlight</div>
            <h3>Quantum Entanglement</h3>
            <p>
              Learn about the physics phenomenon Einstein called "spooky action at a distance." Explore articles, 
              simulations, and modern research papers.
            </p>
            <button className="btn btn-primary" onClick={handleSpotlightSearch}>
              <span>Explore Concept</span>
              <ArrowRight size={16} />
            </button>
          </section>

          {/* Recent binder items */}
          <section className="recents-section">
            <h3>Recent Studies</h3>
            <div className="recents-list">
              {recents.length > 0 ? (
                recents.map((item) => (
                  <div 
                    key={item.id} 
                    className="recent-item glass-card"
                    onClick={() => {
                      setQuery('');
                      setActivePage('collections');
                    }}
                  >
                    <div className="recent-meta">
                      <span className={`badge badge-${item.resourceType}`}>{item.resourceType}</span>
                      <span className="recent-time">
                        {item.status === 'completed' ? 'Done' : 'In Progress'}
                      </span>
                    </div>
                    <h4>{item.title}</h4>
                    <p className="recent-provider">{item.provider}</p>
                  </div>
                ))
              ) : (
                <div className="empty-recents glass-card flex-center">
                  <p>No studies started yet. Head to the **Search Hub** to find materials and start note-taking!</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Welcome Banner */
        .welcome-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          border: 1px solid var(--border-color);
          padding: 2.25rem;
          border-radius: 20px;
          position: relative;
          overflow: hidden;
        }

        .welcome-banner::before {
          content: '';
          position: absolute;
          top: -50px;
          right: -50px;
          width: 150px;
          height: 150px;
          background: var(--accent-glow);
          filter: blur(50px);
          border-radius: 50%;
        }

        .welcome-title {
          font-size: 2.2rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .welcome-subtitle {
          font-size: 1rem;
        }

        .welcome-glow-icon {
          background: var(--accent-glow);
          color: var(--accent-primary);
          padding: 1rem;
          border-radius: 50%;
          border: 1px solid var(--border-glow);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .glow-sparkle {
          animation: pulseGlow 3s infinite ease-in-out;
        }

        .hand-wave {
          display: inline-block;
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
        }

        @keyframes wave {
          0%, 100% { transform: rotate( 0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate( 0.0deg) }
        }

        /* Stats Strip */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem 1.5rem;
        }

        .stat-card h3 {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .stat-card p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .stat-icon-wrapper {
          padding: 0.8rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .purple-bg { background: rgba(99, 102, 241, 0.12); }
        .purple-text { color: var(--accent-primary); }
        .amber-bg { background: rgba(245, 158, 11, 0.12); }
        .amber-text { color: var(--color-sim); }
        .emerald-bg { background: rgba(16, 185, 129, 0.12); }
        .emerald-text { color: var(--color-video); }

        /* Two columns layout */
        .dashboard-content-split {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .stats-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .dashboard-content-split {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        /* Subjects Grid Section */
        .subjects-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-header h2 {
          font-size: 1.4rem;
          margin-bottom: 0.25rem;
        }

        .section-header p {
          font-size: 0.85rem;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (max-width: 640px) {
          .subjects-grid {
            grid-template-columns: 1fr;
          }
        }

        .subject-tile {
          display: flex;
          gap: 1.1rem;
          cursor: pointer;
          align-items: flex-start;
        }

        .subject-tile h4 {
          font-size: 1.05rem;
          margin-bottom: 0.25rem;
        }

        .subject-desc {
          font-size: 0.75rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .subject-icon {
          padding: 0.75rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .subject-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .resource-count {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-primary);
          background: var(--accent-glow);
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
        }

        .tile-arrow {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .subject-tile:hover .tile-arrow {
          transform: translateX(4px);
          color: var(--accent-primary);
        }

        /* Spotlight and Recents sidebar */
        .dashboard-aside {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .spotlight-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          border-color: var(--accent-primary);
          box-shadow: 0 0 20px var(--accent-glow);
          position: relative;
        }

        .spotlight-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--accent-secondary);
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .spotlight-card h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          margin-top: 0.5rem;
        }

        .spotlight-card p {
          font-size: 0.8rem;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        /* Recents list */
        .recents-section {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .recents-section h3 {
          font-size: 1.2rem;
        }

        .recents-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .recent-item {
          padding: 1rem;
          cursor: pointer;
        }

        .recent-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .recent-item h4 {
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .recent-provider {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .recent-time {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-primary);
        }

        .empty-recents {
          padding: 1.5rem;
          text-align: center;
          border-style: dashed;
        }

        .empty-recents p {
          font-size: 0.8rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
