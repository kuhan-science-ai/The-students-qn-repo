import React, { useState } from 'react';
import { Terminal, ShieldAlert, Sparkles, RefreshCw, X, HelpCircle, Code2 } from 'lucide-react';
import { curatedResources } from '../data/curatedResources';

export default function CheatConsole({ 
  onClose, 
  onResetProgress, 
  onSeedDemo, 
  onCompleteAll, 
  onToggleMatrix 
}) {
  const [cheatCode, setCheatCode] = useState('');
  const [consoleMsg, setConsoleMsg] = useState('ENTER SECRET SYSTEM ACCESS CHEAT CODE...');

  const handleCheatSubmit = (e) => {
    e.preventDefault();
    const code = cheatCode.trim().toUpperCase();
    setCheatCode('');

    if (code === 'RESET') {
      onResetProgress();
      setConsoleMsg('>> PROGRESS RESET: ALL DATABASES AND LOCAL STORAGE WIPED CLEAN.');
    } else if (code === 'DEMO') {
      onSeedDemo();
      setConsoleMsg('>> DEMO UNLOCKED: 5 DETAILED BINDER ENTRIES GENERATED.');
    } else if (code === 'COMPLETE') {
      onCompleteAll();
      setConsoleMsg('>> SYLLABUS BYPASSED: ALL CURRICULUM NODES MARKED AS COMPLETED.');
    } else if (code === 'MATRIX') {
      onToggleMatrix();
      setConsoleMsg('>> CORE GLITCH: MATRIX CODE GLOW FONT OVERLAY TOGGLED.');
    } else {
      setConsoleMsg(`>> INVALID CHEAT CODE: "${code}". TRY "DEMO", "RESET", "COMPLETE", or "MATRIX".`);
    }
  };

  return (
    <div className="cheat-overlay flex-center">
      <div className="cheat-window glass-panel animate-fade-in">
        <header className="cheat-header flex-between">
          <div className="title-wrapper">
            <Terminal size={18} className="terminal-glow-icon" />
            <h3>SYSTEM CHEAT CONSOLE</h3>
            <span className="version-pill">v4.20</span>
          </div>
          <button className="cheat-close-btn" onClick={onClose} aria-label="Close Cheat Console">
            <X size={18} />
          </button>
        </header>

        <div className="cheat-body">
          {/* Virtual Terminal Screen */}
          <div className="terminal-screen">
            <div className="crt-glow" />
            <p className="terminal-line"><span className="term-prompt">user@studyspace:~$</span> toggle_console --active</p>
            <p className="terminal-line term-alert"><span className="term-prompt">sys:</span> {consoleMsg}</p>
            <div className="cursor-line">
              <span className="term-prompt">sys_exec &gt;</span>
              <form onSubmit={handleCheatSubmit} className="terminal-form">
                <input 
                  type="text" 
                  className="terminal-input"
                  value={cheatCode}
                  onChange={(e) => setCheatCode(e.target.value)}
                  placeholder="type code here (e.g. DEMO, COMPLETE)..."
                  autoFocus
                />
              </form>
            </div>
          </div>

          <div className="cheat-info-box">
            <HelpCircle size={16} />
            <span>Toggle this dashboard anytime with <strong>Ctrl + Alt + C</strong>.</span>
          </div>

          {/* Action grid shortcuts */}
          <div className="cheat-actions-grid">
            <button className="btn-cheat reset" onClick={() => {
              onResetProgress();
              setConsoleMsg('>> PROGRESS RESET: BINDER WIPED CLEAN.');
            }}>
              <RefreshCw size={16} />
              <div className="btn-text">
                <strong>Reset Progression</strong>
                <span>Wipe localStorage</span>
              </div>
            </button>

            <button className="btn-cheat seed" onClick={() => {
              onSeedDemo();
              setConsoleMsg('>> DEMO DATA DEPLOYED: BINDER SEEDED.');
            }}>
              <Sparkles size={16} />
              <div className="btn-text">
                <strong>Load Demo Binder</strong>
                <span>Add 5 notes & folders</span>
              </div>
            </button>

            <button className="btn-cheat unlock" onClick={() => {
              onCompleteAll();
              setConsoleMsg('>> ALL COMPLETED: ALL CURRICULUM RESCUED.');
            }}>
              <Code2 size={16} />
              <div className="btn-text">
                <strong>100% Syllabus</strong>
                <span>Mark everything completed</span>
              </div>
            </button>

            <button className="btn-cheat matrix" onClick={() => {
              onToggleMatrix();
              setConsoleMsg('>> MATRIX GRAPHICS OVERLAY SWITCHED.');
            }}>
              <Terminal size={16} />
              <div className="btn-text">
                <strong>Matrix Font</strong>
                <span>Toggle hacker green overlay</span>
              </div>
            </button>
          </div>

          <div className="code-hint-sheet">
            <h4>Available Command Codes:</h4>
            <ul>
              <li><code>RESET</code> : Clear localStorage and folders.</li>
              <li><code>DEMO</code> : Seed 5 customized binders for testing.</li>
              <li><code>COMPLETE</code> : Autocomplete the entire curricula.</li>
              <li><code>MATRIX</code> : Glitch typography to monospaced green.</li>
            </ul>
          </div>

        </div>
      </div>

      <style>{`
        .cheat-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 2000;
          padding: 1.5rem;
          animation: fadeIn 0.25s ease;
        }

        .cheat-window {
          width: 100%;
          max-width: 540px;
          background: #020617;
          border-color: #22c55e;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.2);
          overflow: hidden;
          border-radius: 16px;
        }

        .cheat-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px dashed #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          color: #22c55e;
        }

        .terminal-glow-icon {
          animation: pulseGlowGreen 2s infinite ease-in-out;
        }

        @keyframes pulseGlowGreen {
          0%, 100% { filter: drop-shadow(0 0 2px #22c55e); }
          50% { filter: drop-shadow(0 0 8px #22c55e); }
        }

        .cheat-header h3 {
          font-size: 0.95rem;
          font-family: monospace;
          color: #22c55e;
          letter-spacing: 0.05em;
        }

        .version-pill {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          font-size: 0.65rem;
          font-family: monospace;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
        }

        .cheat-close-btn {
          background: transparent;
          border: none;
          color: #22c55e;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          display: flex;
          transition: all 0.2s ease;
        }

        .cheat-close-btn:hover {
          background: rgba(34, 197, 94, 0.15);
        }

        .cheat-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* CRT Screen */
        .terminal-screen {
          background: #000;
          border: 1px solid #14532d;
          border-radius: 8px;
          padding: 1.15rem;
          font-family: monospace;
          font-size: 0.85rem;
          color: #22c55e;
          position: relative;
          min-height: 120px;
          overflow: hidden;
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
        }

        .crt-glow {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
          background-size: 100% 4px, 6px 100%;
          pointer-events: none;
        }

        .terminal-line {
          margin-bottom: 0.5rem;
          word-break: break-all;
          text-shadow: 0 0 2px rgba(34, 197, 94, 0.8);
        }

        .term-prompt {
          color: #86efac;
        }

        .term-alert {
          color: #4ade80;
        }

        .cursor-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .terminal-form {
          flex: 1;
        }

        .terminal-input {
          width: 100%;
          background: transparent;
          border: none;
          color: #22c55e;
          font-family: monospace;
          font-size: 0.85rem;
          outline: none;
          text-shadow: 0 0 2px rgba(34, 197, 94, 0.8);
        }

        .terminal-input::placeholder {
          color: #14532d;
        }

        .cheat-info-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border-color);
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .cheat-info-box strong {
          color: #22c55e;
        }

        /* Action Grid */
        .cheat-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .btn-cheat {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 0.85rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-family: var(--font-body);
          text-align: left;
          transition: all 0.2s ease;
        }

        .btn-cheat:hover {
          transform: translateY(-2px);
        }

        .btn-cheat.reset { border-color: rgba(239, 68, 68, 0.4); color: #f87171; }
        .btn-cheat.reset:hover { background: rgba(239, 68, 68, 0.1); }
        .btn-cheat.seed { border-color: rgba(99, 102, 241, 0.4); color: #818cf8; }
        .btn-cheat.seed:hover { background: rgba(99, 102, 241, 0.1); }
        .btn-cheat.unlock { border-color: rgba(245, 158, 11, 0.4); color: #fbbf24; }
        .btn-cheat.unlock:hover { background: rgba(245, 158, 11, 0.1); }
        .btn-cheat.matrix { border-color: rgba(34, 197, 94, 0.4); color: #4ade80; }
        .btn-cheat.matrix:hover { background: rgba(34, 197, 94, 0.1); }

        .btn-text {
          display: flex;
          flex-direction: column;
        }

        .btn-text strong {
          font-size: 0.85rem;
        }

        .btn-text span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .code-hint-sheet {
          border-top: 1px dashed var(--border-color);
          padding-top: 1rem;
        }

        .code-hint-sheet h4 {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
        }

        .code-hint-sheet ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .code-hint-sheet li {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .code-hint-sheet code {
          background: #000;
          color: #22c55e;
          font-family: monospace;
          padding: 0.05rem 0.3rem;
          border-radius: 4px;
          border: 1px solid #14532d;
        }
      `}</style>
    </div>
  );
}
