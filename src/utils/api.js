import { curatedResources } from '../data/curatedResources';

// 1. Search Local Curated Index
export const searchCurated = (query, filters = {}) => {
  let results = [...curatedResources];

  // Subject filter
  if (filters.subject && filters.subject !== "All Subjects") {
    results = results.filter(item => item.subject.toLowerCase() === filters.subject.toLowerCase());
  }

  // Resource Type filter
  if (filters.resourceType && filters.resourceType !== "All Types") {
    results = results.filter(item => item.resourceType.toLowerCase() === filters.resourceType.toLowerCase());
  }

  // Grade Level filter
  if (filters.gradeLevel && filters.gradeLevel !== "All Grades") {
    results = results.filter(item => item.gradeLevel.toLowerCase() === filters.gradeLevel.toLowerCase());
  }

  // Difficulty filter
  if (filters.difficulty && filters.difficulty !== "All Difficulties") {
    results = results.filter(item => item.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
  }

  // Free text query filter
  if (query && query.trim() !== "") {
    const term = query.toLowerCase().trim();
    results = results.filter(item => {
      return (
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.subtopic.toLowerCase().includes(term) ||
        item.tags.some(tag => tag.toLowerCase().includes(term))
      );
    });
  }

  return results;
};

// Helper: infer subject based on query keywords or title keywords
const inferSubject = (title, summary) => {
  const text = (title + " " + summary).toLowerCase();
  if (text.includes("math") || text.includes("calculus") || text.includes("matrix") || text.includes("theorem") || text.includes("equation") || text.includes("algebra")) {
    return "Mathematics";
  }
  if (text.includes("physics") || text.includes("quantum") || text.includes("motion") || text.includes("gravity") || text.includes("thermodynamics") || text.includes("wave") || text.includes("force")) {
    return "Physics";
  }
  if (text.includes("chemistry") || text.includes("organic") || text.includes("periodic") || text.includes("molecule") || text.includes("atom") || text.includes("bonding")) {
    return "Chemistry";
  }
  if (text.includes("biology") || text.includes("gene") || text.includes("cell") || text.includes("dna") || text.includes("evolution") || text.includes("protein") || text.includes("cancer")) {
    return "Biology";
  }
  if (text.includes("computer") || text.includes("code") || text.includes("algorithm") || text.includes("programming") || text.includes("software")) {
    return "Computer Science";
  }
  if (text.includes("history") || text.includes("empire") || text.includes("war") || text.includes("revolution") || text.includes("economic") || text.includes("trade")) {
    return "Humanities";
  }
  return "General Science";
};

// 2. Search Wikipedia API
export const searchWikipedia = async (query) => {
  if (!query || query.trim() === "") return [];
  
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=25`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Wikipedia request failed");
    
    const data = await response.json();
    if (!data.query || !data.query.search) return [];

    return data.query.search.map((item) => {
      // Create clean descriptions from snippets
      const snippet = item.snippet.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML tags
      const subject = inferSubject(item.title, snippet);
      
      return {
        id: `wiki-${item.pageid}`,
        title: item.title,
        description: snippet + "...",
        url: `https://en.wikipedia.org/?curid=${item.pageid}`,
        provider: "Wikipedia",
        subject: subject,
        subtopic: "Encyclopedia Concept",
        resourceType: "article",
        difficulty: "Introductory",
        gradeLevel: "Grade 11",
        tags: ["wiki", "encyclopedia", "concept", subject.toLowerCase()]
      };
    });
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return [];
  }
};

// 3. Search arXiv API (Academic STEM Papers)
export const searchArXiv = async (query) => {
  if (!query || query.trim() === "") return [];

  try {
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=25`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("arXiv request failed");
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const entries = xmlDoc.getElementsByTagName("entry");
    
    const results = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName("title")[0]?.textContent?.replace(/\n/g, " ").replace(/\s+/g, " ").trim() || "Untitled Research";
      const summary = entry.getElementsByTagName("summary")[0]?.textContent?.replace(/\n/g, " ").replace(/\s+/g, " ").trim() || "No summary available.";
      
      // Get the PDF link
      const links = entry.getElementsByTagName("link");
      let pdfUrl = "";
      for (let j = 0; j < links.length; j++) {
        const link = links[j];
        if (link.getAttribute("title") === "pdf" || link.getAttribute("type") === "application/pdf") {
          pdfUrl = link.getAttribute("href");
        }
      }
      
      // Fallback url
      if (!pdfUrl && links.length > 0) {
        pdfUrl = links[0].getAttribute("href");
      }

      // Format PDF url so it can be previewed/embedded or linked
      if (pdfUrl && pdfUrl.startsWith("http://")) {
        pdfUrl = pdfUrl.replace("http://", "https://");
      }

      const id = entry.getElementsByTagName("id")[0]?.textContent?.split("/abs/")?.pop() || `arxiv-${i}`;
      const subject = inferSubject(title, summary);

      results.push({
        id: `arxiv-${id}`,
        title: title,
        description: summary.substring(0, 240) + "...",
        url: pdfUrl,
        provider: "arXiv",
        subject: subject,
        subtopic: "Research Paper",
        resourceType: "paper",
        difficulty: "Advanced",
        gradeLevel: "Grade 12",
        tags: ["arxiv", "research", "stem", subject.toLowerCase()]
      });
    }
    
    return results;
  } catch (error) {
    console.error("arXiv search error:", error);
    return [];
  }
};

// 4. Search EuropePMC API (Biomedical & Life Sciences Literature)
export const searchEuropePMC = async (query) => {
  if (!query || query.trim() === "") return [];

  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&pageSize=25`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("EuropePMC request failed");
    
    const data = await response.json();
    if (!data.resultList || !data.resultList.result) return [];

    return data.resultList.result
      .filter(item => item.title && (item.abstractText || item.journalTitle))
      .map((item) => {
        const description = item.abstractText 
          ? (item.abstractText.substring(0, 240) + "...") 
          : `Published in ${item.journalTitle || 'Academic Journal'}. Authors: ${item.authorString || 'Unknown'}.`;
          
        return {
          id: `epmc-${item.id}`,
          title: item.title,
          description: description,
          url: item.doi ? `https://doi.org/${item.doi}` : `https://europepmc.org/article/MED/${item.id}`,
          provider: item.journalTitle || "EuropePMC",
          subject: "Biology",
          subtopic: "Biomedical Literature",
          resourceType: "paper",
          difficulty: "Advanced",
          gradeLevel: "Grade 12",
          tags: ["biology", "medicine", "europepmc", "journal"]
        };
      });
  } catch (error) {
    console.error("EuropePMC search error:", error);
    return [];
  }
};

