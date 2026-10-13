const { getAIResponse } = require("./ai.service");

// Comprehensive role requirements for accurate ATS scoring and shortlisting
const ROLE_DEFINITIONS = {
  "Software Engineer": {
    essential: ["JavaScript", "Python", "Java", "Git", "REST API", "SQL", "Data Structures", "Algorithms", "Debugging"],
    advanced: ["Docker", "Kubernetes", "AWS", "CI/CD", "TypeScript", "Microservices", "System Design", "Unit Testing", "Redis", "GraphQL"],
    verbs: ["Architected", "Engineered", "Optimized", "Scaled", "Developed", "Deployed", "Reduced", "Automated"],
    idealSummary: "Results-driven Software Engineer with strong foundations in distributed systems, modern API design, and clean architecture.",
  },
  "Frontend Developer": {
    essential: ["JavaScript", "HTML5", "CSS3", "React", "Responsive Design", "Git", "REST API", "State Management", "DOM"],
    advanced: ["TypeScript", "Next.js", "Tailwind CSS", "Redux", "Web Performance", "Accessibility", "WCAG", "Vite", "Jest", "GraphQL"],
    verbs: ["Architected", "Designed", "Engineered", "Optimized", "Implemented", "Enhanced", "Created", "Transformed"],
    idealSummary: "Frontend Developer specializing in high-performance web applications, responsive user interfaces, and accessible design systems.",
  },
  "Backend Developer": {
    essential: ["Node.js", "Python", "Java", "SQL", "REST API", "Express", "Database Design", "Git", "Authentication", "API Security"],
    advanced: ["PostgreSQL", "MongoDB", "Docker", "Microservices", "Redis", "Kafka", "Kubernetes", "AWS", "GraphQL", "CI/CD", "System Architecture"],
    verbs: ["Engineered", "Architected", "Built", "Optimized", "Scaled", "Integrated", "Secured", "Automated"],
    idealSummary: "Backend Engineer with expertise in scalable microservices, relational and NoSQL databases, and secure RESTful/GraphQL APIs.",
  },
  "Full Stack Developer": {
    essential: ["JavaScript", "React", "Node.js", "Express", "SQL", "MongoDB", "REST API", "HTML5", "CSS3", "Git"],
    advanced: ["TypeScript", "Next.js", "Docker", "AWS", "CI/CD", "Tailwind CSS", "PostgreSQL", "Redux", "Unit Testing", "Microservices"],
    verbs: ["Delivered", "Architected", "Engineered", "Deployed", "Built", "Optimized", "Designed", "Spearheaded"],
    idealSummary: "Full Stack Developer proficient in building end-to-end web platforms with React, Node.js, modern cloud deployment, and robust databases.",
  },
  "Data Analyst": {
    essential: ["SQL", "Excel", "Python", "Data Visualization", "Tableau", "Power BI", "Data Cleaning", "Reporting", "Statistics"],
    advanced: ["Pandas", "NumPy", "ETL", "A/B Testing", "Business Intelligence", "Google Analytics", "Data Warehousing", "Snowflake", "BigQuery"],
    verbs: ["Analyzed", "Synthesized", "Modeled", "Visualized", "Identified", "Streamlined", "Forecasted", "Reported"],
    idealSummary: "Data Analyst skilled in translating complex transactional and behavioral data into actionable business intelligence using SQL and Python.",
  },
  "Data Scientist": {
    essential: ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn", "Data Preprocessing", "Statistics", "Model Evaluation"],
    advanced: ["Deep Learning", "PyTorch", "TensorFlow", "NLP", "Feature Engineering", "Data Modeling", "MLOps", "Computer Vision", "Docker", "AWS"],
    verbs: ["Trained", "Evaluated", "Engineered", "Deployed", "Developed", "Modeled", "Predicted", "Optimized"],
    idealSummary: "Data Scientist with a background in machine learning models, statistical inference, feature engineering, and predictive analytics.",
  },
  "Product Manager": {
    essential: ["Product Strategy", "Roadmap", "Agile", "Scrum", "User Stories", "Stakeholder Management", "Jira", "Market Research", "Feature Prioritization"],
    advanced: ["A/B Testing", "User Analytics", "Product Discovery", "KPIs", "GTM Strategy", "Wireframing", "Customer Interviews", "Data-Driven Decision Making"],
    verbs: ["Spearheaded", "Prioritized", "Launched", "Defined", "Collaborated", "Drove", "Maximized", "Grew"],
    idealSummary: "Product Manager with track record of taking products from 0 to 1, defining data-driven product roadmaps, and aligning cross-functional teams.",
  },
  "UX Designer": {
    essential: ["Figma", "Wireframing", "Prototyping", "User Research", "Usability Testing", "UI Design", "Information Architecture", "User Personas"],
    advanced: ["Design Systems", "Interaction Design", "Accessibility", "WCAG", "Design Thinking", "User Flows", "Journey Mapping", "Micro-interactions"],
    verbs: ["Designed", "Prototyped", "Researched", "Tested", "Iterated", "Crafted", "Simplified", "Streamlined"],
    idealSummary: "User Experience Designer dedicated to user-centered design, iterative prototyping in Figma, and creating accessible multi-device systems.",
  },
  "DevOps Engineer": {
    essential: ["Linux", "Docker", "CI/CD", "Git", "Bash", "AWS", "Networking", "Kubernetes", "Automation", "Monitoring"],
    advanced: ["Terraform", "Ansible", "Infrastructure as Code", "Prometheus", "Grafana", "Helm", "Security", "CloudFormation", "GCP", "Azure"],
    verbs: ["Automated", "Provisioned", "Containerized", "Monitored", "Orchestrated", "Hardened", "Streamlined", "Deployed"],
    idealSummary: "DevOps Engineer specialized in automating CI/CD pipelines, container orchestration with Kubernetes, and managing cloud infrastructure as code.",
  },
};

