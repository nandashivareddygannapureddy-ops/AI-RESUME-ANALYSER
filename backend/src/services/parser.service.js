const pdfParse = require("pdf-parse");
const fs = require("fs");

// Extract structured candidate sections from raw text
const extractSectionsFromText = (rawText) => {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailMatch = rawText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const email = emailMatch ? emailMatch[0] : "";

  // 2. Phone extraction
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/);
  const phone = phoneMatch ? phoneMatch[0] : "";

  // 3. Name heuristic (first clean line that isn't email, phone, or URL)
  let name = "";
  for (const line of lines.slice(0, 5)) {
    if (
      line.length > 2 &&
      line.length < 40 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !line.includes("www.") &&
      !/\d{5,}/.test(line) &&
      !/resume|curriculum|cv/i.test(line)
    ) {
      name = line;
      break;
    }
  }

  // 4. Section segmenter
  const sectionKeywords = {
    summary: /(?:professional\s+summary|profile|about\s+me|career\s+objective|summary)/i,
    experience: /(?:work\s+experience|professional\s+experience|employment\s+history|experience)/i,
    skills: /(?:technical\s+skills|core\s+competencies|skills\s*&?\s*tools|skills)/i,
    education: /(?:education|academic\s+background|qualifications)/i,
    projects: /(?:projects|personal\s+projects|academic\s+projects)/i,
  };

  const sections = {
    name: name || "Your Name",
    email: email || "email@example.com",
    phone: phone || "(123) 456-7890",
    title: "",
    summary: "",
    skills: "",
    experience: "",
    education: "",
  };

  let currentSection = null;
  const sectionBuffers = {
    summary: [],
    experience: [],
    skills: [],
    education: [],
    projects: [],
  };

  for (const line of lines) {
    let matchedKey = null;
    for (const [key, regex] of Object.entries(sectionKeywords)) {
      if (regex.test(line) && line.length < 35) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else if (currentSection && sectionBuffers[currentSection]) {
      sectionBuffers[currentSection].push(line);
    }
  }

  sections.summary = sectionBuffers.summary.join(" ").trim();
  sections.skills = sectionBuffers.skills.join(", ").trim();
  sections.experience = sectionBuffers.experience.join("\n").trim();
  sections.education = sectionBuffers.education.join("\n").trim();

  // If summary was not captured by explicit heading, grab the first narrative block
  if (!sections.summary && lines.length > 2) {
    const candidateSummary = lines.slice(1, 5).filter(
      (l) => l.length > 50 && !l.includes("@")
    );
    if (candidateSummary.length > 0) {
      sections.summary = candidateSummary.join(" ");
    }
  }

  return sections;
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