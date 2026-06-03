import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderPlus, 
  Trash2, 
  Download, 
  BookOpen, 
  FolderOpen, 
  FileText,
  ArrowRight
} from 'lucide-react';

export default function Collections({ 
  savedItems, 
  onUpdateStatus, 
  onRemoveItem, 
  onStudyItem,
  onMoveItemFolder
}) {
  const [folders, setFolders] = useState(['General', 'Exam Prep', 'Term Projects']);
  const [newFolderName, setNewFolderName] = useState('');
  const [activeFolder, setActiveFolder] = useState('General');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [folderProgress, setFolderProgress] = useState(0);

  // Filter items that belong to the current active folder
  const currentFolderItems = savedItems.filter(item => (item.folder || 'General') === activeFolder);

  // Recalculate folder study completion percentage
  useEffect(() => {
    if (currentFolderItems.length === 0) {
      setFolderProgress(0);
      return;
    }
    const completed = currentFolderItems.filter(item => item.status === 'completed').length;
    const percentage = Math.round((completed / currentFolderItems.length) * 100);
    setFolderProgress(percentage);
  }, [currentFolderItems]);

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (newFolderName.trim() === '') return;
    const normalized = newFolderName.trim();
    if (!folders.includes(normalized)) {
      setFolders(prev => [...prev, normalized]);
      setActiveFolder(normalized);
    }
    setNewFolderName('');
    setShowNewFolderInput(false);
  };

  const handleDeleteFolder = (folderName) => {
    if (folderName === 'General') {
      alert("The 'General' binder folder is permanent.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete folder "${folderName}"? All items inside will be moved to "General".`)) {
      savedItems.forEach(item => {
        if (item.folder === folderName) {
          onMoveItemFolder(item.id, 'General');
        }
      });
      setFolders(prev => prev.filter(f => f !== folderName));
      setActiveFolder('General');
    }
  };

  // Multi-Format Note Downloader Utility
  const downloadNotesAs = (item, format) => {
    let content = '';
    let filename = `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    let mimeType = 'text/plain;charset=utf-8;';

    const notesText = item.notes || '';

    if (format === 'txt') {
      content = `STUDYSPACE NOTE EXPORT\nSubject: ${item.subject}\nResource: ${item.title}\nNotes:\n\n${notesText || 'No notes saved.'}`;
      filename += '.txt';
    } else if (format === 'md') {
      content = `# ${item.title}\n- **Subject:** ${item.subject}\n- **Provider:** ${item.provider}\n\n${notesText || '*(No notes)*'}`;
      filename += '.md';
      mimeType = 'text/markdown;charset=utf-8;';
    } else if (format === 'pdf') {
      // PDF Print Trigger Window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${item.title} - Study Sheet PDF</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.65; }
              h1 { color: #4f46e5; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-top: 0; font-size: 24px; }
              .meta { font-size: 13px; color: #64748b; margin-bottom: 25px; font-weight: 700; text-transform: uppercase; }
              .notes-content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
              code { font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-size: 13px; }
            </style>
          </head>
          <body>
            <h1>${item.title}</h1>
            <div class="meta">Subject: ${item.subject} • Provider: ${item.provider} • Folder: ${item.folder || 'General'}</div>
            <div class="notes-content">${notesText || 'No study notes recorded.'}</div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    } else if (format === 'py') {
      // Parser: comment out prose, keep python code executable
      const lines = notesText.split('\n');
      let inCodeBlock = false;
      const pyLines = lines.map(line => {
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return ''; // Strip code block ticks
        }
        if (inCodeBlock) return line;
        return line.trim() === '' ? '' : `# ${line}`;
      });
      content = `# Python program exported from StudySpace\n# Resource: ${item.title}\n\n` + pyLines.filter(l => l !== '').join('\n');
      filename += '.py';
    } else if (format === 'js') {
      // Parser: comment out prose with //, keep js executable
      const lines = notesText.split('\n');
      let inCodeBlock = false;
      const jsLines = lines.map(line => {
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return '';
        }
        if (inCodeBlock) return line;
        return line.trim() === '' ? '' : `// ${line}`;
      });
      content = `// JavaScript program exported from StudySpace\n// Resource: ${item.title}\n\n` + jsLines.filter(l => l !== '').join('\n');
      filename += '.js';
      mimeType = 'application/javascript;charset=utf-8;';
    } else if (format === 'html') {
      content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${item.title} - Notes</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }
    h1 { color: #6366f1; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .notes-box { background: #1e293b; padding: 1.5rem; border-radius: 8px; line-height: 1.6; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${item.title}</h1>
  <p><strong>Database Source:</strong> ${item.provider}</p>
  <div class="notes-box">${notesText || 'No study notes recorded.'}</div>
</body>
</html>
      `;
      filename += '.html';
      mimeType = 'text/html;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Export all saved items as a CSV Table (Excel Compatible)
  const exportToCSV = () => {
    if (savedItems.length === 0) {
      alert("Your study binder is empty!");
      return;
    }

    const headers = ["Title", "Provider", "Subject", "Subtopic", "Resource Type", "Difficulty", "Grade Level", "Folder", "Status", "Notes", "Saved At"];
    
    const rows = savedItems.map(item => [
      item.title,
      item.provider,
      item.subject,
      item.subtopic,
      item.resourceType,
      item.difficulty,
      item.gradeLevel,
      item.folder || "General",
      item.status,
      (item.notes || "").replace(/"/g, '""').replace(/\n/g, ' '),
      item.savedAt || ""
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `StudySpace_Binder_Table_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    link.click();
  };

  // Export all folder content notes as a single unified review sheet
  const exportFolderNotes = () => {
    if (currentFolderItems.length === 0) {
      alert("This folder is empty. Save some search resources here first!");
      return;
    }

    let compiledNotes = `
# STUDY BINDER REPORT: ${activeFolder.toUpperCase()}
Generated on: ${new Date().toLocaleDateString()}
Completion Progress: ${folderProgress}%
Total Vetted Resources: ${currentFolderItems.length}

========================================================================
`;

    currentFolderItems.forEach((item, index) => {
      compiledNotes += `
## ${index + 1}. [${item.resourceType.toUpperCase()}] ${item.title}
- **Provider:** ${item.provider}
- **Web Reference:** ${item.url}
- **Status:** ${item.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}

### My Notes & Summaries:
${item.notes || '*(No notes entered)*'}

------------------------------------------------------------------------
`;
    });

    const blob = new Blob([compiledNotes], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `StudySpace_${activeFolder.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_binder.md`;
    link.click();
  };

  return (
    <div className="collections-view animate-fade-in">
      <div className="view-header flex-between">
        <div>
          <h2>My Study Binder</h2>
          <p>Organize saved resources into folders, monitor checklist goals, and export study summaries.</p>
        </div>
        <div className="export-toolbox">
          {savedItems.length > 0 && (
            <div className="toolbox-buttons">
              <button className="btn btn-secondary tool-btn" onClick={exportToCSV} title="Export entire binder as a CSV spreadsheet table">
                <FileText size={16} />
                <span>Export CSV Table</span>
              </button>
              {currentFolderItems.length > 0 && (
                <button className="btn btn-primary tool-btn" onClick={exportFolderNotes} title="Export current folder notes as Markdown">
                  <Download size={16} />
                  <span>Export Folder Guide (.md)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="binder-layout">
        
        {/* SIDEBAR: Folder directories list */}
        <aside className="binder-folders-panel glass-panel">
          <div className="folders-header flex-between">
            <h3>Folder Binder</h3>
            <button 
              className="add-folder-btn"
              onClick={() => setShowNewFolderInput(!showNewFolderInput)}
            >
              <FolderPlus size={18} />
            </button>
          </div>

          {showNewFolderInput && (
            <form onSubmit={handleCreateFolder} className="new-folder-form">
              <input
                type="text"
                className="input-field new-folder-input"
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="new-folder-actions flex-between">
                <button type="button" className="btn btn-secondary text-btn" onClick={() => setShowNewFolderInput(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-btn">Create</button>
              </div>
            </form>
          )}

          <div className="folders-list">
            {folders.map((folder) => {
              const isSelected = activeFolder === folder;
              const itemCount = savedItems.filter(item => (item.folder || 'General') === folder).length;
              return (
                <div 
                  key={folder}
                  className={`folder-row ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveFolder(folder)}
                >
                  <div className="folder-name-wrapper">
                    {isSelected ? <FolderOpen size={18} className="folder-icon" /> : <Folder size={18} className="folder-icon" />}
                    <span>{folder}</span>
                  </div>
                  <div className="folder-meta">
                    <span className="folder-badge">{itemCount}</span>
                    {folder !== 'General' && (
                      <button 
                        className="delete-folder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN BINDER WORKSPACE */}
        <main className="binder-workspace">
          {/* Progress Banner */}
          <div className="folder-details-banner glass-card flex-between">
            <div>
              <h3>Folder: {activeFolder}</h3>
              <p>{currentFolderItems.length} resources mapping targets</p>
            </div>
            {currentFolderItems.length > 0 && (
              <div className="progress-bar-container">
                <div className="progress-bar-labels flex-between">
                  <span>Folder Completion:</span>
                  <span>{folderProgress}%</span>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${folderProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Saved card list */}
          <div className="binder-grid">
            {currentFolderItems.length > 0 ? (
              currentFolderItems.map((item) => (
                <div key={item.id} className="binder-card glass-card">
                  <div className="binder-card-header flex-between">
                    <div className="card-badges">
                      <span className={`badge badge-${item.resourceType}`}>{item.resourceType}</span>
                      <span className="badge-subject" style={{ color: item.subject === 'Mathematics' ? '#6366f1' : item.subject === 'Physics' ? '#3b82f6' : item.subject === 'Chemistry' ? '#f59e0b' : item.subject === 'Biology' ? '#10b981' : '#ec4899' }}>
                        {item.subject}
                      </span>
                    </div>
                    <select
                      className="input-field card-status-select"
                      value={item.status || 'in-progress'}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                    >
                      <option value="in-progress">In Progress ⏳</option>
                      <option value="completed">Completed ✅</option>
                    </select>
                  </div>

                  <h3 className="binder-card-title">{item.title}</h3>
                  <span className="binder-card-provider">from {item.provider}</span>

                  {item.notes ? (
                    <div className="binder-notes-snippet">
                      <p><strong>My Notes:</strong> {item.notes.substring(0, 140)}...</p>
                    </div>
                  ) : (
                    <div className="binder-notes-snippet empty">
                      <p>No study notes saved yet. Click below to begin writing!</p>
                    </div>
                  )}

                  <div className="binder-card-footer flex-between">
                    {/* Folder Reassignment drop menu */}
                    <div className="folder-reassign">
                      <span className="reassign-label">Move to:</span>
                      <select
                        className="input-field folder-select"
                        value={item.folder || 'General'}
                        onChange={(e) => onMoveItemFolder(item.id, e.target.value)}
                      >
                        {folders.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="binder-card-actions flex-center" style={{ gap: '0.4rem' }}>
                      {/* Format Export Selector dropdown */}
                      <select
                        className="input-field card-download-select"
                        defaultValue=""
                        onChange={(e) => {
                          const format = e.target.value;
                          if (format) {
                            downloadNotesAs(item, format);
                            e.target.value = ""; // Reset dropdown
                          }
                        }}
                      >
                        <option value="" disabled>Download Note...</option>
                        <option value="txt">Text (.txt)</option>
                        <option value="md">Markdown (.md)</option>
                        <option value="pdf">PDF (.pdf)</option>
                        <option value="py">Python (.py)</option>
                        <option value="js">JavaScript (.js)</option>
                        <option value="html">Webpage (.html)</option>
                      </select>

                      <button 
                        className="btn btn-secondary icon-btn delete-btn" 
                        onClick={() => onRemoveItem(item.id)}
                        title="Delete Reference"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        className="btn btn-primary icon-btn study-btn" 
                        onClick={() => onStudyItem(item)}
                        title="Study & Notes"
                      >
                        <BookOpen size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-binder-card glass-card flex-center">
                <FolderOpen size={48} className="empty-icon" />
                <h3>This folder is empty</h3>
                <p>
                  To fill this binder, go to the **Search Hub**, find learning tools and videos, and click **"Save to Binder"**. 
                  You can then return here to categorize them and write summaries.
                </p>
                <button className="btn btn-primary navigate-btn" onClick={() => onStudyItem(null)}>
                  <span>Search for Content</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <style>{`
        .collections-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .view-header h2 {
          font-size: 1.8rem;
          margin-bottom: 0.25rem;
        }

        .export-toolbox {
          display: flex;
          align-items: center;
        }

        .toolbox-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .tool-btn {
          font-size: 0.8rem;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
        }

        /* Binder split layout */
        .binder-layout {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        @media (max-width: 900px) {
          .binder-layout {
            flex-direction: column;
          }
          .binder-folders-panel {
            width: 100% !important;
          }
        }

        /* Folders Sidebar Panel */
        .binder-folders-panel {
          width: 240px;
          flex-shrink: 0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .folders-header h3 {
          font-size: 1.1rem;
        }

        .add-folder-btn {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          transition: all 0.2s ease;
        }

        .add-folder-btn:hover {
          background: var(--accent-glow);
          transform: scale(1.05);
        }

        .new-folder-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
        }

        .new-folder-input {
          padding: 0.4rem 0.6rem;
          font-size: 0.85rem;
        }

        .new-folder-actions {
          gap: 0.5rem;
        }

        .text-btn {
          padding: 0.3rem 0.6rem;
          font-size: 0.75rem;
          border-radius: 6px;
        }

        .folders-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .folder-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .folder-row:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .folder-row.active {
          background: var(--accent-glow);
          color: var(--accent-primary);
        }

        .folder-name-wrapper {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .folder-icon {
          color: var(--accent-primary);
        }

        .folder-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .folder-badge {
          font-size: 0.75rem;
          font-weight: 700;
          background: var(--bg-tertiary);
          padding: 0.1rem 0.4rem;
          border-radius: 9999px;
          border: 1px solid var(--border-color);
        }

        .folder-row.active .folder-badge {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .delete-folder-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.15rem;
          border-radius: 4px;
          display: flex;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .folder-row:hover .delete-folder-btn {
          opacity: 1;
        }

        .delete-folder-btn:hover {
          color: var(--color-article);
          background: rgba(244, 63, 94, 0.1);
        }

        /* Main Workspace details */
        .binder-workspace {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        .folder-details-banner {
          padding: 1.5rem 2rem;
        }

        .folder-details-banner h3 {
          font-size: 1.25rem;
          margin-bottom: 0.15rem;
        }

        .folder-details-banner p {
          font-size: 0.85rem;
        }

        /* Folder progress bar tracker */
        .progress-bar-container {
          width: 200px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        @media (max-width: 640px) {
          .folder-details-banner {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          .progress-bar-container {
            width: 100%;
          }
        }

        .progress-bar-labels {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 9999px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(to right, var(--accent-primary), var(--accent-tertiary));
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        /* Saved Cards Grid */
        .binder-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .binder-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .binder-card-header {
          display: flex;
          align-items: center;
        }

        .card-status-select {
          width: 140px;
          padding: 0.3rem 0.6rem;
          font-size: 0.8rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .binder-card-title {
          font-size: 1.15rem;
          line-height: 1.3;
        }

        .binder-card-provider {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: -0.25rem;
        }

        .binder-notes-snippet {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1rem;
          font-size: 0.82rem;
          line-height: 1.5;
        }

        .binder-notes-snippet.empty {
          border-style: dashed;
          color: var(--text-muted);
        }

        .binder-notes-snippet p {
          color: var(--text-secondary);
        }

        .binder-card-footer {
          margin-top: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .folder-reassign {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .reassign-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .folder-select {
          padding: 0.25rem 0.5rem;
          font-size: 0.78rem;
          border-radius: 6px;
          width: 110px;
        }

        .card-download-select {
          width: 115px;
          padding: 0.35rem 0.5rem;
          font-size: 0.8rem;
          border-radius: 8px;
          cursor: pointer;
          background-position: right 0.35rem center;
        }

        .binder-card-actions {
          display: flex;
          gap: 0.4rem;
        }

        .icon-btn {
          padding: 0.45rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delete-btn:hover {
          background: rgba(244, 63, 94, 0.1);
          color: var(--color-article);
          border-color: rgba(244, 63, 94, 0.2);
        }

        .study-btn {
          background: var(--accent-primary);
          color: white;
        }

        /* Empty state styling */
        .empty-binder-card {
          padding: 4rem 2rem;
          flex-direction: column;
          gap: 1.25rem;
          text-align: center;
          border-style: dashed;
        }

        .empty-binder-card h3 {
          font-size: 1.25rem;
        }

        .empty-binder-card p {
          max-width: 440px;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        .navigate-btn {
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
}
