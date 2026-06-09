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

  // LaTeX & KaTeX states
  const [noteType, setNoteType] = useState('markdown'); // 'markdown' or 'latex'
  const [showLatexHelp, setShowLatexHelp] = useState(false);
  const [katexLoaded, setKatexLoaded] = useState(false);
  const previewRef = useRef(null);

  // Dynamically load KaTeX from CDN (now loaded globally in index.html, with a reactive fallback check)
  useEffect(() => {
    if (window.katex && window.renderMathInElement) {
      setKatexLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (window.katex && window.renderMathInElement) {
          setKatexLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Load existing notes, status and Wikipedia content ONLY when resource ID changes
  useEffect(() => {
    if (resource) {
      const match = savedItems.find(item => item.id === resource.id);
      if (match) {
        setNotes(match.notes || '');
        setStatus(match.status || 'in-progress');
        setNoteType(match.noteType || 'markdown');
      } else {
        setNotes('');
        setStatus('in-progress');
        setNoteType('markdown');
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
      setShowLatexHelp(false);
    }
  }, [resource.id]); // ONLY trigger when opening a different resource!

  // Toggle note format between Markdown & LaTeX
  const handleToggleNoteType = (type) => {
    setNoteType(type);
    if (type === 'latex' && (!notes || notes.trim() === '')) {
      const template = `\\documentclass{article}
\\title{Study Paper: ${resource.title}}
\\author{Student Researcher}
\\date{\\today}
\\begin{document}

\\maketitle

\\section{Introduction}
Start typing your LaTeX notes here. You can compile formulas such as $E = mc^2$ or double-dollar block equations:

\\begin{equation}
i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)
\\end{equation}

\\section{Core Concepts}
\\begin{itemize}
    \\item Core Observation A
    \\item Core Observation B
\\end{itemize}

\\end{document}`;
      setNotes(template);
    }
    setSaveStatus('Saving changes...');
  };

  // Insert LaTeX elements at cursor position
  const handleInsertLatex = (syntax) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selected = text.substring(start, end);

    let replacement = '';
    if (syntax === 'section') replacement = `\\section{${selected || 'Section Title'}}\n`;
    else if (syntax === 'subsection') replacement = `\\subsection{${selected || 'Subsection Title'}}\n`;
    else if (syntax === 'bold') replacement = `\\textbf{${selected || 'bold text'}}`;
    else if (syntax === 'italic') replacement = `\\textit{${selected || 'italic text'}}`;
    else if (syntax === 'frac') replacement = `\\frac{${selected || 'a'}}{b}`;
    else if (syntax === 'sqrt') replacement = `\\sqrt{${selected || 'x'}}`;
    else if (syntax === 'int') replacement = `\\int_{a}^{b} ${selected || 'x'} dx`;
    else if (syntax === 'matrix') replacement = `\\begin{matrix} ${selected || 'a'} & b \\\\ c & d \\end{matrix}`;
    else if (syntax === 'equation') replacement = `\\begin{equation}\n  ${selected || 'E = mc^2'}\n\\end{equation}\n`;
    else if (syntax === 'greek') replacement = `\\alpha`;

    const newText = before + replacement + after;
    setNotes(newText);
    setSaveStatus('Saving changes...');

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Client-side LaTeX compiler parser
  const compileLaTeX = (latexText) => {
    if (!latexText) return '<div class="latex-compiled-empty">Start typing LaTeX code to compile your paper...</div>';

    let html = latexText;

    // Extract Title, Author, Date
    let title = "";
    let author = "";
    let date = "";

    const titleMatch = latexText.match(/\\title\{([^}]+)\}/);
    if (titleMatch) title = titleMatch[1];

    const authorMatch = latexText.match(/\\author\{([^}]+)\}/);
    if (authorMatch) author = authorMatch[1];

    const dateMatch = latexText.match(/\\date\{([^}]+)\}/);
    if (dateMatch) {
      date = dateMatch[1] === '\\today' ? new Date().toLocaleDateString() : dateMatch[1];
    }

    // Compile title block
    const makeTitleHtml = `
      <div class="latex-title-block">
        <h1 class="latex-compiled-title">${title || 'Academic Paper'}</h1>
        <div class="latex-compiled-author">${author || ''}</div>
        <div class="latex-compiled-date">${date || ''}</div>
      </div>
    `;

    // Replace \maketitle
    html = html.replace(/\\maketitle/g, makeTitleHtml);

    // Strip preamble items
    html = html.replace(/\\documentclass\{[^}]+\}/g, '');
    html = html.replace(/\\title\{[^}]+\}/g, '');
    html = html.replace(/\\author\{[^}]+\}/g, '');
    html = html.replace(/\\date\{[^}]+\}/g, '');
    html = html.replace(/\\begin\{document\}/g, '');
    html = html.replace(/\\end\{document\}/g, '');

    // Replace explicit line breaks
    html = html.replace(/\\\\|\\newline/g, '<br />');

    // Replace Section headings
    let sectionCount = 0;
    html = html.replace(/\\section\{([^}]+)\}/g, (match, p1) => {
      sectionCount++;
      return `<h2 class="latex-compiled-h2">${sectionCount}. ${p1}</h2>`;
    });

    // Replace Subsection headings
    let subsectionCount = 0;
    html = html.replace(/\\subsection\{([^}]+)\}/g, (match, p1) => {
      subsectionCount++;
      return `<h3 class="latex-compiled-h3">${sectionCount}.${subsectionCount}. ${p1}</h3>`;
    });

    // Replace Equations
    html = html.replace(/\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g, (match, p1) => {
      return `\n$$\n${p1.trim()}\n$$\n`;
    });

    // Replace itemize lists
    html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, p1) => {
      const items = p1.replace(/\\item\s+([^\n]+)/g, '<li>$1</li>');
      return `<ul class="latex-compiled-ul">${items}</ul>`;
    });

    // Replace enumerate lists
    html = html.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, p1) => {
      const items = p1.replace(/\\item\s+([^\n]+)/g, '<li>$1</li>');
      return `<ol class="latex-compiled-ol">${items}</ol>`;
    });

    // Replace formatting \textbf, \textit, \texttt
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\texttt\{([^}]+)\}/g, '<code>$1</code>');

    // Replace newlines with paragraph breaks
    const lines = html.split('\n\n');
    const paras = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      // Don't wrap headings, lists, or block equations in paragraphs
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('$$') || trimmed.startsWith('<div')) {
        return trimmed;
      }
      return `<p class="latex-compiled-p">${trimmed}</p>`;
    });

    return paras.filter(Boolean).join('\n');
  };

  // Trigger KaTeX rendering on preview pane mounts and updates
  useEffect(() => {
    if (previewMode && previewRef.current && window.renderMathInElement) {
      try {
        window.renderMathInElement(previewRef.current, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.error("KaTeX auto-render failed:", err);
      }
    }
  }, [notes, previewMode, noteType, katexLoaded, resource.id]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setSaveStatus('Saving changes...');
  };

  // Auto-save notes changes
  useEffect(() => {
    if (!resource) return;
    
    const delayDebounce = setTimeout(() => {
      onSaveNotes(resource.id, notes, status, noteType);
      setSaveStatus('All changes saved');
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [notes, status, noteType, resource.id]);

  const handleManualSave = () => {
    onSaveNotes(resource.id, notes, status, noteType);
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
      
      const isLatex = noteType === 'latex';
      const parsedContent = isLatex ? compileLaTeX(notesText) : notesText;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>${res.title} - Study Paper</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
            <style>
              ${isLatex ? `
                body { 
                  font-family: "Times New Roman", Times, Georgia, serif; 
                  padding: 1.5in 1.2in; 
                  color: #000000; 
                  line-height: 1.6; 
                  font-size: 11pt;
                  background: #ffffff;
                }
                .latex-title-block {
                  text-align: center;
                  margin-bottom: 2rem;
                }
                .latex-compiled-title {
                  font-size: 18pt;
                  font-weight: bold;
                  margin-bottom: 0.5rem;
                }
                .latex-compiled-author {
                  font-size: 11pt;
                  margin-bottom: 0.25rem;
                }
                .latex-compiled-date {
                  font-size: 11pt;
                  color: #333333;
                  margin-bottom: 1.5rem;
                }
                .latex-compiled-h2 {
                  font-size: 13pt;
                  font-weight: bold;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  border: none;
                }
                .latex-compiled-h3 {
                  font-size: 11pt;
                  font-weight: bold;
                  margin-top: 1.25rem;
                  margin-bottom: 0.5rem;
                }
                .latex-compiled-p {
                  margin-bottom: 1rem;
                  text-indent: 0.25in;
                  text-align: justify;
                }
                .latex-compiled-ul, .latex-compiled-ol {
                  margin-bottom: 1rem;
                  padding-left: 2rem;
                }
                .latex-compiled-ul li, .latex-compiled-ol li {
                  margin-bottom: 0.25rem;
                }
              ` : `
                body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; line-height: 1.65; }
                h1 { color: #4f46e5; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-top: 0; font-size: 24px; }
                .meta { font-size: 13px; color: #64748b; margin-bottom: 25px; font-weight: 700; text-transform: uppercase; }
                .notes-content { white-space: pre-wrap; font-size: 14px; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                code { font-family: monospace; background: #e2e8f0; padding: 2px 4px; border-radius: 4px; font-size: 13px; }
              `}
            </style>
            <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
          </head>
          <body>
            ${isLatex ? `
              <div id="latex-content">${parsedContent}</div>
            ` : `
              <h1>${res.title}</h1>
              <div class="meta">Subject: ${res.subject} • Provider: ${res.provider}</div>
              <div class="notes-content">${parsedContent || 'No study notes recorded.'}</div>
            `}
            <script>
              window.onload = function() {
                if (window.renderMathInElement) {
                  window.renderMathInElement(document.body, {
                    delimiters: [
                      { left: "$$", right: "$$", display: true },
                      { left: "$", right: "$", display: false },
                      { left: "\\(", right: "\\)", display: false },
                      { left: "\\[", right: "\\]", display: true }
                    ],
                    throwOnError: false
                  });
                }
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }, 300);
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

              {/* Format Toggle Switcher */}
              <div className="note-format-group flex-center" style={{ gap: '0.75rem' }}>
                <div className="format-toggle-tabs">
                  <button 
                    className={`format-toggle-btn ${noteType === 'markdown' ? 'active' : ''}`}
                    onClick={() => handleToggleNoteType('markdown')}
                    title="Switch to Markdown Notes"
                  >
                    Markdown
                  </button>
                  <button 
                    className={`format-toggle-btn ${noteType === 'latex' ? 'active' : ''}`}
                    onClick={() => handleToggleNoteType('latex')}
                    title="Switch to LaTeX Paper Compiler"
                  >
                    LaTeX
                  </button>
                </div>
                <span className="save-status-indicator">{saveStatus}</span>
              </div>
            </div>

            {/* Note text editor */}
            {!previewMode ? (
              <div className="editor-container">
                {/* Dynamic Formatting Toolbar */}
                <div className="toolbar">
                  {noteType === 'markdown' ? (
                    <>
                      <button onClick={() => handleInsertMarkdown('heading')} title="Add Heading"><Heading1 size={14} /></button>
                      <button onClick={() => handleInsertMarkdown('bold')} title="Bold Text"><Bold size={14} /></button>
                      <button onClick={() => handleInsertMarkdown('italic')} title="Italic Text"><Italic size={14} /></button>
                      <button onClick={() => handleInsertMarkdown('list')} title="Add Bullet List"><List size={14} /></button>
                      <button onClick={() => handleInsertMarkdown('code')} title="Add Code Block"><Code size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleInsertLatex('section')} title="Add Section (\section)" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>Sec</button>
                      <button onClick={() => handleInsertLatex('subsection')} title="Add Subsection (\subsection)" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>Sub</button>
                      <button onClick={() => handleInsertLatex('bold')} title="Bold Text (\textbf)"><Bold size={14} /></button>
                      <button onClick={() => handleInsertLatex('italic')} title="Italic Text (\textit)"><Italic size={14} /></button>
                      <button onClick={() => handleInsertLatex('frac')} title="Insert Fraction (\frac)" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>a/b</button>
                      <button onClick={() => handleInsertLatex('sqrt')} title="Insert Square Root (\sqrt)" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>√x</button>
                      <button onClick={() => handleInsertLatex('equation')} title="Insert Equation Block (\begin{equation})" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>eq</button>
                      <button onClick={() => handleInsertLatex('int')} title="Insert Integral (\int)" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>∫</button>
                      <button onClick={() => handleInsertLatex('matrix')} title="Insert Matrix (\begin{matrix})" style={{ fontWeight: 'bold', fontSize: '11px', padding: '0.2rem 0.4rem' }}>[M]</button>
                      <button 
                        onClick={() => setShowLatexHelp(!showLatexHelp)} 
                        title="Show LaTeX Help Guide"
                        className={`help-toggle-btn ${showLatexHelp ? 'active' : ''}`}
                        style={{ 
                          marginLeft: 'auto', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.25rem', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          background: showLatexHelp ? 'var(--accent-primary)' : 'var(--accent-glow)', 
                          color: showLatexHelp ? '#ffffff' : 'var(--accent-primary)', 
                          border: '1px solid rgba(99, 102, 241, 0.2)', 
                          fontSize: '0.75rem', 
                          fontWeight: 600 
                        }}
                      >
                        Help & Commands
                      </button>
                    </>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder={noteType === 'latex' ? "Write LaTeX document code here... Define \\title{}, \\author{}, \\maketitle, and write section papers!" : "Summarize this resource, paste code blocks, or draft your study roadmap... Notes support basic markdown formats!"}
                  className="notepad-textarea"
                />
              </div>
            ) : (
              <div 
                ref={previewRef}
                className={noteType === 'latex' ? 'latex-compiled-preview' : 'preview-container'}
                dangerouslySetInnerHTML={{ __html: noteType === 'latex' ? compileLaTeX(notes) : parseMarkdown(notes) }}
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

            {/* Integrated LaTeX Help Panel Overlay */}
            {showLatexHelp && (
              <div className="latex-help-overlay">
                <div className="latex-help-header flex-between">
                  <h3>LaTeX Command Guide</h3>
                  <button className="help-close-btn" onClick={() => setShowLatexHelp(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="latex-help-body">
                  <div className="help-section">
                    <h4>Document Structure</h4>
                    <table>
                      <tbody>
                        <tr><td><code>\documentclass{"{article}"}</code></td><td>Define document type</td></tr>
                        <tr><td><code>\title{"{Text}"}</code></td><td>Set document title</td></tr>
                        <tr><td><code>\author{"{Text}"}</code></td><td>Set author name</td></tr>
                        <tr><td><code>\date{"{\\today}"}</code></td><td>Set date of paper</td></tr>
                        <tr><td><code>\maketitle</code></td><td>Render title block header</td></tr>
                        <tr><td><code>\section{"{Name}"}</code></td><td>First level heading</td></tr>
                        <tr><td><code>\subsection{"{Name}"}</code></td><td>Second level heading</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="help-section">
                    <h4>Math & Equations</h4>
                    <table>
                      <tbody>
                        <tr><td><code>$E = mc^2$</code></td><td>Inline math formula</td></tr>
                        <tr><td><code>$$E = mc^2$$</code></td><td>Centered block formula</td></tr>
                        <tr><td><code>\begin{"{equation}"}...\end{"{equation}"}</code></td><td>Numbered block equation</td></tr>
                        <tr><td><code>\frac{"{a}"}{"{b}"}</code></td><td>Fraction: <sup>a</sup>&frasl;<sub>b</sub></td></tr>
                        <tr><td><code>\sqrt{"{x}"}</code></td><td>Square root symbol</td></tr>
                        <tr><td><code>\int_a^b</code></td><td>Integral calculus bounds</td></tr>
                        <tr><td><code>\sum_i^n</code></td><td>Summation series math</td></tr>
                        <tr><td><code>^ and _</code></td><td>Superscript (x^2) and subscript (x_i)</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="help-section">
                    <h4>Text Formatting</h4>
                    <table>
                      <tbody>
                        <tr><td><code>\textbf{"{text}"}</code></td><td><b>Bold weight text</b></td></tr>
                        <tr><td><code>\textit{"{text}"}</code></td><td><i>Italic slanted text</i></td></tr>
                        <tr><td><code>\texttt{"{text}"}</code></td><td><code>Monospace code font</code></td></tr>
                        <tr><td><code>\\\\ or \newline</code></td><td>Force line break</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="help-section">
                    <h4>Lists & Environments</h4>
                    <table>
                      <tbody>
                        <tr><td><code>\begin{"{itemize}"} \item A \end{"{itemize}"}</code></td><td>Bulleted list items</td></tr>
                        <tr><td><code>\begin{"{enumerate}"} \item A \end{"{enumerate}"}</code></td><td>Numbered list items</td></tr>
                        <tr><td><code>\begin{"{matrix}"} a & b \\ c & d \end{"{matrix}"}</code></td><td>Matrix cell alignments</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="help-section">
                    <h4>Greek Symbols & Constants</h4>
                    <table>
                      <tbody>
                        <tr><td><code>\alpha, \beta, \gamma</code></td><td>α, β, γ</td></tr>
                        <tr><td><code>\pi, \theta, \lambda</code></td><td>π, θ, λ</td></tr>
                        <tr><td><code>\infty, \partial, \nabla</code></td><td>∞, ∂, ∇</td></tr>
                        <tr><td><code>\hbar, \psi, \Psi</code></td><td>Planck constant, wavefunctions</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

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

        .answer-status-pill.status-incorrect {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* LaTeX compile preview and tools styles */
        .latex-compiled-preview {
          flex: 1;
          padding: 3rem 2.5rem;
          overflow-y: auto;
          line-height: 1.6;
          font-size: 11pt;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: "Times New Roman", Times, Georgia, serif !important;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .latex-compiled-preview .latex-title-block {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid #dddddd;
          padding-bottom: 1.5rem;
        }

        .latex-compiled-preview .latex-compiled-title {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #000000 !important;
          border: none !important;
          padding: 0 !important;
          font-family: "Times New Roman", Times, Georgia, serif !important;
        }

        .latex-compiled-preview .latex-compiled-author {
          font-size: 11pt;
          margin-bottom: 0.25rem;
          color: #333333 !important;
        }

        .latex-compiled-preview .latex-compiled-date {
          font-size: 11pt;
          color: #555555 !important;
        }

        .latex-compiled-preview .latex-compiled-h2 {
          font-size: 13pt;
          font-weight: bold;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
          color: #000000 !important;
          border: none !important;
          padding: 0 !important;
          font-family: "Times New Roman", Times, Georgia, serif !important;
        }

        .latex-compiled-preview .latex-compiled-h3 {
          font-size: 11pt;
          font-weight: bold;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
          color: #000000 !important;
          font-family: "Times New Roman", Times, Georgia, serif !important;
        }

        .latex-compiled-preview .latex-compiled-p {
          margin-bottom: 1rem;
          text-indent: 0.25in;
          text-align: justify;
          color: #000000 !important;
        }

        .latex-compiled-preview h2 + p,
        .latex-compiled-preview h3 + p,
        .latex-compiled-preview .latex-title-block + p {
          text-indent: 0 !important;
        }

        .latex-compiled-preview .latex-compiled-ul, 
        .latex-compiled-preview .latex-compiled-ol {
          margin-bottom: 1rem;
          padding-left: 2.5rem !important;
          list-style-position: outside !important;
        }

        .latex-compiled-preview .latex-compiled-ul li {
          list-style-type: disc !important;
          margin-bottom: 0.25rem;
          color: #000000 !important;
        }

        .latex-compiled-preview .latex-compiled-ol li {
          list-style-type: decimal !important;
          margin-bottom: 0.25rem;
          color: #000000 !important;
        }

        .latex-compiled-preview code {
          background: #f4f4f4 !important;
          color: #333333 !important;
          border: 1px solid #cccccc !important;
          font-family: monospace !important;
          padding: 0.1rem 0.3rem !important;
          border-radius: 4px !important;
          font-size: 0.9em !important;
        }

        /* Format switcher controls */
        .format-toggle-tabs {
          display: flex;
          background: var(--bg-primary);
          padding: 2px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
        }

        .format-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.25rem 0.6rem;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .format-toggle-btn:hover {
          color: var(--text-primary);
        }

        .format-toggle-btn.active {
          color: var(--accent-primary);
          background: var(--accent-glow);
        }

        /* LaTeX Help slide-out overlay */
        .latex-help-overlay {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 10;
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .latex-help-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }

        .latex-help-header h3 {
          font-size: 1rem;
          font-family: var(--font-display);
          color: var(--text-primary);
          margin: 0;
        }

        .help-close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          display: flex;
          transition: all 0.2s ease;
        }

        .help-close-btn:hover {
          background: var(--border-color);
          color: var(--text-primary);
        }

        .latex-help-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .help-section h4 {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--accent-primary);
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .help-section table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
        }

        .help-section td {
          padding: 0.4rem 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          vertical-align: middle;
        }

        .help-section tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .help-section code {
          background: var(--bg-tertiary) !important;
          border: 1px solid var(--border-color) !important;
          padding: 0.15rem 0.35rem !important;
          border-radius: 4px !important;
          color: var(--accent-secondary) !important;
          font-family: monospace !important;
        }
      `}</style>
    </div>
  );
}
