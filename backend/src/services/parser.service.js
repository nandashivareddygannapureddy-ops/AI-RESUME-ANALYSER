const pdfParse = require("pdf-parse");
const fs = require("fs");

// Extract structured candidate sections from raw text
const extractSectionsFromText = (rawText) => {
  const cleanRaw = (rawText || "").replace(/\r\n/g, "\n");
  const lines = cleanRaw.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailMatch = cleanRaw.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : "";

  // 2. Phone extraction (supports +91, (123) 456-7890, 958-1869648, etc.)
  const phoneMatch = cleanRaw.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{4,5}\b/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // 3. Name heuristic (first clean line that isn't email, phone, or URL)
  let name = "";
  for (const line of lines.slice(0, 6)) {
    const cleanedLine = line.replace(/^[#|~•\s]+/, "").trim();
    if (
      cleanedLine.length >= 3 &&
      cleanedLine.length < 50 &&
      !cleanedLine.includes("@") &&
      !cleanedLine.includes("http") &&
      !cleanedLine.includes("www.") &&
      !cleanedLine.includes("github.com") &&
      !cleanedLine.includes("linkedin.com") &&
      !/\d{5,}/.test(cleanedLine) &&
      !/resume|curriculum|cv|education|skills|experience/i.test(cleanedLine)
    ) {
      name = cleanedLine;
      break;
    }
  }

  // 4. Section segmenter
  const sectionKeywords = {
    summary: /^(?:professional\s+summary|career\s+summary|executive\s+summary|profile|about\s+me|career\s+objective|objective|summary)(?:[\s&/:-].*)?$/i,
    skills: /^(?:technical\s+(?:competencies|skills)|core\s+competencies|skills\s*&?\s*tools|skills\s*(?:&|and)\s*abilities|technical\s+expertise|key\s+skills|skills)(?:[\s&/:-].*)?$/i,
    experience: /^(?:work\s+experience|professional\s+experience|employment\s+history|experience\s*(?:&|and)\s*achievements|work\s+history|experience|internships?)(?:[\s&/:-].*)?$/i,
    projects: /^(?:academic\s+projects|personal\s+projects|key\s+projects|technical\s+projects|projects\s*(?:&|and)\s*achievements|projects)(?:[\s&/:-].*)?$/i,
    certifications: /^(?:certifications?|certificates?|licenses?|courses?|training)(?:[\s&/:-].*)?$/i,
    education: /^(?:education\s*(?:&|and)\s*certifications?|academic\s+background|qualifications|academic\s+history|education)(?:[\s&/:-].*)?$/i,
    declaration: /^(?:declaration|statement)(?:[\s&/:-].*)?$/i,
  };

  const sectionBuffers = {
    summary: [],
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    education: [],
    declaration: [],
  };

  let currentSection = null;

  for (const line of lines) {
    let matchedKey = null;
    const stripped = line.replace(/^[•\-\*#\s]+/, "").replace(/[:\-_]+$/, "").trim();

    if (stripped.length > 0 && stripped.length < 50) {
      for (const [key, regex] of Object.entries(sectionKeywords)) {
        if (regex.test(stripped)) {
          matchedKey = key;
          break;
        }
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else if (currentSection && sectionBuffers[currentSection]) {
      sectionBuffers[currentSection].push(line);
    }
  }

  // Combine experience and projects cleanly without certifications or declaration pollution
  let expText = sectionBuffers.experience.join("\n").trim();
  const projText = sectionBuffers.projects.join("\n").trim();
  if (projText && (!expText || expText.length < 150)) {
    expText = expText ? `${expText}\n\nProjects:\n${projText}` : projText;
  }

  let eduText = sectionBuffers.education.join("\n").trim();
  const certText = sectionBuffers.certifications.join("\n").trim();
  if (certText) {
    eduText = eduText ? `${eduText}\n\nCertifications:\n${certText}` : `Certifications:\n${certText}`;
  }

  let summaryText = sectionBuffers.summary.join(" ").trim();
  // Do NOT falsely assign education or technical details as summary if not explicitly under a summary header
  if (summaryText.includes("B.Tech") || summaryText.includes("CGPA") || summaryText.includes("Degree")) {
    summaryText = "";
  }

  return {
    name: name || "Your Name",
    email: email || "email@example.com",
    phone: phone || "(123) 456-7890",
    title: "",
    summary: summaryText,
    skills: sectionBuffers.skills.join("\n").trim(),
    experience: expText,
    education: eduText,
  };
};

const parseResume = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    // Normalize whitespace while preserving linebreaks
    const cleanText = data.text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    const parsedSections = extractSectionsFromText(cleanText);

    return {
      text: cleanText,
      pages: data.numpages,
      info: data.info,
      parsedSections,
    };
  } catch (error) {
    console.error("Parser Service Error:", error);
    throw error;
  }
};

const parseResumeFromBuffer = async (buffer) => {
  try {
    const data = await pdfParse(buffer);

    const cleanText = data.text
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    const parsedSections = extractSectionsFromText(cleanText);

    return {
      text: cleanText,
      pages: data.numpages,
      info: data.info,
      parsedSections,
    };
  } catch (error) {
    console.error("Parser Buffer Service Error:", error);
    throw error;
  }
};

module.exports = { parseResume, parseResumeFromBuffer, extractSectionsFromText };