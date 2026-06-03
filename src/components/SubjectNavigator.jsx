import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Atom, 
  TestTube, 
  Dna, 
  BookOpen, 
  Cpu, 
  Globe2 
} from 'lucide-react';

export default function SubjectNavigator({ setActivePage, setFilters, setQuery }) {
  const [activeTab, setActiveTab] = useState('grade11'); // 'grade11', 'grade12', 'advanced'
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Subject icons helper
  const getSubjectIcon = (subject) => {
    switch(subject) {
      case 'Physics': return <Atom size={16} className="subj-icon physics" />;
      case 'Chemistry': return <TestTube size={16} className="subj-icon chemistry" />;
      case 'Biology': return <Dna size={16} className="subj-icon biology" />;
      case 'Mathematics': return <BookOpen size={16} className="subj-icon mathematics" />;
      case 'Advanced CS': return <Cpu size={16} className="subj-icon cs" />;
      case 'Advanced Economics': return <Globe2 size={16} className="subj-icon economics" />;
      default: return <GraduationCap size={16} className="subj-icon default" />;
    }
  };

  const topicsData = {
    grade11: [
      {
        id: '11-m-1',
        subject: 'Physics',
        name: 'Kinematics & Dynamics Mechanics',
        desc: 'Vector mathematics, equations of motion, Newton’s Laws of motion, friction, and conservation of momentum.',
        focus: 'Free Body Diagrams, Momentum conservation, Friction coefficients',
        query: 'Kinematics Mechanics'
      },
      {
        id: '11-m-2',
        subject: 'Physics',
        name: 'Thermodynamics & Kinetic Theory',
        desc: 'Heat transfer, thermal expansion, ideal gas laws, and the First Law of Thermodynamics.',
        focus: 'Thermal Equilibrium, Gas Work calculations, Thermodynamic cycles',
        query: 'Thermodynamics ideal gas'
      },
      {
        id: '11-c-1',
        subject: 'Chemistry',
        name: 'Atomic Structure & Periodic Trends',
        desc: 'Quantum numbers, electron configurations, periodic trends (electronegativity, atomic radius, ionization energy).',
        focus: 'Periodic Trends, Configurations, Bohr model',
        query: 'Build an Atom orbitals'
      },
      {
        id: '11-c-2',
        subject: 'Chemistry',
        name: 'Chemical Bonding & Geometry',
        desc: 'Lewis structure dot models, VSEPR molecular geometry, molecular dipoles, and intermolecular forces (IMF).',
        focus: 'VSEPR Geometry, Covalent bonds, IMF',
        query: 'Chemical Bonding VSEPR'
      },
      {
        id: '11-b-1',
        subject: 'Biology',
        name: 'Cellular Structure & Transport',
        desc: 'Membrane transport (passive/active), cell organelles, cellular respiration pathways, and chloroplast light reactions.',
        focus: 'Active Transport, ATP synthesis, Photosynthesis',
        query: 'Cellular Biology respiration'
      },
      {
        id: '11-b-2',
        subject: 'Biology',
        name: 'Cell Cycles & Mendelian Genetics',
        desc: 'Cell divisions (mitosis vs meiosis), heredity, Punnett squares, and pedigree family trees.',
        focus: 'Meiosis crossing over, Heredity, Mendelian ratios',
        query: 'Mitosis meiosis genetics'
      },
      {
        id: '11-math-1',
        subject: 'Mathematics',
        name: 'Algebraic Matrices & Systems',
        desc: 'Complex number solutions, matrices, determinants, and systems of linear equations.',
        focus: 'Complex roots, Determinants, Matrix multiplication',
        query: 'Linear algebra matrices'
      },
      {
        id: '11-math-2',
        subject: 'Mathematics',
        name: 'Functions & Trigonometry',
        desc: 'Composite/inverse functions, graphs of logs and exponents, and trigonometric identities.',
        focus: 'Logarithmic graphs, Trigonometric identities, Domain range',
        query: 'Functions graphs algebra'
      }
    ],
    grade12: [
      {
        id: '12-p-1',
        subject: 'Physics',
        name: 'Electromagnetism & Potential',
        desc: 'Electric fields, Coulomb’s Law, capacitors, DC circuits, magnetic fields, and electromagnetic induction.',
        focus: 'Circuits loop laws, Capacitance, Faraday\'s Law',
        query: 'Electromagnetism induction'
      },
      {
        id: '12-p-2',
        subject: 'Physics',
        name: 'Quantum Theory & Atomic Model',
        desc: 'Wave-particle duality, photoelectric effect, hydrogen spectra, and introductory nuclear decay.',
        focus: 'Photoelectric equations, Planck\'s Constant, Half life calculations',
        query: 'Quantum physics atomic model'
      },
      {
        id: '12-c-1',
        subject: 'Chemistry',
        name: 'Organic Chemistry Reactions',
        desc: 'Nomenclature of carbon chains, functional groups (alcohols, esters), isomerism, and synthesis pathways.',
        focus: 'Functional groups, Isomers, SN1/SN2 pathways',
        query: 'Organic Chemistry reactions'
      },
      {
        id: '12-c-2',
        subject: 'Chemistry',
        name: 'Kinetics & Buffer Equilibria',
        desc: 'Rate laws, collision theory, equilibrium constants (Kc, Kp), Le Chatelier\'s principle, and pH buffer titrations.',
        focus: 'Equilibrium calculations, Rate laws, pH buffer equations',
        query: 'Chemical kinetics equilibrium'
      },
      {
        id: '12-b-1',
        subject: 'Biology',
        name: 'Molecular Genetics & Translation',
        desc: 'DNA replication, RNA transcription, protein translation, and gene expression regulation.',
        focus: 'DNA polymerase, Transcription factors, Translation codons',
        query: 'Gene expression DNA replication'
      },
      {
        id: '12-b-2',
        subject: 'Biology',
        name: 'Ecology & Speciation Evolution',
        desc: 'Natural selection mechanics, speciation models, Hardy-Weinberg equilibrium, and nutrient cycles.',
        focus: 'Hardy Weinberg gene frequency, Speciation, Food webs',
        query: 'Ecology evolution natural selection'
      },
      {
        id: '12-math-1',
        subject: 'Mathematics',
        name: 'Differential & Integral Calculus',
        desc: 'Limits, differentiability rules, derivative optimizations, integration techniques, and area calculations.',
        focus: 'Optimization rates, Derivative chain rules, Fundamental theorem of Calculus',
        query: 'Essence of Calculus derivatives'
      },
      {
        id: '12-math-2',
        subject: 'Mathematics',
        name: 'Probability & Distributions',
        desc: 'Permutations and combinations, conditional probability, Bayes\' theorem, and random variables.',
        focus: 'Bayes Theorem, Permutations combinations, Binomial distribution',
        query: 'Probability Bayes theorem'
      }
    ],
    advanced: [
      {
        id: 'adv-1',
        subject: 'Physics',
        name: 'Quantum Computing & Teleportation',
        desc: 'Bell\'s theorem, quantum qubits, logic gates, spin state entanglement, and quantum key cryptography.',
        focus: 'Superposition, Qubits, Bell states, Cryptography',
        query: 'quantum computing entanglement Bell theorem'
      },
      {
        id: 'adv-2',
        subject: 'Biology',
        name: 'CRISPR-Cas9 & Genetic Silencing',
        desc: 'Endonuclease mechanisms, guide RNA mapping, gene therapy vectors, and genetic modification ethical reviews.',
        focus: 'Cas9 endonuclease, gRNA targeting, Viral vectors',
        query: 'CRISPR Cas9 gene editing therapy vector'
      },
      {
        id: 'adv-3',
        subject: 'Advanced CS',
        name: 'Neural Networks & Deep Learning',
        desc: 'Gradient descent, backpropagation derivations, activation functions, and Transformer architecture.',
        focus: 'Backpropagation, Transformer models, Gradient descent',
        query: 'deep learning neural network backpropagation transformer'
      },
      {
        id: 'adv-4',
        subject: 'Physics',
        name: 'Cosmology & Gravitational Waves',
        desc: 'Black hole thermodynamics, gravitational waves, Hawking radiation, and the Cosmic Microwave Background.',
        focus: 'General relativity, Event horizons, Hawking radiation',
        query: 'cosmology gravitational waves black hole thermodynamics'
      },
      {
        id: 'adv-5',
        subject: 'Chemistry',
        name: 'Enantioselective Synthesis Pathways',
        desc: 'Chiral catalysts, stereocenter inversions, thermodynamic vs kinetic controls, and pharmaceutical synthesis design.',
        focus: 'Stereochemistry, Enantiomers, Chiral synthesis, Transition states',
        query: 'enantioselective synthesis stereochemistry chiral catalyst'
      },
      {
        id: 'adv-6',
        subject: 'Advanced Economics',
        name: 'Macroeconomic DSGE Frameworks',
        desc: 'Dynamic Stochastic General Equilibrium models, fiscal multipliers, game theory utility models, and inflation curves.',
        focus: 'DSGE modeling, Game theory Nash equilibrium, Multipliers',
        query: 'DSGE macroeconomic modeling fiscal multiplier Nash equilibrium'
      }
    ]
  };

  const handleLaunchSearch = (topic) => {
    setQuery(topic.query);
    setFilters({
      subject: activeTab === 'advanced' ? 'All Subjects' : topic.subject,
      resourceType: activeTab === 'advanced' ? 'paper' : 'All Types', // Advanced defaults to scientific papers
      gradeLevel: activeTab === 'grade11' ? 'Grade 11' : activeTab === 'grade12' ? 'Grade 12' : 'All Grades',
      difficulty: activeTab === 'advanced' ? 'Advanced' : 'All Difficulties'
    });
    setActivePage('search');
  };

  const currentTopics = topicsData[activeTab];
  const activeTopic = selectedTopic || currentTopics[0];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedTopic(topicsData[tabId][0]); // Auto select first item of the next tab
  };

  // Ensure selectedTopic points to an item in the current tab
  const getDisplayTopic = () => {
    if (currentTopics.some(t => t.id === activeTopic.id)) {
      return activeTopic;
    }
    return currentTopics[0];
  };

  const displayTopic = getDisplayTopic();

  return (
    <div className="navigator-view animate-fade-in">
      <div className="view-header">
        <h2>Syllabus & Research Pathways</h2>
        <p>Browse foundation topics divided by grade levels, or jump into advanced research modules.</p>
      </div>

      {/* Main Roadmap Category Tabs */}
      <div className="subject-bar glass-card roadmap-tabs-row">
        <button
          className={`subj-btn roadmap-tab ${activeTab === 'grade11' ? 'active' : ''}`}
          style={{ '--active-color': '#3b82f6' }}
          onClick={() => handleTabChange('grade11')}
        >
          <GraduationCap size={18} />
          <span>Grade 11 Syllabus</span>
        </button>

        <button
          className={`subj-btn roadmap-tab ${activeTab === 'grade12' ? 'active' : ''}`}
          style={{ '--active-color': '#8b5cf6' }}
          onClick={() => handleTabChange('grade12')}
        >
          <GraduationCap size={18} />
          <span>Grade 12 Syllabus</span>
        </button>

        <button
          className={`subj-btn roadmap-tab ${activeTab === 'advanced' ? 'active' : ''}`}
          style={{ '--active-color': '#ec4899' }}
          onClick={() => handleTabChange('advanced')}
        >
          <Sparkles size={18} />
          <span>Advanced & Research Hub</span>
        </button>
      </div>

      <div className="navigator-layout">
        {/* Topic Index list */}
        <div className="roadmap-tree-panel glass-card">
          <h3>
            {activeTab === 'grade11' && "11th Grade Foundations"}
            {activeTab === 'grade12' && "12th Grade Core Units"}
            {activeTab === 'advanced' && "University-Level Research Themes"}
          </h3>
          <p className="path-sub">Select a topic unit to display educational targets</p>

          <div className="nodes-container index-list">
            {currentTopics.map((topic, index) => {
              const isSelected = displayTopic.id === topic.id;
              return (
                <div key={topic.id} className="node-wrapper inline-wrapper">
                  <div 
                    className={`roadmap-node list-node ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <div className="node-number">{index + 1}</div>
                    <div className="node-details">
                      <h4>{topic.name}</h4>
                      <div className="topic-sub-meta">
                        {getSubjectIcon(topic.subject)}
                        <span className="topic-subj-text">{topic.subject}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Topic targets display */}
        <div className="node-detail-panel glass-card">
          <div className="node-header">
            <span className={`badge-label ${activeTab === 'grade11' ? 'g11' : activeTab === 'grade12' ? 'g12' : 'g-adv'}`}>
              {activeTab === 'grade11' && "Grade 11 Required Unit"}
              {activeTab === 'grade12' && "Grade 12 Exam Unit"}
              {activeTab === 'advanced' && "Advanced Research Target"}
            </span>
            <h3>{displayTopic.name}</h3>
          </div>

          <div className="detail-body">
            <div className="detail-section">
              <h5>Module Summary</h5>
              <p>{displayTopic.desc}</p>
            </div>

            <div className="detail-section">
              <h5>Focus Targets</h5>
              <div className="focus-pill-container">
                {displayTopic.focus.split(',').map((f, i) => (
                  <span key={i} className="focus-pill">{f.trim()}</span>
                ))}
              </div>
            </div>

            <div className="detail-actions">
              <button 
                className="btn btn-primary search-node-btn"
                onClick={() => handleLaunchSearch(displayTopic)}
              >
                <Search size={18} />
                <span>
                  {activeTab === 'advanced' ? "Query Academic Journals" : "Search Topic Resources"}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .navigator-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .roadmap-tabs-row {
          justify-content: flex-start;
          width: 100%;
        }

        .roadmap-tab {
          flex: 1;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .roadmap-tabs-row {
            flex-direction: column;
          }
        }

        .topic-sub-meta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.15rem;
        }

        .topic-subj-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .subj-icon {
          display: inline-flex;
          align-items: center;
        }
        .subj-icon.physics { color: #3b82f6; }
        .subj-icon.chemistry { color: #f59e0b; }
        .subj-icon.biology { color: #10b981; }
        .subj-icon.mathematics { color: #6366f1; }
        .subj-icon.cs { color: #ec4899; }
        .subj-icon.economics { color: #06b6d4; }

        .list-node {
          max-width: 100% !important;
        }

        .index-list {
          align-items: stretch;
          width: 100%;
          gap: 0.65rem;
        }

        .inline-wrapper {
          width: 100%;
        }

        .badge-label.g-adv {
          background: rgba(236, 72, 153, 0.15);
          color: #ec4899;
        }
      `}</style>
    </div>
  );
}
