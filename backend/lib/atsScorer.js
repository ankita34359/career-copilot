/**
 * ATS Scorer — fully deterministic, zero randomness.
 * Same input always produces the same score.
 */

// ─── Master Skill Dictionary ──────────────────────────────────────────────────
const SKILL_DICTIONARY = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'bash',
  'shell', 'powershell', 'dart', 'elixir', 'haskell', 'lua', 'groovy',

  // Frontend
  'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'tailwind', 'tailwindcss', 'bootstrap',
  'material-ui', 'mui', 'chakra-ui', 'styled-components', 'webpack', 'vite',
  'babel', 'eslint', 'redux', 'zustand', 'mobx', 'recoil', 'graphql',
  'apollo', 'axios', 'fetch', 'jquery', 'd3.js', 'd3', 'three.js', 'webgl',

  // Backend
  'node.js', 'nodejs', 'express', 'express.js', 'fastapi', 'flask', 'django',
  'spring', 'spring boot', 'springboot', 'laravel', 'rails', 'ruby on rails',
  'asp.net', 'dotnet', '.net', 'nestjs', 'nest.js', 'hapi', 'koa', 'gin',
  'fiber', 'actix', 'rocket', 'phoenix', 'sinatra', 'strapi',

  // Databases
  'mongodb', 'mongoose', 'postgresql', 'postgres', 'mysql', 'sqlite',
  'redis', 'elasticsearch', 'cassandra', 'dynamodb', 'firestore', 'firebase',
  'supabase', 'prisma', 'sequelize', 'typeorm', 'knex', 'oracle', 'mariadb',
  'cockroachdb', 'neo4j', 'influxdb',

  // Cloud & DevOps
  'aws', 'amazon web services', 'gcp', 'google cloud', 'azure', 'heroku',
  'vercel', 'netlify', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible',
  'jenkins', 'github actions', 'gitlab ci', 'circle ci', 'travis ci',
  'ci/cd', 'nginx', 'apache', 'linux', 'unix', 'ec2', 's3', 'lambda',
  'cloudfront', 'rds', 'ecs', 'eks', 'gke', 'cloud run', 'pub/sub',

  // Testing
  'jest', 'vitest', 'mocha', 'chai', 'jasmine', 'cypress', 'playwright',
  'selenium', 'puppeteer', 'testing library', 'pytest', 'junit', 'rspec',

  // Tools & Practices
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'figma',
  'postman', 'swagger', 'openapi', 'rest', 'restful', 'grpc', 'websockets',
  'microservices', 'serverless', 'agile', 'scrum', 'kanban', 'tdd', 'bdd',
  'solid', 'design patterns', 'oop', 'functional programming',

  // Data / ML / AI
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'spark',
  'hadoop', 'kafka', 'airflow', 'dbt', 'tableau', 'power bi', 'looker',
  'data pipeline', 'etl', 'nlp', 'computer vision', 'llm', 'openai',

  // Mobile
  'react native', 'flutter', 'android', 'ios', 'swift', 'xcode',
  'expo', 'ionic', 'cordova',

  // Security
  'oauth', 'jwt', 'ssl', 'tls', 'penetration testing', 'owasp',
  'authentication', 'authorization', 'encryption',
];

// ─── Experience Action Verbs ──────────────────────────────────────────────────
const ACTION_VERBS = [
  'developed', 'built', 'implemented', 'designed', 'architected', 'created',
  'engineered', 'led', 'managed', 'optimized', 'improved', 'reduced',
  'increased', 'delivered', 'launched', 'deployed', 'migrated', 'refactored',
  'automated', 'integrated', 'collaborated', 'mentored', 'maintained',
  'scaled', 'contributed', 'established', 'streamlined', 'enhanced',
  'resolved', 'debugged', 'tested', 'documented', 'spearheaded',
];

// ─── ATS Section Headings ─────────────────────────────────────────────────────
const SECTION_HEADINGS = [
  'experience', 'work experience', 'employment', 'professional experience',
  'education', 'academic background', 'qualifications',
  'skills', 'technical skills', 'core competencies',
  'projects', 'personal projects', 'portfolio',
  'summary', 'objective', 'profile',
  'certifications', 'achievements', 'awards',
];

