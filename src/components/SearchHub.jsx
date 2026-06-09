import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  Sparkles, 
  FileText, 
  FolderPlus, 
  GraduationCap, 
  Loader2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { searchAllSources } from '../utils/api';
import { curatedResources } from '../data/curatedResources';

export default function SearchHub({ 
  query, 
  setQuery, 
  filters, 
  setFilters, 
  onSaveItem, 
  onStudyItem, 
  savedItems 
}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  // Compute matching pre-planted courses
  const matchingCourses = useMemo(() => {
    if (!query) {
      // Default featured courses list when input is focused but empty
      return curatedResources.slice(0, 5);
    }
    const q = query.toLowerCase();
    return curatedResources.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.subtopic.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query]);

  // Trigger search whenever query or filters change
  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const data = await searchAllSources(query, filters);
        setResults(data);
      } catch (err) {
        console.error("Search execution failed", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input to avoid hitting APIs on every character keystroke
    const delayDebounce = setTimeout(() => {
      performSearch();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, filters]);

  // Trigger math formatting whenever search results change
  useEffect(() => {
    if (window.renderMathInElement && results.length > 0) {
      const timer = setTimeout(() => {
        try {
          window.renderMathInElement(document.body, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false },
              { left: "\\(", right: "\\)", display: false },
              { left: "\\[", right: "\\]", display: true }
            ],
            throwOnError: false
          });
        } catch (err) {
          console.error("KaTeX local search render failed:", err);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [results]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSuggestionClick = (keyword, subject) => {
    setQuery(keyword);
    setFilters(prev => ({
      ...prev,
      subject: subject || 'All Subjects'
    }));
  };

  const isSaved = (itemId) => {
    return savedItems.some(item => item.id === itemId);
  };

  const subjectsList = ['All Subjects', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Humanities'];
  const typesList = [
    { label: 'All Types', value: 'All Types' },
    { label: 'Videos', value: 'video' },
    { label: 'Articles', value: 'article' },
    { label: 'Research Papers', value: 'paper' },
    { label: 'Simulations', value: 'simulation' }
  ];
  const gradesList = ['All Grades', 'Grade 11', 'Grade 12'];
  const difficultiesList = ['All Difficulties', 'Introductory', 'Intermediate', 'Advanced', 'AP/IB Level'];

  const suggestions = [
    { text: 'Essence of Calculus', subject: 'Mathematics' },
    { text: 'CRISPR Gene Editing', subject: 'Biology' },
    { text: 'Projectile Motion Sim', subject: 'Physics' },
    { text: 'Organic Chemistry Roadmap', subject: 'Chemistry' },
    { text: 'Harvard CS50', subject: 'Computer Science' }
  ];

  return (
    <div className="search-hub-view animate-fade-in">
      <div className="view-header flex-between">
        <div>
          <h2>Academic Search Engine</h2>
          <p>Search standard internet indexes, encyclopedia definitions, and research databases.</p>
        </div>
        <button 
          className={`btn btn-secondary filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Main Search Panel */}
      <section className="search-bar-panel glass-panel">
        <div className="search-input-wrapper">
          <SearchIcon className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Type subject, topic, or question (e.g. derivatives, thermodynamics, dna replication)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
          {loading && <Loader2 className="loading-spinner animate-spin" size={20} />}

          {/* Planted Courses Dropdown */}
          {isFocused && matchingCourses.length > 0 && (
            <div className="search-suggestions-dropdown glass-panel">
              <div className="dropdown-header">Planted Course Modules & Topics</div>
              <div className="dropdown-items">
                {matchingCourses.map(item => (
                  <div 
                    key={item.id} 
                    className="dropdown-item flex-between"
                    onMouseDown={() => {
                      setQuery(item.title);
                      setFilters(prev => ({
                        ...prev,
                        subject: item.subject
                      }));
                    }}
                  >
                    <div className="item-details">
                      <span className="item-title">{item.title}</span>
                      <span className="item-subtopic">{item.subject} • {item.subtopic}</span>
                    </div>
                    <div className="item-meta flex-center" style={{ gap: '0.5rem' }}>
                      <span className={`badge badge-${item.resourceType}`}>{item.resourceType}</span>
                      <span className="badge-difficulty" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {item.difficulty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Suggestion list */}
        <div className="suggestions-row">
          <span className="suggestion-label"><Sparkles size={12} /> Suggestions:</span>
          <div className="suggestion-pills">
            {suggestions.map((s) => (
              <button 
                key={s.text}
                onClick={() => handleSuggestionClick(s.text, s.subject)}
                className="suggestion-pill"
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="search-body-layout">
        {/* Filters Panel Sidebar */}
        {showFilters && (
          <aside className="filters-sidebar glass-panel animate-fade-in">
            <h3>Refine Query</h3>
            
            <div className="filter-group">
              <label>Subject Domain</label>
              <select 
                className="input-field select-field" 
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
              >
                {subjectsList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Resource Type</label>
              <select 
                className="input-field select-field" 
                value={filters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
              >
                {typesList.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Target Grade</label>
              <select 
                className="input-field select-field" 
                value={filters.gradeLevel}
                onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
              >
                {gradesList.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Difficulty Tier</label>
              <select 
                className="input-field select-field" 
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              >
                {difficultiesList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <button 
              className="btn btn-secondary clear-filters-btn"
              onClick={() => setFilters({
                subject: 'All Subjects',
                resourceType: 'All Types',
                gradeLevel: 'All Grades',
                difficulty: 'All Difficulties'
              })}
            >
              Reset Filters
            </button>
          </aside>
        )}

        {/* Results Stream */}
        <main className="results-stream">
          <div className="results-header flex-between">
            <span className="results-count">Found {results.length} resources</span>
            <span className="results-source">Sources: Vetted Index, Wikipedia, arXiv, EuropePMC</span>
          </div>

          <div className="results-list">
            {loading && results.length === 0 ? (
              <div className="results-loading glass-card flex-center">
                <Loader2 className="animate-spin" size={32} />
                <p>Scouring academic index tables...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((item) => (
                <div key={item.id} className="result-card glass-card">
                  <div className="card-header flex-between">
                    <div className="card-badges">
                      <span className={`badge badge-${item.resourceType}`}>{item.resourceType}</span>
                      <span className="badge-subject" style={{ color: item.subject === 'Mathematics' ? '#6366f1' : item.subject === 'Physics' ? '#3b82f6' : item.subject === 'Chemistry' ? '#f59e0b' : item.subject === 'Biology' ? '#10b981' : '#ec4899' }}>
                        {item.subject}
                      </span>
                    </div>
                    <div className="card-difficulty">{item.difficulty}</div>
                  </div>

                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-desc">{item.description}</p>

                  <div className="card-footer flex-between">
                    <span className="card-provider">via <strong>{item.provider}</strong></span>
                    <div className="card-actions">
                      <button 
                        className={`btn btn-secondary action-btn ${isSaved(item.id) ? 'saved' : ''}`}
                        onClick={() => onSaveItem(item)}
                        disabled={isSaved(item.id)}
                      >
                        <FolderPlus size={16} />
                        <span>{isSaved(item.id) ? 'Saved' : 'Save to Binder'}</span>
                      </button>
                      <button 
                        className="btn btn-primary action-btn"
                        onClick={() => onStudyItem(item)}
                      >
                        <BookOpen size={16} />
                        <span>Study & Notes</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-results glass-card flex-center">
                <GraduationCap size={48} className="empty-icon" />
                <h3>No materials found</h3>
                <p>Try refining your query, adjusting filters, or selecting one of our concept suggestions above.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .search-hub-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .view-header h2 {
          font-size: 1.8rem;
          margin-bottom: 0.25rem;
        }

        .filter-toggle-btn.active {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        /* Search input bar layout */
        .search-bar-panel {
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 1rem 1.25rem 1rem 3.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 1.05rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 4px var(--accent-glow);
        }

        .loading-spinner {
          position: absolute;
          right: 1.25rem;
          color: var(--accent-primary);
        }

        /* Suggestion rows */
        .suggestions-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .suggestion-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .suggestion-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .suggestion-pill {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggestion-pill:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        /* Results & filters side layout */
        .search-body-layout {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        /* Filters sidebar */
        .filters-sidebar {
          width: 240px;
          flex-shrink: 0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .filters-sidebar h3 {
          font-size: 1.1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .select-field {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='none' stroke='%236b7280' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'></path></svg>");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2rem;
        }

        .clear-filters-btn {
          width: 100%;
          font-size: 0.85rem;
          padding: 0.5rem;
        }

        /* Results stream list */
        .results-stream {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .results-header {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 590px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .results-list::-webkit-scrollbar {
          width: 6px;
        }

        .results-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }

        .results-list::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 3px;
        }

        .results-list::-webkit-scrollbar-thumb:hover {
          background: var(--accent-primary);
        }

        /* Result card layout */
        .result-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.5rem;
        }

        .card-header {
          display: flex;
          align-items: center;
        }

        .card-badges {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .badge-subject {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .card-difficulty {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .card-title {
          font-size: 1.2rem;
          line-height: 1.3;
        }

        .card-desc {
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .card-footer {
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .card-provider {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .action-btn.saved {
          background: rgba(99, 102, 241, 0.05);
          border-color: var(--border-color);
          color: var(--text-muted);
          cursor: not-allowed;
        }

        /* Loaders and Empty States */
        .results-loading {
          padding: 3rem;
          flex-direction: column;
          gap: 1rem;
        }

        .empty-results {
          padding: 4rem;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--text-muted);
        }

        .empty-results h3 {
          font-size: 1.25rem;
        }

        .empty-results p {
          max-width: 400px;
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .search-body-layout {
            flex-direction: column;
          }
          .filters-sidebar {
            width: 100%;
          }
        }

        /* Search Suggestions Dropdown styles */
        .search-suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 1000;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          margin-top: 0.5rem;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
          animation: fadeIn 0.2s ease-out;
        }

        .dropdown-header {
          padding: 0.6rem 1.25rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(0, 0, 0, 0.1);
        }

        .dropdown-items {
          max-height: 280px;
          overflow-y: auto;
        }

        .dropdown-item {
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dropdown-item:hover {
          background: rgba(99, 102, 241, 0.08);
        }

        .dropdown-item:last-child {
          border-bottom: none;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .item-subtopic {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