// Fallback for custom or unspecified roles
const DEFAULT_ROLE_DEF = ROLE_DEFINITIONS["Software Engineer"];

const KEYWORD_SYNONYMS = {
  "React": ["react", "react.js", "reactjs"],
  "Node.js": ["node.js", "nodejs", "node js", "node"],
  "REST API": ["rest api", "rest apis", "restful", "restful api", "restful apis", "rest endpoints"],
  "JavaScript": ["javascript", "js", "ecmascript"],
  "TypeScript": ["typescript", "ts"],
  "Python": ["python", "python3", "py"],
  "Java": ["java", "core java", "j2ee"],
  "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite", "relational db", "rdbms"],
  "MongoDB": ["mongodb", "mongo db", "mongo", "nosql"],
  "Git": ["git", "github", "gitlab", "version control"],
  "Docker": ["docker", "container", "containers", "containerization"],
  "Kubernetes": ["kubernetes", "k8s"],
  "AWS": ["aws", "amazon web services", "cloud infrastructure"],
  "CI/CD": ["ci/cd", "cicd", "continuous integration", "continuous deployment", "jenkins", "github actions"],
  "Data Structures": ["data structures", "dsa", "algorithms", "problem solving", "structures"],
  "Algorithms": ["algorithms", "dsa", "algorithmic", "problem solving"],
  "HTML5": ["html", "html5"],
  "CSS3": ["css", "css3", "tailwind", "bootstrap", "sass"],
  "Express": ["express", "express.js", "expressjs"],
  "Next.js": ["next.js", "nextjs", "next"],
  "Microservices": ["microservices", "microservice architecture", "distributed systems"],
  "System Design": ["system design", "software architecture", "high level design"],
  "Unit Testing": ["unit testing", "jest", "mocha", "pytest", "junit", "testing"],
  "Redis": ["redis", "in-memory cache", "caching"],
  "GraphQL": ["graphql", "apollo"],
  "Debugging": ["debugging", "troubleshooting", "debug", "root cause analysis"],
  "Machine Learning": ["machine learning", "ml", "deep learning", "ai", "artificial intelligence"],
  "Linux": ["linux", "ubuntu", "unix", "bash"],
};

const ADDITIONAL_TECH_CATALOG = [
  "C", "C++", "C#", ".NET", "Go", "Golang", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "Flutter",
  "Angular", "Vue", "Svelte", "Next.js", "Django", "Flask", "FastAPI", "Spring", "Spring Boot",
  "MySQL", "PostgreSQL", "SQLite", "MongoDB", "Redis", "Firebase", "Supabase", "Cassandra",
  "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Git", "GitHub", "Jenkins",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Computer Vision", "NLP",
  "Data Structures", "Algorithms", "Networking", "TCP/IP", "Web Development", "OOP"
];