// ─── Versioned Skill Aliases ──────────────────────────────────────────────────
// Applied to raw text BEFORE dictionary matching so "HTML5" → "html",
// "ES6" → "javascript", etc. are correctly extracted.
// Order matters: more specific patterns first.
const VERSION_ALIASES = [
  // HTML versions: html5, html5+, html 5, html4, html5.0 — any digit suffix
  { pattern: /\bhtml\s*[0-9][^\s]*/gi,           canonical: 'html' },
  // CSS versions: css3, css3+, css 3, css4
  { pattern: /\bcss\s*[0-9][^\s]*/gi,            canonical: 'css' },
  // ECMAScript versions: es6, es7, es8, es2015, es2020, es6+
  { pattern: /\bes\s*(?:2\d{3}|[0-9]+)\+?/gi,   canonical: 'javascript' },
  // Vanilla JS
  { pattern: /\bvanilla\s*js\b/gi,               canonical: 'javascript' },
  // Standalone "JS" not preceded by another letter or dot (avoids "Next.js")
  { pattern: /(?<![a-z.])js\b/gi,                canonical: 'javascript' },
  // TypeScript shorthand: standalone "ts"
  { pattern: /(?<![a-z])ts\b/gi,                 canonical: 'typescript' },
  // Node.js variations: nodejs, node.js, node js
  { pattern: /\bnode\s*\.?\s*js\b/gi,            canonical: 'node.js' },
  // React.js → react
  { pattern: /\breact\s*\.?\s*js\b/gi,           canonical: 'react' },
  // Vue.js → vue
  { pattern: /\bvue\s*\.?\s*js\b/gi,             canonical: 'vue' },
  // Next.js → next.js
  { pattern: /\bnext\s*\.?\s*js\b/gi,            canonical: 'next.js' },
  // Express.js → express
  { pattern: /\bexpress\s*\.?\s*js\b/gi,         canonical: 'express' },
  // Three.js → three.js
  { pattern: /\bthree\s*\.?\s*js\b/gi,           canonical: 'three.js' },
  // D3.js → d3
  { pattern: /\bd3\s*\.?\s*js\b/gi,              canonical: 'd3' },
  // Postgres shorthand
  { pattern: /\bpostgres\b/gi,                   canonical: 'postgresql' },
  // Mongo shorthand
  { pattern: /\bmongo\b/gi,                      canonical: 'mongodb' },
  // k8s → kubernetes
  { pattern: /\bk8s\b/gi,                        canonical: 'kubernetes' },
  // Spring Boot
  { pattern: /\bspring\s*boot\b/gi,              canonical: 'springboot' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize text: lowercase, collapse whitespace.
 */
function normalize(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Apply version alias substitutions so "HTML5" → "html", "ES6" → "javascript",
 * etc. before dictionary matching. Operates on lowercase text.
 */
function applyVersionAliases(text) {
  let result = text;
  for (const { pattern, canonical } of VERSION_ALIASES) {
    result = result.replace(pattern, canonical);
  }
  return result;
}

/**
 * Extract skills from text by matching against the master dictionary.
 * Returns an array of unique matched skill names (dictionary canonical form).
 */
function extractSkills(text) {
  // Normalize then apply version aliases before matching
  const preprocessed = applyVersionAliases(normalize(text));

  return SKILL_DICTIONARY.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Boundary: must not be preceded or followed by a letter (digits OK — avoids
    // false positives inside compound words but allows trailing digits to have
    // already been stripped by applyVersionAliases)
    const pattern = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, 'i');
    return pattern.test(preprocessed);
  });
}

// ─── Scoring Components ───────────────────────────────────────────────────────

/**
 * Normalize a skill to its canonical base form for comparison.
 * Strips version numbers/symbols, then maps common aliases to a single token.
 */
function normalizeSkill(skill) {
  let s = skill.toLowerCase().trim();

  // Strip version numbers, dots, plusses, hashes (e.g. HTML5→html, C++→c, CSS3→css)
  s = s.replace(/[0-9+.#]/g, '');

  // Map common terms to canonical tokens
  if (s.includes('html'))       return 'html';
  if (s.includes('css'))        return 'css';
  if (s.includes('javascript') || s === 'js' || s === 'vanillajs') return 'javascript';
  if (s.includes('typescript') || s === 'ts') return 'typescript';
  if (s.includes('node'))       return 'node.js';
  if (s.includes('react'))      return 'react';
  if (s.includes('graphql'))    return 'graphql';
  if (s.includes('postgres'))   return 'postgresql';
  if (s.includes('mongo'))      return 'mongodb';
  if (s.includes('kubernetes') || s === 'ks') return 'kubernetes';
  if (s.includes('rest'))       return 'rest';
  // "api" alone is too generic — only map compound forms like "rest api"
  // (already caught above via 'rest')

  return s.trim();
}

/**
 * 1. Skill Match Score (50% weight)
 * Both sides are normalized, then partial/substring matching is used so
 * "REST APIs" matches "rest", "HTML5" matches "html", etc.
 * Deduplication is applied to both lists before comparison.
 */
function scoreSkillMatch(resumeSkills, jobSkills) {
  if (jobSkills.length === 0) return { score: 0, matched: [], missing: [] };

  // Normalize resume skills, deduplicate
  const normalizedResume = [...new Set(resumeSkills.map(normalizeSkill))];

  // Partial match: normalized job skill substring-matches any normalized resume skill
  const isMatch = (jobSkill) => {
    const norm = normalizeSkill(jobSkill);
    return normalizedResume.some(rs => rs.includes(norm) || norm.includes(rs));
  };

  // Keep original (un-normalized) names for display; deduplicate the output lists
  const matched = [...new Set(jobSkills.filter(s => isMatch(s)))];
  const missing  = [...new Set(jobSkills.filter(s => !isMatch(s)))];

  const total = matched.length + missing.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);
  return { score, matched, missing };
}

/**
 * 2. Experience Relevance Score (20% weight)
 * - Each action verb found: +5 pts (max 60)
 * - Quantified impact patterns (numbers + %): +20 pts
 * - Years of experience mentioned: +20 pts
 */
function scoreExperience(resumeText) {
  const text = normalize(resumeText);
  let score = 0;

  // Count distinct action verbs present
  const verbsFound = ACTION_VERBS.filter(v => text.includes(v));
  score += Math.min(60, verbsFound.length * 5);

  // Quantified achievements: "reduced X by 30%" or "improved by 2x"
  const hasQuantifiedImpact = /\d+\s*(%|x|times|percent|ms|seconds|hours|users|requests)/.test(text);
  if (hasQuantifiedImpact) score += 20;

  // Years of experience
  const hasYearsExp = /\d+\+?\s*years?\s*(of\s*)?(experience|exp)/.test(text);
  if (hasYearsExp) score += 20;

  return Math.min(100, score);
}

/**
 * 3. Project Relevance Score (15% weight)
 * - Presence of a projects section: base 30 pts
 * - Each job skill found in projects section: +10 pts (max 70)
 */
function scoreProjects(resumeText, jobSkills) {
  const text = applyVersionAliases(normalize(resumeText));
  const hasProjectsSection = /\b(projects?|portfolio|personal\s+projects?)\b/.test(text);

  if (!hasProjectsSection) return 0;

  let score = 30;

  // Extract the projects section text (rough heuristic: text between "project" heading and next heading)
  const projectsMatch = text.match(/\b(?:projects?|portfolio)\b([\s\S]{0,2000})/i);
  const projectsText = projectsMatch ? projectsMatch[1] : text;

  const skillsInProjects = jobSkills.filter(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(escaped, 'i').test(projectsText);
  });

  score += Math.min(70, skillsInProjects.length * 10);
  return Math.min(100, score);
}

/**
 * 4. ATS Format Score (15% weight)
 * - Section headings present: +15 pts each (max 45)
 * - Bullet point usage: +25 pts
 * - Contact info (email): +15 pts
 * - Reasonable length (300–4000 words): +15 pts
 */
function scoreAtsFormat(resumeText) {
  const text = normalize(resumeText);
  let score = 0;

  // Section headings
  const foundHeadings = SECTION_HEADINGS.filter(h => text.includes(h));
  score += Math.min(45, foundHeadings.length * 15);

  // Bullet points (•, -, *, →)
  const hasBullets = /(?:^|\n)\s*[•\-\*→]\s+\w/.test(resumeText);
  if (hasBullets) score += 25;

  // Contact info — email
  const hasEmail = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(resumeText);
  if (hasEmail) score += 15;

  // Reasonable length
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 200 && wordCount <= 4000) score += 15;

  return Math.min(100, score);
}

