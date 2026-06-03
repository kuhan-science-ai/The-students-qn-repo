import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Edit3, 
  Bold, 
  Italic, 
  Heading1, 
  List, 
  Code,
  ExternalLink,
  BookOpen,
  CheckCircle,
  FileText,
  AlertCircle,
  Loader2,
  BookOpenCheck,
  Binary
} from 'lucide-react';

export default function Workbench({ resource, onClose, onSaveNotes, savedItems }) {
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('in-progress');
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('All changes saved');
  const textareaRef = useRef(null);

  // Wikipedia REST Reader States
  const [wikiHtml, setWikiHtml] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState(false);

  // Research Paper view tabs: 'pdf' or 'digest'
  const [paperTab, setPaperTab] = useState('pdf');

  // Textbook Reader States
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState({}); // { [qId]: boolean }
  const [selectedOptions, setSelectedOptions] = useState({}); // { [qId]: optionIndex }
  const [textbookFontSize, setTextbookFontSize] = useState(16); // in px
  const [dyslexicMode, setDyslexicMode] = useState(false);

  // Load existing notes, status and Wikipedia content ONLY when resource ID changes
  useEffect(() => {
    if (resource) {
      const match = savedItems.find(item => item.id === resource.id);
      if (match) {
        setNotes(match.notes || '');
        setStatus(match.status || 'in-progress');
      } else {
        setNotes('');
        setStatus('in-progress');
      }
      setSaveStatus('All changes saved');

      // Fetch the ENTIRE Wikipedia page via Rest HTML API
      if (resource.provider === 'Wikipedia') {
        fetchWikipediaFullPage(resource.title);
      } else {
        setWikiHtml('');
        setWikiError(false);
      }

      setPaperTab('pdf');

      // Reset textbook reader states
      setActiveSectionIdx(0);
      setRevealedAnswers({});
      setSelectedOptions({});
    }
  }, [resource.id]); // ONLY trigger when opening a different resource!

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setSaveStatus('Saving changes...');
  };

  // Auto-save notes changes
  useEffect(() => {
    if (!resource) return;
    
    const delayDebounce = setTimeout(() => {
      onSaveNotes(resource.id, notes, status);
      setSaveStatus('All changes saved');
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [notes, status, resource.id]);

  const handleManualSave = () => {
    onSaveNotes(resource.id, notes, status);
    setSaveStatus('All changes saved');
  };

  // Multi-Format Note Downloader
  const downloadNotesAs = (res, notesText, format) => {
    let content = '';
    let filename = `${res.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    let mimeType = 'text/plain;charset=utf-8;';

    if (format === 'txt') {
      content = `STUDYSPACE NOTE EXPORT\nSubject: ${res.subject}\nResource: ${res.title}\nNotes:\n\n${notesText || 'No notes saved.'}`;
      filename += '.txt';
    } else if (format === 'md') {
      content = `# ${res.title}\n- **Subject:** ${res.subject}\n- **Provider:** ${res.provider}\n\n${notesText || '*(No notes)*'}`;
      filename += '.md';
      mimeType = 'text/markdown;charset=utf-8;';
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${res.title} - Study Sheet PDF</title>
            <style>
              body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.65; }
              h1 { color: #4f46e5; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-top: 0; font-size: 24px; }
              .meta { font-size: 13px; color: #64748b; margin-bottom: 25px; font-weight: 700; text-transform: uppercase; }
              .notes-content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
              code { font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-size: 13px; }
            </style>
          </head>
          <body>
            <h1>${res.title}</h1>
            <div class="meta">Subject: ${res.subject} • Provider: ${res.provider}</div>
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
      const lines = (notesText || '').split('\n');
      let inCodeBlock = false;
      const pyLines = lines.map(line => {
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return '';
        }
        if (inCodeBlock) return line;
        return line.trim() === '' ? '' : `# ${line}`;
      });
      content = `# Python program exported from StudySpace\n# Resource: ${res.title}\n\n` + pyLines.filter(l => l !== '').join('\n');
      filename += '.py';
    } else if (format === 'js') {
      const lines = (notesText || '').split('\n');
      let inCodeBlock = false;
      const jsLines = lines.map(line => {
        if (line.trim().startsWith('```')) {
          inCodeBlock = !inCodeBlock;
          return '';
        }
        if (inCodeBlock) return line;
        return line.trim() === '' ? '' : `// ${line}`;
      });
      content = `// JavaScript program exported from StudySpace\n// Resource: ${res.title}\n\n` + jsLines.filter(l => l !== '').join('\n');
      filename += '.js';
      mimeType = 'application/javascript;charset=utf-8;';
    } else if (format === 'html') {
      content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${res.title} - Notes</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc; }
    h1 { color: #6366f1; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .notes-box { background: #1e293b; padding: 1.5rem; border-radius: 8px; line-height: 1.6; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${res.title}</h1>
  <div class="notes-box">${notesText || 'No notes written.'}</div>
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

  // Wikipedia Full HTML API Fetcher
  const fetchWikipediaFullPage = async (title) => {
    setWikiLoading(true);
    setWikiError(false);
    setWikiHtml('');
    try {
      const formattedTitle = title.trim().replace(/\s+/g, '_');
      const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(formattedTitle)}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error("Wikipedia full HTML request failed");
      let htmlText = await response.text();

      // Rewrite resource anchors to prevent leaving the page
      htmlText = htmlText.replace(/href="\.\//g, 'href="https://en.wikipedia.org/wiki/');
      
      setWikiHtml(htmlText);
    } catch (err) {
      console.error("Failed to fetch full Wikipedia HTML page:", err);
      setWikiError(true);
    } finally {
      setWikiLoading(false);
    }
  };

  const handleInsertMarkdown = (syntax) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let replacement = '';
    if (syntax === 'bold') replacement = `**${selected || 'bold text'}**`;
    else if (syntax === 'italic') replacement = `*${selected || 'italic text'}*`;
    else if (syntax === 'heading') replacement = `\n### ${selected || 'Heading'}\n`;
    else if (syntax === 'list') replacement = `\n- ${selected || 'list item'}\n`;
    else if (syntax === 'code') replacement = `\`${selected || 'code snippet'}\``;

    const newText = before + replacement + after;
    setNotes(newText);
    setSaveStatus('Saving changes...');

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Client-side Markdown parser
  const parseMarkdown = (md) => {
    if (!md) return '<p style="color: var(--text-muted);">Start typing your notes here...</p>';
    
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\frac{\*\*(.*?)\*\*}{\*\*}/g, '<strong>$1</strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/\n/g, '<br />');

    return html;
  };

  if (!resource) return null;

  // Determine embed type
  const isYoutube = resource.url.includes('youtube.com') || resource.url.includes('youtu.be');
  const isPhet = resource.url.includes('phet.colorado.edu');
  const isPdf = resource.url.toLowerCase().endsWith('.pdf') || resource.provider === 'arXiv';
  const isWiki = resource.provider === 'Wikipedia';

  // Extract clean video embed URL
  let embedUrl = resource.url;
  if (isYoutube) {
    if (resource.embedId) {
      if (resource.embedId.length > 12) {
        embedUrl = `https://www.youtube.com/embed/videoseries?list=${resource.embedId}`;
      } else {
        embedUrl = `https://www.youtube.com/embed/${resource.embedId}`;
      }
    } else {
      try {
        const urlObj = new URL(resource.url);
        const videoId = urlObj.searchParams.get('v');
        const playlistId = urlObj.searchParams.get('list');
        if (playlistId) {
          embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
        } else if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      } catch (e) {
        console.error("Failed to parse YouTube url:", e);
      }
    }
  }

  // Adjust arXiv PDF url
  let pdfUrl = resource.url;
  if (resource.provider === 'arXiv' && pdfUrl && !pdfUrl.endsWith('.pdf')) {
    if (pdfUrl.includes('/abs/')) {
      pdfUrl = pdfUrl.replace('/abs/', '/pdf/') + '.pdf';
    } else if (!pdfUrl.endsWith('.pdf')) {
      pdfUrl = pdfUrl + '.pdf';
    }
  }

  // ==========================================
  // MEMOIZED LEFT PANEL: Completely decoupled 
  // from typing notes to ensure 100% stability!
  // ==========================================
  const leftPanelDOM = useMemo(() => {
    return (
      <div className="viewer-panel">
        
        {/* SCENARIO 1: YouTube Videos */}
        {isYoutube && (
          <iframe
            title={resource.title}
            src={embedUrl}
            className="viewer-iframe"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}

        {/* SCENARIO 2: PhET Simulations */}
        {isPhet && (
          <iframe
            title={resource.title}
            src={resource.url}
            className="viewer-iframe phet-frame"
            allowFullScreen
          />
        )}

        {/* SCENARIO 3: Full-Page Wikipedia REST HTML Reader */}
        {isWiki && (
          <div className="wiki-reader-pane full-page-wiki">
            {wikiLoading ? (
              <div className="wiki-status flex-center">
                <Loader2 className="animate-spin" size={32} />
                <p>Aggregating ENTIRE Wikipedia article page (sections, tables, infoboxes)...</p>
              </div>
            ) : wikiError ? (
              <div className="wiki-status flex-center error">
                <AlertCircle size={32} />
                <p>Failed to query live Wikipedia Rest HTML database.</p>
                <div className="brief-card glass-panel">
                  <h4>Abstract Summary Fallback</h4>
                  <p>{resource.description}</p>
                </div>
              </div>
            ) : wikiHtml ? (
              <div className="wiki-html-document-wrapper">
                {/* Render raw Wikipedia REST HTML directly in our scroll pane */}
                <div 
                  className="wiki-html-render-body"
                  dangerouslySetInnerHTML={{ __html: wikiHtml }}
                />
                
                <footer className="wiki-textbook-footer">
                  <BookOpenCheck size={16} />
                  <span>End of Wikipedia page entry. Mapped for study binder records.</span>
                </footer>
              </div>
            ) : (
              <div className="wiki-status flex-center">
                <p>Accessing Wikipedia database...</p>
              </div>
            )}
          </div>
        )}

        {/* SCENARIO 4: Academic PDF Embedder (arXiv & EuropePMC) */}
        {isPdf && (
          <div className="pdf-viewer-layout">
            {/* PDF Viewer Tabs */}
            <div className="pdf-control-tabs flex-between">
              <div className="tab-buttons">
                <button 
                  className={`pdf-tab ${paperTab === 'pdf' ? 'active' : ''}`}
                  onClick={() => setPaperTab('pdf')}
                >
                  <Binary size={14} />
                  <span>Embedded PDF Reader</span>
                </button>
                <button 
                  className={`pdf-tab ${paperTab === 'digest' ? 'active' : ''}`}
                  onClick={() => setPaperTab('digest')}
                >
                  <FileText size={14} />
                  <span>Abstract Text Digest</span>
                </button>
              </div>
            </div>

            <div className="pdf-viewer-body">
              {paperTab === 'pdf' ? (
                <embed
                  src={pdfUrl}
                  type="application/pdf"
                  className="viewer-iframe pdf-embed"
                  title={resource.title}
                />
              ) : (
                <div className="paper-digest-pane">
                  <article className="wiki-textbook-layout">
                    <h1 className="wiki-book-title">{resource.title}</h1>
                    <span className="wiki-subheading">Database: {resource.provider} • Research Paper</span>
                    
                    <div className="digest-section">
                      <h3>Academic Abstract</h3>
                      <p className="digest-abstract-text">{resource.description}</p>
                    </div>

                    <div className="digest-section outline-section">
                      <h3>Study Targets</h3>
                      <ul>
                        <li>Analyze the experimental methods detailed in the abstract.</li>
                        <li>Summarize the primary thesis and findings inside your binder notepad.</li>
                        <li>Translate mathematical formulations into simplified logic sheets.</li>
                      </ul>
                    </div>
                  </article>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCENARIO 5: Reader Mode Fallback for Curated Articles */}
        {!isYoutube && !isPhet && !isWiki && !isPdf && (
          <div className="textbook-reader-mode-pane">
            {resource.textbookContent ? (
              <div 
                className={`textbook-rich-layout ${dyslexicMode ? 'dyslexic-font' : ''}`}
                style={{ fontSize: `${textbookFontSize}px` }}
              >
                {/* Control bar */}
                <div className="textbook-top-controls flex-between glass-panel">
                  <div className="chapter-meta">
                    <span className="chapter-badge">{resource.textbookContent.chapterNumber}</span>
                    <span className="chapter-subtitle">{resource.textbookContent.subtitle}</span>
                  </div>
                  <div className="textbook-settings flex-center" style={{ gap: '0.75rem' }}>
                    <button 
                      className={`btn btn-secondary font-control-btn ${dyslexicMode ? 'active' : ''}`}
                      onClick={() => setDyslexicMode(!dyslexicMode)}
                      title="Toggle high-readability Dyslexic-friendly font"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      Dyslexic Font
                    </button>
                    <div className="font-resizers flex-center" style={{ gap: '0.25rem' }}>
                      <button 
                        className="btn btn-secondary font-btn" 
                        onClick={() => setTextbookFontSize(prev => Math.max(12, prev - 2))}
                        title="Decrease Font Size"
                        style={{ padding: '0.25rem 0.5rem', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        A-
                      </button>
                      <button 
                        className="btn btn-secondary font-btn" 
                        onClick={() => setTextbookFontSize(prev => Math.min(24, prev + 2))}
                        title="Increase Font Size"
                        style={{ padding: '0.25rem 0.5rem', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>

                <div className="textbook-split-container">
                  {/* Sidebar sections list */}
                  <aside className="textbook-sections-sidebar">
                    <h4>Chapter Index</h4>
                    <div className="sections-list">
                      {resource.textbookContent.sections.map((sec, idx) => (
                        <button
                          key={sec.id}
                          className={`section-tab-btn ${activeSectionIdx === idx ? 'active' : ''}`}
                          onClick={() => setActiveSectionIdx(idx)}
                        >
                          <BookOpen size={14} />
                          <span>{sec.title}</span>
                        </button>
                      ))}
                      {/* Equations Tab */}
                      {resource.textbookContent.equations && (
                        <button
                          className={`section-tab-btn ${activeSectionIdx === 'eq' ? 'active' : ''}`}
                          onClick={() => setActiveSectionIdx('eq')}
                        >
                          <Binary size={14} />
                          <span>Math Formulations</span>
                        </button>
                      )}
                      {/* Practice Questions Tab */}
                      {resource.textbookContent.practiceQuestions && (
                        <button
                          className={`section-tab-btn ${activeSectionIdx === 'practice' ? 'active' : ''}`}
                          onClick={() => setActiveSectionIdx('practice')}
                        >
                          <CheckCircle size={14} />
                          <span>Concept Review</span>
                        </button>
                      )}
                    </div>
                  </aside>

                  {/* Section Content Display */}
                  <main className="textbook-section-content">
                    {/* Render standard section */}
                    {typeof activeSectionIdx === 'number' && (
                      <div className="textbook-active-section animate-fade-in">
                        <h2>{resource.textbookContent.sections[activeSectionIdx].title}</h2>
                        
                        <div className="textbook-para-content">
                          <p>{resource.textbookContent.sections[activeSectionIdx].content}</p>
                        </div>

                        {resource.textbookContent.sections[activeSectionIdx].bullets && (
                          <div className="textbook-bullets-box">
                            <ul>
                              {resource.textbookContent.sections[activeSectionIdx].bullets.map((bullet, bIdx) => (
                                <li key={bIdx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="textbook-navigation-hint">
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2rem' }}>
                            Tip: Review key concepts and note them in the Notepad on the right. Navigate pages using the Chapter Index list.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Render Equations tab */}
                    {activeSectionIdx === 'eq' && (
                      <div className="textbook-equations-section animate-fade-in">
                        <h2>Key Chapter Formula Maps</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                          Theoretical and analytical mathematics relevant for Grade 11/12 examinations and research.
                        </p>
                        
                        <div className="equations-grid">
                          {resource.textbookContent.equations.map((eq, eqIdx) => (
                            <div key={eqIdx} className="equation-card glass-panel">
                              <div className="eq-formula-display">
                                <code>{eq.expr}</code>
                              </div>
                              <div className="eq-formula-description">
                                <span className="eq-label">Definition:</span> {eq.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render Practice tab */}
                    {activeSectionIdx === 'practice' && (
                      <div className="textbook-practice-section animate-fade-in">
                        <h2>Chapter Concept Review</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                          Test your understanding of the principles covered in this textbook module. Select an option and reveal explanations.
                        </p>

                        <div className="practice-questions-list">
                          {resource.textbookContent.practiceQuestions.map((q, qIdx) => {
                            const isRevealed = revealedAnswers[q.id];
                            const selectedIdx = selectedOptions[q.id];
                            
                            return (
                              <div key={q.id} className="practice-question-card glass-panel">
                                <h4 className="practice-q-text">
                                  <span>Q{qIdx + 1}:</span> {q.question}
                                </h4>

                                <div className="practice-options-grid">
                                  {q.options.map((opt, optIdx) => {
                                    let btnClass = "";
                                    if (selectedIdx === optIdx) {
                                      btnClass = "selected";
                                    }
                                    if (isRevealed) {
                                      if (optIdx === q.correctIndex) {
                                        btnClass = "correct";
                                      } else if (selectedIdx === optIdx) {
                                        btnClass = "incorrect";
                                      }
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        className={`option-btn ${btnClass}`}
                                        onClick={() => {
                                          if (isRevealed) return; // locked once revealed
                                          setSelectedOptions(prev => ({ ...prev, [q.id]: optIdx }));
                                        }}
                                        disabled={isRevealed}
                                      >
                                        <span className="option-letter">{String.fromCharCode(65 + optIdx)}.</span>
                                        <span>{opt}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="practice-actions flex-between" style={{ marginTop: '1rem' }}>
                                  <button
                                    className="btn btn-secondary"
                                    onClick={() => setRevealedAnswers(prev => ({ ...prev, [q.id]: !isRevealed }))}
                                    disabled={selectedIdx === undefined}
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                  >
                                    {isRevealed ? "Hide Explanation" : "Check & Reveal Answer"}
                                  </button>
                                  {isRevealed && (
                                    <span className={`answer-status-pill ${selectedIdx === q.correctIndex ? 'status-correct' : 'status-incorrect'}`}>
                                      {selectedIdx === q.correctIndex ? "Correct Answer" : "Incorrect Answer"}
                                    </span>
                                  )}
                                </div>

                                {isRevealed && (
                                  <div className="practice-explanation-box animate-fade-in">
                                    <strong>Conceptual Rationale:</strong>
                                    <p>{q.explanation}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </main>
                </div>
              </div>
            ) : (
              <article className="wiki-textbook-layout">
                <h1 className="wiki-book-title">{resource.title}</h1>
                <span className="wiki-subheading">Course: {resource.provider} • Mapped Concept Chapter</span>
                
                <div className="digest-section">
                  <h3>Chapter Core Summary</h3>
                  <p className="digest-abstract-text">{resource.description}</p>
                </div>

                <div className="digest-section outline-section">
                  <h3>Curriculum Overview & Concepts</h3>
                  <p>This chapter reviews foundational blocks of **{resource.subject} ({resource.subtopic})** structured for Grade 11 and 12 mastery. Review key concepts, note variables, and document practice problems in your notebook pane on the right.</p>
                </div>
              </article>
            )}
          </div>
        )}

      </div>
    );
  }, [
    resource.id, 
    wikiHtml, 
    wikiLoading, 
    wikiError, 
    paperTab, 
    pdfUrl, 
    embedUrl, 
    isYoutube, 
    isPhet, 
    isWiki, 
    isPdf,
    resource.title,
    resource.provider,
    resource.description,
    resource.subject,
    resource.subtopic,
    resource.resourceType,
    resource.difficulty,
    resource.url,
    activeSectionIdx,
    revealedAnswers,
    selectedOptions,
    textbookFontSize,
    dyslexicMode
  ]);

  return (
    <div className="workbench-overlay">
      <div className="workbench-container glass-panel animate-fade-in">
        
        {/* Top bar header */}
        <header className="workbench-header flex-between">
          <div className="workbench-meta">
            <span className={`badge badge-${resource.resourceType}`}>{resource.resourceType}</span>
            <h2 className="workbench-title">{resource.title}</h2>
          </div>
          <button className="workbench-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {/* Workspace body split */}
        <div className="workbench-body">
          
          {/* Memoized Left Panel */}
          {leftPanelDOM}

          {/* RIGHT PANEL: Notepad */}
          <div className="notepad-panel">
            <div className="notepad-header flex-between">
              <div className="notepad-tab-group">
                <button 
                  className={`notepad-tab-btn ${!previewMode ? 'active' : ''}`}
                  onClick={() => setPreviewMode(false)}
                >
                  <Edit3 size={16} />
                  <span>Editor</span>
                </button>
                <button 
                  className={`notepad-tab-btn ${previewMode ? 'active' : ''}`}
                  onClick={() => setPreviewMode(true)}
                >
                  <Eye size={16} />
                  <span>Preview</span>
                </button>
              </div>
              <span className="save-status-indicator">{saveStatus}</span>
            </div>

            {/* Note text editor */}
            {!previewMode ? (
              <div className="editor-container">
                {/* Formatting Toolbar */}
                <div className="toolbar">
                  <button onClick={() => handleInsertMarkdown('heading')} title="Add Heading"><Heading1 size={14} /></button>
                  <button onClick={() => handleInsertMarkdown('bold')} title="Bold Text"><Bold size={14} /></button>
                  <button onClick={() => handleInsertMarkdown('italic')} title="Italic Text"><Italic size={14} /></button>
                  <button onClick={() => handleInsertMarkdown('list')} title="Add Bullet List"><List size={14} /></button>
                  <button onClick={() => handleInsertMarkdown('code')} title="Add Code Block"><Code size={14} /></button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Summarize this resource, paste code blocks, or draft your study roadmap... Notes support basic markdown formats!"
                  className="notepad-textarea"
                />
              </div>
            ) : (
              <div 
                className="preview-container"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(notes) }}
              />
            )}

            {/* Notepad Actions Footer */}
            <div className="notepad-footer flex-between">
              <div className="status-selector">
                <span className="status-label">Study Status:</span>
                <select 
                  className="input-field status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="in-progress">In Progress ⏳</option>
                  <option value="completed">Completed ✅</option>
                </select>
              </div>

              <div className="workbench-notepad-actions flex-center" style={{ gap: '0.5rem' }}>
                {/* Format Export Selector dropdown */}
                <select
                  className="input-field workbench-download-select"
                  defaultValue=""
                  onChange={(e) => {
                    const format = e.target.value;
                    if (format) {
                      downloadNotesAs(resource, notes, format);
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

                <button className="btn btn-primary manual-save-btn" onClick={handleManualSave}>
                  <Save size={16} />
                  <span>Save Binder Entry</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      <style>{`
        .workbench-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 0.3s ease;
        }

        .workbench-container {
          width: 100%;
          height: 100%;
          max-width: 1300px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-primary);
          border-radius: 20px;
        }

        .workbench-header {
          padding: 1.25rem 2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .workbench-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 80%;
        }

        .workbench-title {
          font-size: 1.25rem;
          font-family: var(--font-display);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .workbench-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          transition: all 0.2s ease;
        }

        .workbench-close-btn:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        /* Split body */
        .workbench-body {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          flex: 1;
          overflow: hidden;
        }

        @media (max-width: 900px) {
          .workbench-body {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1.2fr;
          }
        }

        /* Left Panel - Viewer */
        .viewer-panel {
          border-right: 1px solid var(--border-color);
          background: var(--bg-secondary);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          overflow: hidden;
        }

        .viewer-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: #000;
        }
        
        .phet-frame {
          background: #ffffff;
        }

        /* Wikipedia REST textbook styles (Complete Page rendering) */
        .wiki-reader-pane, .textbook-reader-mode-pane {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          background: var(--bg-secondary);
          padding: 2rem;
        }

        .wiki-status {
          flex-direction: column;
          gap: 1rem;
          height: 100%;
          color: var(--text-secondary);
          text-align: center;
        }

        .wiki-html-document-wrapper {
          width: 100%;
        }

        /* Override Wikipedia's default HTML layout styles to integrate into StudySpace theme */
        .wiki-html-render-body {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.65;
          color: var(--text-secondary);
        }

        .wiki-html-render-body h1, 
        .wiki-html-render-body h2, 
        .wiki-html-render-body h3, 
        .wiki-html-render-body h4 {
          font-family: var(--font-display);
          color: var(--text-primary);
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .wiki-html-render-body h1 {
          font-size: 1.8rem;
          border-bottom: 2px solid var(--accent-primary);
          padding-bottom: 0.25rem;
        }

        .wiki-html-render-body h2 {
          font-size: 1.4rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.15rem;
        }

        .wiki-html-render-body h3 {
          font-size: 1.15rem;
        }

        .wiki-html-render-body p {
          margin-bottom: 1.1rem;
        }

        .wiki-html-render-body a {
          color: var(--accent-primary);
          pointer-events: none; /* Disable links inside embedded wiki page to keep student inside the app */
        }

        /* Style Wikipedia's detailed tables & infoboxes */
        .wiki-html-render-body table.infobox {
          float: right;
          clear: right;
          width: 280px;
          margin: 0.5rem 0 1rem 1.5rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.8rem;
          line-height: 1.4;
          box-shadow: var(--card-shadow);
        }

        @media (max-width: 640px) {
          .wiki-html-render-body table.infobox {
            float: none;
            width: 100%;
            margin: 1rem 0;
          }
        }

        .wiki-html-render-body table.infobox caption {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .wiki-html-render-body table.infobox td, 
        .wiki-html-render-body table.infobox th {
          padding: 0.35rem 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .wiki-html-render-body table.infobox th {
          text-align: left;
          color: var(--text-primary);
          font-weight: 700;
        }

        /* Style normal wikitable tables */
        .wiki-html-render-body table.wikitable {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.85rem;
        }

        .wiki-html-render-body table.wikitable th, 
        .wiki-html-render-body table.wikitable td {
          border: 1px solid var(--border-color);
          padding: 0.5rem;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
        }

        .wiki-html-render-body table.wikitable th {
          background: var(--border-color);
          color: var(--text-primary);
          font-weight: 700;
        }

        /* Hide Wikipedia edit buttons, search icons, and citation notices */
        .wiki-html-render-body .mw-editsection,
        .wiki-html-render-body .navbox,
        .wiki-html-render-body .metadata,
        .wiki-html-render-body .noprint,
        .wiki-html-render-body .reference {
          display: none;
        }

        /* Make images responsive */
        .wiki-html-render-body img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.5rem 0;
        }

        .wiki-textbook-layout {
          max-width: 680px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .wiki-book-title {
          font-size: 2.2rem;
          font-family: var(--font-display);
          line-height: 1.1;
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent-primary);
          padding-bottom: 0.5rem;
        }

        .wiki-subheading {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: -0.75rem;
        }

        .wiki-textbook-footer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          margin-top: 2rem;
        }

        /* PDF Layout */
        .pdf-viewer-layout {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
        }

        .pdf-control-tabs {
          padding: 0.5rem 1rem;
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-color);
        }

        .pdf-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          cursor: pointer;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;
        }

        .pdf-tab.active {
          color: var(--accent-primary);
          background: var(--accent-glow);
        }

        .pdf-viewer-body {
          flex: 1;
          height: calc(100% - 38px);
        }

        .pdf-embed {
          border: none;
          background: var(--bg-primary);
        }

        .paper-digest-pane {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          padding: 2.5rem;
          background: var(--bg-secondary);
        }

        .digest-section h3 {
          font-size: 1.15rem;
          color: var(--accent-primary);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.4rem;
          margin-bottom: 0.75rem;
          margin-top: 1.5rem;
        }

        .digest-abstract-text {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          font-style: italic;
        }

        .outline-section ul {
          list-style-type: square;
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .outline-section li {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Right Panel - Notepad */
        .notepad-panel {
          background: var(--bg-secondary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .notepad-header {
          padding: 0.75rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .notepad-tab-group {
          display: flex;
          gap: 0.25rem;
        }

        .notepad-tab-btn {
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .notepad-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .notepad-tab-btn.active {
          color: var(--accent-primary);
          background: var(--accent-glow);
        }

        .save-status-indicator {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .editor-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
        }

        /* Toolbar styles */
        .toolbar {
          display: flex;
          gap: 0.25rem;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .toolbar button {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.35rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .toolbar button:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .notepad-textarea {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.6;
          padding: 1.5rem;
          resize: none;
          outline: none;
          overflow-y: auto;
        }

        /* Preview area */
        .preview-container {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          line-height: 1.6;
          font-size: 0.95rem;
          background: var(--bg-secondary);
        }

        .preview-container h1, .preview-container h2, .preview-container h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .preview-container h3 { font-size: 1.15rem; color: var(--accent-primary); }

        .preview-container strong {
          color: var(--accent-secondary);
        }

        .preview-container em {
          font-style: italic;
        }

        .preview-container li {
          margin-left: 1.25rem;
          margin-bottom: 0.35rem;
        }

        .preview-container code {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          font-family: monospace;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        /* Notepad footer actions */
        .notepad-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .status-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .status-select {
          padding: 0.4rem 0.8rem;
          font-size: 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          background-position: right 0.5rem center;
        }

        .manual-save-btn {
          font-size: 0.85rem;
          padding: 0.5rem 1.25rem;
        }

        .workbench-download-select {
          width: 130px;
          padding: 0.4rem 0.6rem;
          font-size: 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          background-position: right 0.4rem center;
        }

        /* --- TEXTBOOK READER STYLES --- */
        .textbook-reader-mode-pane {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: var(--bg-secondary);
          overflow: hidden;
        }

        .textbook-rich-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
          overflow: hidden;
        }

        .textbook-rich-layout.dyslexic-font {
          font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
        }

        .textbook-top-controls {
          padding: 0.75rem 1.25rem;
          margin: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-tertiary);
          box-shadow: var(--card-shadow);
        }

        .chapter-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chapter-badge {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chapter-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .textbook-settings button {
          font-family: inherit;
        }

        .textbook-split-container {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 1.5rem;
          flex: 1;
          overflow: hidden;
          padding: 0 1rem 1rem 1rem;
        }

        @media (max-width: 768px) {
          .textbook-split-container {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
          }
        }

        .textbook-sections-sidebar {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .textbook-sections-sidebar h4 {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .sections-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .section-tab-btn {
          width: 100%;
          text-align: left;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .section-tab-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-color);
        }

        .section-tab-btn.active {
          color: var(--accent-primary);
          background: var(--accent-glow);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .textbook-section-content {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1.5rem 2rem;
          overflow-y: auto;
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
        }

        .textbook-active-section h2,
        .textbook-equations-section h2,
        .textbook-practice-section h2 {
          font-family: var(--font-display);
          color: var(--text-primary);
          font-size: 1.4rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .textbook-para-content p {
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
        }

        .textbook-bullets-box {
          background: var(--bg-secondary);
          border-left: 4px solid var(--accent-primary);
          padding: 1rem 1.25rem;
          border-radius: 0 8px 8px 0;
          margin: 1rem 0;
        }

        .textbook-bullets-box ul {
          list-style-type: none;
          padding-left: 0;
          margin: 0;
        }

        .textbook-bullets-box li {
          position: relative;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .textbook-bullets-box li::before {
          content: "•";
          color: var(--accent-primary);
          font-size: 1.25rem;
          position: absolute;
          left: 0;
          top: -0.1rem;
        }

        .equations-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .equation-card {
          padding: 1.25rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .eq-formula-display {
          font-family: 'Courier New', Courier, monospace;
          background: rgba(0, 0, 0, 0.25);
          color: var(--accent-secondary);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
          font-size: 1.15rem;
          overflow-x: auto;
          margin-bottom: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .eq-formula-description {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .eq-label {
          font-weight: 700;
          color: var(--text-primary);
        }

        .practice-questions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .practice-question-card {
          padding: 1.25rem 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
        }

        .practice-q-text {
          font-size: 1.05rem;
          margin-bottom: 1rem;
          line-height: 1.4;
          display: flex;
          gap: 0.5rem;
        }

        .practice-q-text span {
          color: var(--accent-primary);
          font-weight: 800;
        }

        .practice-options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .option-btn {
          width: 100%;
          text-align: left;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: inherit;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .option-btn:hover:not(:disabled) {
          border-color: var(--accent-primary);
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .option-btn.selected {
          border-color: var(--accent-primary);
          background: var(--accent-glow);
          color: var(--text-primary);
          box-shadow: 0 0 0 2px var(--accent-primary);
        }

        .option-btn.correct {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-weight: 700;
        }

        .option-btn.incorrect {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          text-decoration: line-through;
        }

        .option-letter {
          font-weight: 800;
          color: var(--text-muted);
        }

        .option-btn.selected .option-letter {
          color: var(--accent-primary);
        }

        .practice-explanation-box {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-left: 4px solid var(--accent-primary);
          border-radius: 0 8px 8px 0;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .practice-explanation-box strong {
          color: var(--text-primary);
          display: block;
          margin-bottom: 0.25rem;
        }

        .answer-status-pill {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .answer-status-pill.status-correct {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .answer-status-pill.status-incorrect {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