const checkSkillMatch = (text, skill) => {
  const synonyms = KEYWORD_SYNONYMS[skill] || [skill.toLowerCase()];
  return synonyms.some((syn) => {
    const escaped = syn.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9])${escaped}(?:$|[^a-zA-Z0-9])`, "i");
    return regex.test(text);
  });
};

// Calculate an accurate, mathematically grounded ATS score
const calculateAccurateATS = (resumeText, jobRole = "Software Engineer", jobDescription = "") => {
  const text = (resumeText || "").trim();
  const lowerText = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const roleDef = ROLE_DEFINITIONS[jobRole] || DEFAULT_ROLE_DEF;

  // 1. Keyword analysis using synonym mapping
  const foundKeywords = [];
  const missingKeywords = [];

  const allSkills = [...roleDef.essential, ...roleDef.advanced];
  for (const skill of allSkills) {
    if (checkSkillMatch(text, skill)) {
      foundKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  }

  // Also discover any additional valuable tech skills candidate possesses
  const extraCandidateSkills = [];
  for (const skill of ADDITIONAL_TECH_CATALOG) {
    if (!foundKeywords.includes(skill) && checkSkillMatch(text, skill)) {
      extraCandidateSkills.push(skill);
    }
  }

  const essentialFound = roleDef.essential.filter((s) => foundKeywords.includes(s)).length;
  const advancedFound = roleDef.advanced.filter((s) => foundKeywords.includes(s)).length;

  // Keyword Score gives primary weight to role essentials + bonus for extra technical depth
  const baseKeywordRatio = (essentialFound / roleDef.essential.length) * 70 + (advancedFound / roleDef.advanced.length) * 30;
  const extraBonus = Math.min(15, extraCandidateSkills.length * 3);
  const keywordScore = Math.min(100, Math.round(baseKeywordRatio + extraBonus));

  // 2. Action Verbs & Metric Quantification Analysis
  const foundVerbs = [];
  for (const verb of roleDef.verbs) {
    const regex = new RegExp(`\\b${verb}\\b`, "i");
    if (regex.test(text)) {
      foundVerbs.push(verb);
    }
  }

  // Detect quantified achievements (percentages, numbers, scale, user metrics)
  const metricMatches = text.match(/\b\d+%\b|\$\d+[\d,]*[kKmMbB]?|\b\d+\+?\s*(?:users|clients|projects|team members|seconds|ms|queries|records|downloads|revenue|cgpa|percentage)\b/gi) || [];
  const quantifiedMetricsCount = metricMatches.length;

  // Quantification score (30 - 100)
  const quantificationScore = Math.min(
    100,
    Math.round(Math.min(quantifiedMetricsCount * 20, 50) + Math.min(foundVerbs.length * 10, 30) + 35)
  );

  // 3. Section Completeness Analysis
  const sectionsChecked = [
    { name: "Contact Information", test: /@.*\.(com|edu|org|net|io|in)/i.test(text) && /\d{3}/.test(text) },
    { name: "Professional Summary / Profile", test: /summary|profile|about|objective|engineering|developer|student/i.test(text) },
    { name: "Work Experience / Projects", test: /experience|work history|employment|projects|project|hackathon/i.test(text) },
    { name: "Technical Skills", test: /skills|competencies|technologies|tools|languages|programming/i.test(text) },
    { name: "Education", test: /education|degree|university|college|bachelor|master|b\.?tech|diploma|cgpa|gpa/i.test(text) },
  ];
  const passedSections = sectionsChecked.filter((s) => s.test).length;
  const sectionScore = Math.round((passedSections / sectionsChecked.length) * 100);

  // 4. Formatting & Readability Score (0-100)
  let formattingScore = 85;
  const formattingIssues = [];

  if (wordCount < 100) {
    formattingScore -= 35;
    formattingIssues.push("Resume is very brief (< 100 words). Add more details to projects and skills.");
  } else if (wordCount > 1200) {
    formattingScore -= 10;
    formattingIssues.push("Resume exceeds recommended length for single-page ATS parsing (> 1200 words).");
  }

  if (quantifiedMetricsCount === 0) {
    formattingScore -= 10;
    formattingIssues.push("Include quantified metrics (% improvement, scale, numbers) to boost impact.");
  }

  formattingScore = Math.max(50, Math.min(100, formattingScore));

  // 5. Job Description Match (if JD provided)
  let jdScore = null;
  let jdPresent = [];
  let jdMissing = [];

  if (jobDescription && jobDescription.trim().length > 20) {
    const stopWords = new Set([
      "about", "company", "requirements", "responsibilities", "candidate", "experience",
      "looking", "individual", "role", "work", "team", "join", "skills", "plus", "must",
      "have", "with", "that", "this", "from", "they", "will", "your", "years", "ability",
      "knowledge", "understanding", "good", "strong", "using", "such", "like", "preferred"
    ]);

    const jdTokens = jobDescription
      .toLowerCase()
      .replace(/[^a-z0-9#+.]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Identify candidate target terms from JD
    const uniqueJdTerms = Array.from(new Set(jdTokens)).filter((w) => {
      return (
        ADDITIONAL_TECH_CATALOG.some(t => t.toLowerCase() === w) ||
        allSkills.some(s => s.toLowerCase().includes(w)) ||
        w.length >= 4
      );
    });

    const targetKeywords = uniqueJdTerms.slice(0, 15);

    for (const term of targetKeywords) {
      if (lowerText.includes(term) || checkSkillMatch(text, term)) {
        jdPresent.push(term);
      } else {
        jdMissing.push(term);
      }
    }

    if (targetKeywords.length > 0) {
      jdScore = Math.min(100, Math.round((jdPresent.length / targetKeywords.length) * 100));
    }
  }

  // Final Weighted ATS Score calculation
  let overallScore = 0;
  if (jdScore !== null) {
    // 35% Keyword Match, 25% JD Match, 20% Quantification, 10% Sections, 10% Formatting
    overallScore = Math.round(
      keywordScore * 0.35 +
      jdScore * 0.25 +
      quantificationScore * 0.20 +
      sectionScore * 0.10 +
      formattingScore * 0.10
    );
  } else {
    // 40% Keyword Match, 25% Quantification, 20% Sections, 15% Formatting
    overallScore = Math.round(
      keywordScore * 0.40 +
      quantificationScore * 0.25 +
      sectionScore * 0.20 +
      formattingScore * 0.15
    );
  }

  overallScore = Math.max(35, Math.min(97, overallScore));

  // Shortlisting Probability & Recruiter Verdict
  let shortlistProbability = "Needs Improvement (42%)";
  let shortlistTier = "low";
  let recruiterVerdict = `Resume requires targeted keyword optimization and quantifiable achievements to pass competitive applicant tracking filters for ${jobRole}.`;

  if (overallScore >= 80) {
    shortlistProbability = `High (${overallScore}%)`;
    shortlistTier = "high";
    recruiterVerdict = `Strong match for ${jobRole}. Resume demonstrates relevant technical breadth, structured section formatting, and role alignment likely to pass top-tier ATS screening.`;
  } else if (overallScore >= 60) {
    shortlistProbability = `Medium (${overallScore}%)`;
    shortlistTier = "medium";
    recruiterVerdict = `Good candidate profile with clear potential, but lacks several key technical keywords and measurable KPIs expected for competitive ${jobRole} positions.`;
  }

  // Generate 1-Click Actionable Suggestions
  const suggestions = [];

  // Suggestion 1: Missing Essential Keywords
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 4);
    suggestions.push({
      id: 1,
      section: "Skills",
      type: "Add",
      priority: "High",
      before: null,
      after: `Add ${topMissing.join(", ")} to your Core Technical Skills section.`,
      action: {
        target: "skills",
        addKeywords: topMissing,
      },
    });
  }

  // Suggestion 2: Tailored Professional Summary
  const tailoredSummary = `Results-oriented ${jobRole} with hands-on experience developing ${foundKeywords.slice(0, 3).join(", ") || "software solutions"}. Proven ability to deliver scalable features, optimize performance, and collaborate with cross-functional engineering teams.`;
  suggestions.push({
    id: 2,
    section: "Summary",
    type: "Improve",
    priority: "High",
    before: text.length > 80 ? text.slice(0, 110) + "..." : "General candidate summary",
    after: tailoredSummary,
    action: {
      target: "summary",
      newSummary: tailoredSummary,
    },
  });

  // Suggestion 3: Quantified Impact in Experience
  const actionVerb = roleDef.verbs[0] || "Engineered";
  const experienceSuggestion = `${actionVerb} core features using ${foundKeywords[0] || "modern technologies"}, reducing latency by 32% and enhancing response throughput for 15,000+ active users.`;
  suggestions.push({
    id: 3,
    section: "Experience",
    type: "Improve",
    priority: "Medium",
    before: "Worked on various project features and bug fixes",
    after: experienceSuggestion,
    action: {
      target: "experience",
      bulletImprovement: experienceSuggestion,
    },
  });

  // Suggestion 4: Secondary technical tools if missing
  if (missingKeywords.length >= 4) {
    const secondaryMissing = missingKeywords.slice(3, 6);
    suggestions.push({
      id: 4,
      section: "Experience",
      type: "Add",
      priority: "Medium",
      before: null,
      after: `Highlight hands-on application of ${secondaryMissing.join(" and ")} in your project descriptions to demonstrate full-lifecycle capability.`,
      action: {
        target: "skills",
        addKeywords: secondaryMissing,
      },
    });
  }

  // Role Shortlisting Checklist
  const roleChecklist = [
    {
      label: `Core ${jobRole} Tech Stack`,
      status: essentialFound >= Math.ceil(roleDef.essential.length * 0.6) ? "passed" : "warning",
      detail: `${essentialFound} of ${roleDef.essential.length} core competencies detected (${foundKeywords.slice(0, 4).join(", ")})`,
    },
    {
      label: "Quantified Metrics & Business Impact",
      status: quantifiedMetricsCount >= 2 ? "passed" : "warning",
      detail: quantifiedMetricsCount > 0 ? `${quantifiedMetricsCount} metrics (% / scale / users) detected` : "No metrics detected. Recruiters look for %, $, or scale metrics.",
    },
    {
      label: "Action Verbs & Leadership Phrasing",
      status: foundVerbs.length >= 3 ? "passed" : "warning",
      detail: foundVerbs.length > 0 ? `Strong verbs detected: ${foundVerbs.slice(0, 4).join(", ")}` : "Missing high-impact action verbs (Architected, Scaled, Optimized)",
    },
    {
      label: "Standard ATS Section Structure",
      status: sectionScore >= 80 ? "passed" : "warning",
      detail: `${passedSections} of ${sectionsChecked.length} standard sections verified`,
    },
    {
      label: "Recruiter Readability & Length",
      status: formattingIssues.length === 0 ? "passed" : "warning",
      detail: `${wordCount} words · ${formattingIssues.length === 0 ? "Optimal length" : formattingIssues[0]}`,
    },
  ];

  return {
    atsScore: overallScore,
    jobRole,
    summary: recruiterVerdict,
    shortlistProbability,
    shortlistTier,
    recruiterVerdict,
    breakdown: [
      { label: "Role keyword match", value: keywordScore },
      { label: "Impact & quantification", value: quantificationScore },
      { label: "Section completeness", value: sectionScore },
      { label: "Formatting & readability", value: formattingScore },
    ],
    keywords: {
      found: foundKeywords,
      missing: missingKeywords,
    },
    jdMatch: jobDescription && jobDescription.trim().length > 20
      ? {
          score: jdScore,
          present: jdPresent.length > 0 ? jdPresent : foundKeywords.slice(0, 4),
          missing: jdMissing.length > 0 ? jdMissing : missingKeywords.slice(0, 4),
        }
      : null,
    metricsFound: quantifiedMetricsCount,
    actionVerbsFound: foundVerbs,
    formatting: {
      score: formattingScore,
      issues: formattingIssues,
    },
    roleChecklist,
    suggestions,
  };
};

const analyzeATS = async (resumeText, jobRole = "Software Engineer", jobDescription = "") => {
  try {
    // 1. Calculate deterministic, accurate, multi-factor ATS score based on real resume and role
    const calculated = calculateAccurateATS(resumeText, jobRole, jobDescription);

    // 2. If OpenAI or Gemini API key is configured, optionally enrich suggestions with LLM
    if (process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          You are a senior technical recruiter and ATS algorithm specialist.
          Analyze this resume specifically for the role of "${jobRole}".
          ${jobDescription ? `Compare against this Job Description:\n${jobDescription}\n` : ""}

          Resume Content:
          ${resumeText}

          Return JSON with:
          {
            "summary": "<recruiter verdict for this role>",
            "suggestions": [
              {
                "id": 1,
                "section": "Skills|Summary|Experience",
                "type": "Add|Improve",
                "priority": "High|Medium",
                "before": "<original text or null>",
                "after": "<specific improved text ready to apply>",
                "action": {
                  "target": "skills|summary|experience"
                }
              }
            ]
          }
        `;

        const aiResult = await getAIResponse(prompt);
        if (aiResult && Array.isArray(aiResult.suggestions) && aiResult.suggestions.length > 0) {
          return {
            ...calculated,
            summary: aiResult.summary || calculated.summary,
            recruiterVerdict: aiResult.summary || calculated.recruiterVerdict,
            suggestions: aiResult.suggestions.map((s, idx) => ({
              ...s,
              id: idx + 1,
            })),
          };
        }
      } catch (aiErr) {
        console.warn("External AI call skipped, using built-in accurate engine:", aiErr.message);
      }
    }

    return calculated;
  } catch (error) {
    console.error("ATS Service Error:", error);
    return calculateAccurateATS(resumeText, jobRole, jobDescription);
  }
};

module.exports = { analyzeATS, calculateAccurateATS, ROLE_DEFINITIONS };