// ─── Main Exported Function ───────────────────────────────────────────────────

/**
 * Compute full ATS analysis deterministically.
 *
 * @param {string} resumeText  — raw text extracted from PDF
 * @param {string} jobDescription — raw JD text
 * @returns {{
 *   score: number,
 *   matchedSkills: string[],
 *   missingSkills: string[],
 *   breakdown: {
 *     skillScore: number,
 *     experienceScore: number,
 *     projectScore: number,
 *     formatScore: number
 *   }
 * }}
 */
function computeAtsScore(resumeText, jobDescription) {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills    = extractSkills(jobDescription);

  const skillResult      = scoreSkillMatch(resumeSkills, jobSkills);
  const experienceScore  = scoreExperience(resumeText);
  const projectScore     = scoreProjects(resumeText, jobSkills);
  const formatScore      = scoreAtsFormat(resumeText);

  const finalScore = Math.round(
    skillResult.score * 0.50 +
    experienceScore   * 0.20 +
    projectScore      * 0.15 +
    formatScore       * 0.15
  );

  return {
    score:         Math.min(100, Math.max(0, finalScore)),
    matchedSkills: skillResult.matched,
    missingSkills: skillResult.missing,
    breakdown: {
      skillScore:       skillResult.score,
      experienceScore,
      projectScore,
      formatScore,
    },
  };
}

module.exports = { computeAtsScore, extractSkills };