// 5. Search OpenAlex API (Open Google Scholar Alternative)
export const searchOpenAlex = async (query) => {
  if (!query || query.trim() === "") return [];

  try {
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=25`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("OpenAlex request failed");
    const data = await response.json();
    if (!data.results) return [];

    return data.results.map((item) => {
      // Reconstruct abstract from abstract_inverted_index if present
      let abstract = "";
      if (item.abstract_inverted_index) {
        const words = [];
        Object.entries(item.abstract_inverted_index).forEach(([word, indices]) => {
          indices.forEach(idx => {
            words[idx] = word;
          });
        });
        abstract = words.filter(Boolean).join(" ");
      }

      const description = abstract 
        ? (abstract.substring(0, 240) + "...") 
        : `Published in ${item.primary_location?.source?.display_name || 'Academic Journal'}. Year: ${item.publication_year || 'N/A'}.`;

      const pdfUrl = item.best_oa_location?.pdf_url || item.primary_location?.landing_page_url || "";
      const subject = inferSubject(item.display_name || "", abstract || "");

      return {
        id: `openalex-${item.id.split('/').pop()}`,
        title: item.display_name || "Untitled Research",
        description: description,
        url: pdfUrl,
        provider: item.primary_location?.source?.display_name || "OpenAlex Scholar",
        subject: subject,
        subtopic: "Academic Paper",
        resourceType: "paper",
        difficulty: "Advanced",
        gradeLevel: "Grade 12",
        tags: ["openalex", "scholar", "academic", subject.toLowerCase()]
      };
    });
  } catch (error) {
    console.error("OpenAlex search error:", error);
    return [];
  }
};

// 6. Search Project Gutenberg (Classic Literature & Philosophy)
export const searchGutenberg = async (query) => {
  if (!query || query.trim() === "") return [];

  try {
    const url = `https://gutendex.com/books/?search=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Gutenberg request failed");
    const data = await response.json();
    if (!data.results) return [];

    return data.results.slice(0, 10).map((book) => {
      const readUrl = book.formats["text/html"] || book.formats["text/plain; charset=us-ascii"] || book.formats["text/plain"] || "";
      const authorStr = book.authors?.map(a => a.name).join(", ") || "Unknown Author";
      
      return {
        id: `gutenberg-${book.id}`,
        title: book.title,
        description: `Classic literature. Written by ${authorStr}. Subjects: ${book.subjects?.slice(0, 3).join(", ") || "General Literature"}.`,
        url: readUrl,
        provider: "Project Gutenberg",
        subject: "Humanities",
        subtopic: "Classic Literature",
        resourceType: "article",
        difficulty: "Intermediate",
        gradeLevel: "Grade 11",
        tags: ["literature", "gutenberg", "book", "history", "humanities"]
      };
    });
  } catch (error) {
    console.error("Gutenberg search error:", error);
    return [];
  }
};

// 7. Aggregate Search results from all sources
export const searchAllSources = async (query, filters = {}) => {
  // Always query local curated database (handles keyword matching + filters)
  const curated = searchCurated(query, filters);

  // If we have specific filters like "video" or "simulation", we don't need external papers/articles
  const fetchExternal = !filters.resourceType || 
                        filters.resourceType === "All Types" || 
                        filters.resourceType === "article" || 
                        filters.resourceType === "paper";

  let externalResults = [];

  if (query && query.trim() !== "" && fetchExternal) {
    // Fire external APIs in parallel
    const [wikiRes, arxivRes, epmcRes, alexRes, gutenRes] = await Promise.all([
      searchWikipedia(query),
      searchArXiv(query),
      searchEuropePMC(query),
      searchOpenAlex(query),
      searchGutenberg(query)
    ]);

    // Combine them
    externalResults = [...wikiRes, ...arxivRes, ...epmcRes, ...alexRes, ...gutenRes];

    // Apply filters to external results
    if (filters.subject && filters.subject !== "All Subjects") {
      externalResults = externalResults.filter(item => item.subject.toLowerCase() === filters.subject.toLowerCase());
    }
    if (filters.resourceType && filters.resourceType !== "All Types") {
      externalResults = externalResults.filter(item => item.resourceType.toLowerCase() === filters.resourceType.toLowerCase());
    }
  }

  // Interleave local curated and external results
  const combined = [];
  const maxLength = Math.max(curated.length, externalResults.length);
  
  for (let i = 0; i < maxLength; i++) {
    if (i < curated.length) combined.push(curated[i]);
    if (i < externalResults.length) combined.push(externalResults[i]);
  }

  return combined;
};
