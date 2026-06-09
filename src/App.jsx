import React, { useState, useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Dashboard from './components/Dashboard';
import SubjectNavigator from './components/SubjectNavigator';
import SearchHub from './components/SearchHub';
import Collections from './components/Collections';
import Workbench from './components/Workbench';
import CheatConsole from './components/CheatConsole';
import RelativisticTransition from './components/RelativisticTransition';
import AuthScreen from './components/AuthScreen';
import { curatedResources } from './data/curatedResources';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    resourceType: 'All Types',
    gradeLevel: 'All Grades',
    difficulty: 'All Difficulties'
  });
  
  const [savedItems, setSavedItems] = useState([]);
  const [activeWorkbenchResource, setActiveWorkbenchResource] = useState(null);
  const [showCheatTab, setShowCheatTab] = useState(false);
  const [activeTransition, setActiveTransition] = useState(null);
  const [transitionClass, setTransitionClass] = useState('');

  // Load theme, auth session, and saved binder items from localStorage on mount
  useEffect(() => {
    const localTheme = localStorage.getItem('studyspace_theme') || 'dark';
    setTheme(localTheme);
    document.documentElement.setAttribute('data-theme', localTheme);

    const localUser = localStorage.getItem('studyspace_user');
    if (localUser) {
      try {
        setCurrentUser(JSON.parse(localUser));
      } catch (err) {
        console.error("Error loading user session:", err);
        localStorage.removeItem('studyspace_user');
      }
    }

    const localSaved = localStorage.getItem('studyspace_saved');
    if (localSaved) {
      try {
        setSavedItems(JSON.parse(localSaved));
      } catch (err) {
        console.error("Error loading binder items:", err);
      }
    }
  }, []);
  
  // Trigger KaTeX rendering globally across the page whenever visual view state updates
  useEffect(() => {
    // We add a tiny delay to ensure React finishes DOM paint before KaTeX scans it
    const timer = setTimeout(() => {
      if (window.renderMathInElement) {
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
          console.error("KaTeX global render failed:", err);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activePage, activeWorkbenchResource, savedItems]);

  // Listen for Ctrl+Alt+C to toggle Cheat Console
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      // Detect if user pressed Ctrl + Alt + C
      if (key === 'c' && e.ctrlKey && e.altKey) {
        e.preventDefault();
        setShowCheatTab(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme updates to HTML root attribute and localStorage
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('studyspace_theme', nextTheme);
  };

  const handleSignIn = (user) => {
    setCurrentUser(user);
    localStorage.setItem('studyspace_user', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('studyspace_user');
  };

  // Helper to persist saved items state to localStorage
  const saveToLocalStorage = (items) => {
    setSavedItems(items);
    localStorage.setItem('studyspace_saved', JSON.stringify(items));
  };

  // CHEAT CONSOLE HANDLERS
  const handleResetProgress = () => {
    saveToLocalStorage([]);
  };

  const handleSeedDemo = () => {
    const demoItems = [
      {
        id: "demo-1",
        title: "Quantum Entanglement & Information",
        description: "Introduction to Bell's theorem, spin state polarization, and quantum teleportation mechanisms.",
        url: "https://www.youtube.com/embed/q4s_Vb7iX9c",
        provider: "arXiv / MIT OpenCourseWare",
        subject: "Physics",
        subtopic: "Quantum Physics",
        resourceType: "paper",
        difficulty: "Advanced",
        gradeLevel: "Grade 12",
        notes: `### 🌌 Quantum Entanglement & Bell State Analysis

#### 1. Mathematical Representation
An entangled state of a two-qubit system (the Bell state $|\\Phi^+\\rangle$) is represented as:
$$\\Phi^+ = \\frac{1}{\\sqrt{2}} (|00\\rangle + |11\\rangle)$$
This state cannot be factored into the tensor product of two independent single-qubit states, implying that measuring qubit 1 immediately collapses the state of qubit 2, regardless of distance.

#### 2. Classical vs Quantum Mechanics
| Characteristic | Classical Bits (Shor/Deutsch) | Quantum Qubits (Entangled) |
| :--- | :--- | :--- |
| **State Representation** | Binary (0 or 1) | Superposition: $\\alpha|0\\rangle + \\beta|1\\rangle$ |
| **Information Density** | $N$ bits hold $N$ states | $N$ qubits hold $2^N$ states simultaneously |
| **Correlation** | Independent or local | Non-local entanglement (Bell violation) |
| **Security** | Copyable (no-cloning does not apply) | Unclonable (No-Cloning Theorem) |

#### 3. Quantum State Measurement Simulation
Here is a Python simulator for measuring entangled Bell states:

\`\`\`python
import numpy as np

def simulate_bell_state_measurement(num_trials=1000):
    # Coefficients for Bell State: 1/sqrt(2) (|00> + |11>)
    state_vector = np.array([1/np.sqrt(2), 0, 0, 1/np.sqrt(2)])
    probabilities = np.abs(state_vector) ** 2
    
    # Outcomes: index 0 (00), 1 (01), 2 (10), 3 (11)
    outcomes = ['00', '01', '10', '11']
    results = np.random.choice(outcomes, size=num_trials, p=probabilities)
    
    counts = {out: np.sum(results == out) for out in outcomes}
    return counts

# Run entanglement test
counts = simulate_bell_state_measurement()
print(f"Entangled measurement counts (1000 trials): {counts}")
# Output will show ~500 trials of '00' and ~500 of '11', and 0 of '01'/'10'
\`\`\`

#### 4. Study Checklist
- [x] Derivation of Bell's Inequality violation
- [x] Entanglement verification using density matrices
- [ ] Implement quantum teleportation circuit in Qiskit`,
        status: "in-progress",
        folder: "Exam Prep",
        savedAt: new Date().toISOString()
      },
      {
        id: "demo-2",
        title: "Limits and Derivatives Mechanics",
        description: "Conceptual exploration of rates of change, tangent lines, and limits using graphical representations.",
        url: "https://www.youtube.com/embed/videoseries?list=PL0-GT3co4r2y2YErbmuJw2L5tW4Ew2O5B",
        provider: "3Blue1Brown",
        subject: "Mathematics",
        subtopic: "Calculus",
        resourceType: "video",
        difficulty: "AP/IB Level",
        gradeLevel: "Grade 12",
        notes: `### 📈 Differential Calculus: Limits and Derivatives Foundation

#### 1. The Fundamental Definition of a Derivative
The derivative $f'(x)$ represents the instantaneous rate of change of $f(x)$ at point $x$. It is defined as the limit of the difference quotient as the interval $\\Delta x$ approaches zero:
$$f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}$$

#### 2. Rate of Change Comparison
| Metric | Average Rate of Change (Secant Line) | Instantaneous Rate of Change (Tangent Line) |
| :--- | :--- | :--- |
| **Formula** | $m_{sec} = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}$ | $m_{tan} = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$ |
| **Interval** | $\\Delta x = x_2 - x_1 > 0$ | $\\Delta x \\to 0$ |
| **Visual representation** | Secant line cutting through two points | Tangent line touching a single point |

#### 3. Power & Chain Rule Program
A SymPy Python script to compute analytical derivatives:

\`\`\`python
import sympy as sp

def compute_symbolic_derivative():
    # Define variables
    x = sp.Symbol('x')
    
    # Define function: f(x) = (3x^2 + 5x)^4
    f = (3*x**2 + 5*x)**4
    
    # Compute derivative analytically via Chain Rule
    df_dx = sp.diff(f, x)
    
    print(f"Original Function: f(x) = {f}")
    print(f"Analytical Derivative: f'(x) = {df_dx}")
    
    # Evaluate at x = 1
    eval_at_one = df_dx.subs(x, 1)
    print(f"f'(1) = {eval_at_one}")

compute_symbolic_derivative()
\`\`\`

#### 4. Key Derivative Shortcuts
* **Power Rule**: $\\frac{d}{dx}[x^n] = n x^{n-1}$
* **Product Rule**: $\\frac{d}{dx}[u \\cdot v] = u'v + uv'$
* **Quotient Rule**: $\\frac{d}{dx}[\\frac{u}{v}] = \\frac{u'v - uv'}{v^2}$
* **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$

#### 5. Checklist
- [x] Limit laws and epsilon-delta proofs
- [x] L'Hopital's Rule for indeterminate forms $0/0$ and $\\infty/\\infty$
- [ ] Practice optimization word problems (Max/Min areas)`,
        status: "completed",
        folder: "Exam Prep",
        savedAt: new Date().toISOString()
      },
      {
        id: "demo-3",
        title: "Gene Expression: Transcription & Translation",
        description: "Visual simulator detailing the pathways cells use to read chromatin DNA base pairs and translate them into functional proteins.",
        url: "https://phet.colorado.edu/sims/html/gene-expression-essentials/latest/gene-expression-essentials_all.html",
        provider: "PhET Interactive Simulations",
        subject: "Biology",
        subtopic: "Genetics",
        resourceType: "simulation",
        difficulty: "AP/IB Level",
        gradeLevel: "Grade 12",
        notes: `### 🧬 Molecular Genetics: Transcription and Translation Flow

#### 1. The Central Dogma
$$\\text{DNA} \\xrightarrow{\\text{Transcription (Nucleus)}} \\text{mRNA} \\xrightarrow{\\text{Translation (Ribosome)}} \\text{Polypeptide Chain (Protein)}$$

#### 2. Nucleic Acid Comparisons
| Feature | DNA (Deoxyribonucleic Acid) | mRNA (Messenger RNA) | tRNA (Transfer RNA) |
| :--- | :--- | :--- | :--- |
| **Sugar Type** | Deoxyribose | Ribose | Ribose |
| **Bases** | Adenine, Thymine, Cytosine, Guanine | Adenine, Uracil, Cytosine, Guanine | Adenine, Uracil, Cytosine, Guanine |
| **Structure** | Double-stranded helix (stable) | Single-stranded linear (transient) | Cloverleaf shape (amino-acyl carrier) |
| **Location** | Confined to Nucleus | Transports from nucleus to cytosol | Cytosol / Ribosome |

#### 3. Codon Translation Simulator
This JavaScript engine parses an mRNA transcript sequence into its primary amino-acid chain structure:

\`\`\`javascript
function translate_mRNA(mrna) {
  const codonMap = {
    'AUG': 'Met (Start)', 'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
    'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser', 'UAU': 'Tyr', 
    'UAC': 'Tyr', 'UGU': 'Cys', 'UGC': 'Cys', 'UGG': 'Trp', 'CUU': 'Leu',
    'CUA': 'Leu', 'CUG': 'Leu', 'CCU': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro',
    'CCG': 'Pro', 'CAA': 'Gln', 'CAG': 'Gln', 'AAU': 'Asn', 'AAC': 'Asn',
    'AAA': 'Lys', 'AAG': 'Lys', 'GAU': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu',
    'GAG': 'Glu', 'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
    'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP'
  };
  
  let protein = [];
  for (let i = 0; i < mrna.length; i += 3) {
    let codon = mrna.substring(i, i + 3).toUpperCase();
    if (codonMap[codon] === 'STOP') break;
    if (codonMap[codon]) {
      protein.push(codonMap[codon]);
    }
  }
  return protein.join('-');
}

const mrnaChain = "AUGUUUCUCUAAGGG";
console.log("mRNA Seq:", mrnaChain);
console.log("Protein Chain:", translate_mRNA(mrnaChain)); // "Met (Start)-Phe-Leu"
\`\`\`

#### 4. Study Milestones
- [x] Transcription initiation and promoter Tata box bindings
- [x] Post-transcriptional modifications (5' cap, Poly-A tail, Intron splicing)
- [ ] Translation elongation tRNA aminoacyl tRNA synthetase mechanisms`,
        status: "completed",
        folder: "Term Projects",
        savedAt: new Date().toISOString()
      },
      {
        id: "demo-4",
        title: "Organic Functional Groups Roadmap",
        description: "Visual guidelines mapping aldehydes, ketones, carboxylic acids, and esters nomenclature protocols.",
        url: "https://www.youtube.com/embed/q4s_Vb7iX9c",
        provider: "The Organic Chemistry Tutor",
        subject: "Chemistry",
        subtopic: "Organic Chemistry",
        resourceType: "video",
        difficulty: "Intermediate",
        gradeLevel: "Grade 11",
        notes: `### 🧪 Organic Chemistry: Reaction Pathways and Mechanisms

#### 1. Nucleophilic Substitution Reactions ($S_N1$ vs $S_N2$)
$$\\text{Rate}_{S_N2} = k[\\text{substrate}][\\text{nucleophile}] \\quad \\text{vs} \\quad \\text{Rate}_{S_N1} = k[\\text{substrate}]$$

#### 2. Mechanisms Comparison
| Factor | $S_N1$ Mechanism (Two-Step) | $S_N2$ Mechanism (One-Step Concerted) |
| :--- | :--- | :--- |
| **Kinetics** | First-Order (Unimolecular) | Second-Order (Bimolecular) |
| **Intermediate** | Carbocation (rearrangements possible) | None (transition state only) |
| **Stereochemistry** | Racemization (d + l mixture) | Walden Inversion (backside attack) |
| **Substrate Favorability** | Tertiary ($3^\\circ$) > Secondary > Primary | Primary ($1^\\circ$) > Secondary > Tertiary |
| **Nucleophile Strength** | Weak (e.g., $H_2O, ROH$) | Strong (e.g., $OH^-, CN^-$) |

#### 3. Functional Group Validation Utility
A simple Python parser mapping suffixes to groups:

\`\`\`python
def classify_functional_group(molecule_name):
    lower_name = molecule_name.lower()
    
    classification = {
        "ol": "Alcohol (-OH group)",
        "al": "Aldehyde (-CHO group)",
        "one": "Ketone (C=O carbonyl group)",
        "oic acid": "Carboxylic Acid (-COOH group)",
        "oate": "Ester (-COOR group)",
        "amine": "Amine (-NH2 basic group)"
    }
    
    for suffix, description in classification.items():
        if lower_name.endswith(suffix):
            return f"Molecule matches functional class: {description}"
            
    return "Unknown functional group or alkane/alkene backbone."

# Test classifications
print(classify_functional_group("Ethanol"))    # Alcohol
print(classify_functional_group("Propanone"))   # Ketone
print(classify_functional_group("Ethanoic acid")) # Carboxylic Acid
\`\`\`

#### 4. Exam Prep Checklist
- [x] Resonance forms and inductive effects on carbocation stability
- [ ] E1 vs E2 elimination reactions pathways
- [ ] Synthesis maps: Converting alcohols into carboxylic acids via oxidants ($CrO_3$)`,
        status: "in-progress",
        folder: "General",
        savedAt: new Date().toISOString()
      },
      {
        id: "demo-5",
        title: "CrashCourse Macroeconomics: Fiscal Policy",
        description: "Narrative discussing government spending, tax adjustments, multipliers, and budget deficits.",
        url: "https://www.youtube.com/embed/videoseries?list=PL8dPuuaLjXtO2NVJKZh5mWyApLYeSPQED",
        provider: "CrashCourse",
        subject: "Humanities",
        subtopic: "Economics",
        resourceType: "video",
        difficulty: "Introductory",
        gradeLevel: "Grade 11",
        notes: `### 📊 Keynesian Macroeconomics: Fiscal Multiplier Mechanics

#### 1. Mathematical Equations
The simple fiscal multiplier ($M$) measures the total increase in aggregate output resulting from an autonomous increase in government spending:
$$M = \\frac{\\Delta Y}{\\Delta G} = \\frac{1}{1 - MPC}$$
Where $MPC$ is the Marginal Propensity to Consume, representing the fraction of an extra dollar of income that is spent on consumption ($0 < MPC < 1$).
The tax multiplier is defined as:
$$M_{tax} = \\frac{-MPC}{1 - MPC}$$

#### 2. Fiscal Policy Action Grid
| Policy Tool | Expansionary Fiscal Policy (Recessions) | Contractionary Fiscal Policy (Inflation) |
| :--- | :--- | :--- |
| **Government Spending ($G$)** | Increase ($G \\uparrow$) | Decrease ($G \\downarrow$) |
| **Taxes ($T$)** | Decrease ($T \\downarrow$) | Increase ($T \\uparrow$) |
| **Target Demand Shift** | Shift Aggregate Demand right ($AD \\to$) | Shift Aggregate Demand left ($\\leftarrow AD$) |
| **Budget Impact** | Leads to budget deficit (G > T) | Leads to budget surplus (T > G) |

#### 3. GDP Simulation Code
A Python simulator analyzing policy spending multipliers:

\`\`\`python
def simulate_fiscal_impact(mpc, change_g, change_t):
    # Calculate multipliers
    spending_multiplier = 1 / (1 - mpc)
    tax_multiplier = -mpc / (1 - mpc)
    
    # Calculate GDP shifts
    gdp_change_from_g = change_g * spending_multiplier
    gdp_change_from_t = change_t * tax_multiplier
    total_gdp_change = gdp_change_from_g + gdp_change_from_t
    
    print(f"Multiplier (MPC={mpc}): {spending_multiplier:.2f}x")
    print(f"Tax Multiplier: {tax_multiplier:.2f}x")
    print(f"Aggregate GDP Shift: \${total_gdp_change:,.2f}")
    return total_gdp_change

# Example: Increase spending by $50B, decrease taxes by $20B at MPC of 0.8
simulate_fiscal_impact(mpc=0.8, change_g=50, change_t=-20)
\`\`\`

#### 4. Macroeconomics Milestones
- [x] Marginal Propensity to Save (MPS) definition: $MPC + MPS = 1$
- [x] Automatic stabilizers vs discretionary policies
- [ ] Crowding-out effect on private investment rates`,
        status: "in-progress",
        folder: "General",
        savedAt: new Date().toISOString()
      }
    ];
    saveToLocalStorage(demoItems);
  };

  const handleCompleteAll = () => {
    const completedItems = curatedResources.map(item => ({
      ...item,
      folder: 'General',
      notes: '### Fast-Track Summary\nResource automatically unlocked and completed via system cheat overrides.',
      status: 'completed',
      savedAt: new Date().toISOString()
    }));
    saveToLocalStorage(completedItems);
  };

  const handleToggleMatrix = () => {
    const nextTheme = theme === 'matrix' ? 'dark' : 'matrix';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('studyspace_theme', nextTheme);
  };

  // Add a resource to the binder
  const handleSaveItem = (resource) => {
    if (savedItems.some(item => item.id === resource.id)) return;

    const newItem = {
      ...resource,
      folder: 'General',
      notes: '',
      status: 'in-progress',
      savedAt: new Date().toISOString()
    };

    const nextItems = [newItem, ...savedItems];
    saveToLocalStorage(nextItems);
  };

  // Remove a resource from the binder
  const handleRemoveItem = (itemId) => {
    const nextItems = savedItems.filter(item => item.id !== itemId);
    saveToLocalStorage(nextItems);
    
    // Close workbench if the closed resource was deleted
    if (activeWorkbenchResource && activeWorkbenchResource.id === itemId) {
      setActiveWorkbenchResource(null);
    }
  };

  // Update study progress status (e.g. In Progress, Completed)
  const handleUpdateStatus = (itemId, newStatus) => {
    const nextItems = savedItems.map(item => {
      if (item.id === itemId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    saveToLocalStorage(nextItems);
  };

  // Re-assign resource to a folder category
  const handleMoveItemFolder = (itemId, folderName) => {
    const nextItems = savedItems.map(item => {
      if (item.id === itemId) {
        return { ...item, folder: folderName };
      }
      return item;
    });
    saveToLocalStorage(nextItems);
  };

  // Save notes taken inside the Study Workbench
  const handleSaveNotes = (itemId, notesContent, statusValue, noteType = 'markdown') => {
    // If the resource is NOT already saved in the binder, save it first
    const isAlreadySaved = savedItems.some(item => item.id === itemId);
    
    let nextItems;
    if (!isAlreadySaved && activeWorkbenchResource) {
      const newItem = {
        ...activeWorkbenchResource,
        folder: 'General',
        notes: notesContent,
        status: statusValue,
        noteType: noteType,
        savedAt: new Date().toISOString()
      };
      nextItems = [newItem, ...savedItems];
    } else {
      nextItems = savedItems.map(item => {
        if (item.id === itemId) {
          return { 
            ...item, 
            notes: notesContent,
            status: statusValue,
            noteType: noteType,
            savedAt: new Date().toISOString()
          };
        }
        return item;
      });
    }
    
    saveToLocalStorage(nextItems);
  };

  // Handle transition triggering when a user opens a resource card
  const handleOpenResource = (resource) => {
    if (!resource) {
      setActiveWorkbenchResource(null);
      return;
    }

    const title = (resource.title || '').toLowerCase();
    const desc = (resource.description || '').toLowerCase();
    const subject = (resource.subject || '').toLowerCase();

    let type = 'quantum'; // Default generic fallback

    if (
      title.includes('black hole') || title.includes('blackhole') || title.includes('singularity') || title.includes('event horizon') ||
      desc.includes('black hole') || desc.includes('blackhole') || desc.includes('singularity') || desc.includes('event horizon')
    ) {
      type = 'blackhole';
    } else if (
      title.includes('wormhole') || title.includes('warp') || title.includes('quantum') || title.includes('entanglement') || title.includes('teleportation') || title.includes('spacetime') || title.includes('space-time') || title.includes('interstellar') || title.includes('schwarzschild') || title.includes('einstein-rosen') ||
      desc.includes('wormhole') || desc.includes('warp') || desc.includes('quantum') || desc.includes('entanglement') || desc.includes('teleportation')
    ) {
      type = 'warp';
    } else if (
      title.includes('supernova') || title.includes('star') || title.includes('stellar') || title.includes('fusion') || title.includes('big bang') || title.includes('nebula') || title.includes('galaxy') || title.includes('cosmic') ||
      desc.includes('supernova') || desc.includes('star') || desc.includes('stellar') || desc.includes('fusion')
    ) {
      type = 'supernova';
    } else if (
      title.includes('relativity') || title.includes('time dilation') || title.includes('redshift') || title.includes('lorentz') || title.includes('minkowski') || title.includes('speed of light') ||
      desc.includes('relativity') || desc.includes('time dilation') || desc.includes('redshift') ||
      (subject.includes('physics') && (title.includes('time') || title.includes('gravity')))
    ) {
      type = 'redshift';
    }

    setTransitionClass(`transition-${type}`);
    setActiveTransition({ type, resource });
  };

  const handleTransitionComplete = () => {
    if (activeTransition) {
      setActiveWorkbenchResource(activeTransition.resource);
    }
    setActiveTransition(null);
    setTransitionClass('');
  };

  // Page Routing Switch
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            setActivePage={setActivePage} 
            setFilters={setFilters} 
            setQuery={setQuery}
            savedItems={savedItems}
          />
        );
      case 'navigator':
        return (
          <SubjectNavigator 
            setActivePage={setActivePage} 
            setFilters={setFilters} 
            setQuery={setQuery}
          />
        );
      case 'search':
        return (
          <SearchHub 
            query={query} 
            setQuery={setQuery} 
            filters={filters} 
            setFilters={setFilters} 
            onSaveItem={handleSaveItem}
            onStudyItem={handleOpenResource}
            savedItems={savedItems}
          />
        );
      case 'collections':
        return (
          <Collections 
            savedItems={savedItems} 
            onUpdateStatus={handleUpdateStatus} 
            onRemoveItem={handleRemoveItem}
            onStudyItem={handleOpenResource}
            onMoveItemFolder={handleMoveItemFolder}
          />
        );
      default:
        return <Dashboard setActivePage={setActivePage} savedItems={savedItems} />;
    }
  };

  if (!currentUser) {
    return <AuthScreen onSignIn={handleSignIn} />;
  }

  return (
    <div className="app-container" style={{ overflow: 'hidden', minHeight: '100vh', width: '100vw' }}>
      {/* Visual content wrapper that gets transformed/warped */}
      <div className={`transition-content-wrapper ${transitionClass}`}>
        {/* Side Navigation Bar */}
        <Navbar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          theme={theme} 
          toggleTheme={toggleTheme} 
          currentUser={currentUser}
          onSignOut={handleSignOut}
        />

        {/* Main Content Area */}
        <main className="app-main">
          {renderActivePage()}
        </main>
      </div>

      {/* Split-screen study workbench overlay */}
      {activeWorkbenchResource && (
        <Workbench 
          resource={activeWorkbenchResource} 
          onClose={() => setActiveWorkbenchResource(null)}
          onSaveNotes={handleSaveNotes}
          savedItems={savedItems}
        />
      )}

      {/* Relativistic Canvas Transition Overlay */}
      {activeTransition && (
        <RelativisticTransition 
          type={activeTransition.type} 
          onComplete={handleTransitionComplete}
        />
      )}

      {/* System Cheat Console Overlay */}
      {showCheatTab && (
        <CheatConsole
          onClose={() => setShowCheatTab(false)}
          onResetProgress={handleResetProgress}
          onSeedDemo={handleSeedDemo}
          onCompleteAll={handleCompleteAll}
          onToggleMatrix={handleToggleMatrix}
        />
      )}
    </div>
  );
}
