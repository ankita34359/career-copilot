const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cheerio = require('cheerio');

const auth = require('../middleware/auth');
const Diary = require('../models/Diary');
const ResumeScore = require('../models/ResumeScore');
const Resume = require('../models/Resume');
const { computeAtsScore } = require('../lib/atsScorer');
const createNotification = require('../utils/createNotification');

const upload = multer({ storage: multer.memoryStorage() });

// Models to try in order — fallback chain (all verified working on free tier)
const MODEL_FALLBACK_CHAIN = [
  'openai/gpt-oss-20b:free',            // 20B — best free option for complex JSON
  'meta-llama/llama-3.3-70b-instruct:free', // 70B — great quality, may need retry
  'meta-llama/llama-3-8b-instruct',     // 8B — smallest, last resort
];

// Robust JSON extractor — handles markdown fences, leading/trailing text, truncation
function extractJSON(raw) {
  // 1. Strip markdown fences
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // 2. Find the outermost { ... } block
  const start = cleaned.indexOf('{');
  if (start === -1) throw new Error('No JSON object found in AI response');

  // Walk forward tracking brace depth to find matching close
  let depth = 0;
  let end = -1;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === '{') depth++;
    else if (cleaned[i] === '}') {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }

  const jsonStr = end !== -1 ? cleaned.slice(start, end + 1) : cleaned.slice(start);

  try {
    return JSON.parse(jsonStr);
  } catch (parseErr) {
    // Last-resort: try to fix trailing truncation by appending closing braces
    let attempt = jsonStr;
    for (let i = 0; i < 10; i++) {
      attempt += '}';
      try { return JSON.parse(attempt); } catch (_) {}
    }
    throw new Error(`JSON parse failed: ${parseErr.message}`);
  }
}

// Helper to interact with OpenRouter
async function generateOpenRouterContent(prompt, systemMessage = 'You are an expert career coach and technical interviewer.', options = {}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is not set in backend/.env');
  }

  const modelList = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL]
    : MODEL_FALLBACK_CHAIN;

  let lastError = null;

  for (const model of modelList) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: prompt }
          ],
          ...(options.max_tokens  && { max_tokens:   options.max_tokens  }),
          ...(options.temperature && { temperature:  options.temperature }),
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Career Copilot'
          },
          timeout: 90000
        }
      );

      if (response.data?.choices?.length) {
        console.log(`[OpenRouter] Success with model: ${model}`);
        return response.data.choices[0].message.content;
      }

      lastError = new Error(`Empty response from model ${model}`);
      console.warn(`[OpenRouter] ${lastError.message}`);
    } catch (axiosErr) {
      const status = axiosErr.response?.status;
      const apiMsg = axiosErr.response?.data?.error?.message || axiosErr.message;
      lastError = new Error(apiMsg);
      console.warn(`[OpenRouter] Model "${model}" failed (${status}): ${apiMsg}`);

      if (status === 429) {
        // Rate limited — wait 8s then retry this model once before moving on
        console.warn(`[OpenRouter] Rate limited on "${model}", retrying in 8s...`);
        await new Promise(r => setTimeout(r, 8000));
        try {
          const retry = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model,
              messages: [
                { role: 'system', content: systemMessage },
                { role: 'user',   content: prompt        }
              ],
              ...(options.max_tokens  && { max_tokens:  options.max_tokens  }),
              ...(options.temperature && { temperature: options.temperature }),
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type':  'application/json',
                'HTTP-Referer':  'http://localhost:5173',
                'X-Title':       'Career Copilot'
              },
              timeout: 90000
            }
          );
          if (retry.data?.choices?.length) {
            console.log(`[OpenRouter] Retry succeeded: ${model}`);
            return retry.data.choices[0].message.content;
          }
        } catch (_) { /* fall through to next model */ }
        continue;
      }

      // 404 — model unavailable, try next
      if (status === 404) continue;

      // Auth or other hard errors — stop immediately
      throw lastError;
    }
  }

  throw lastError || new Error('All models in fallback chain failed. Check your OpenRouter API key and credits.');
}

// Minimum characters for extracted JD to be considered usable
const MIN_JD_LENGTH = 150;

// CSS selectors that typically contain the JD body, tried in order
const JD_SELECTORS = [
  // LinkedIn
  '.description__text',
  '.show-more-less-html__markup',
  // Indeed
  '#jobDescriptionText',
  '.jobsearch-jobDescriptionText',
  // Greenhouse / Lever / Workday / generic ATS
  '#content',
  '[class*="job-description"]',
  '[class*="jobDescription"]',
  '[class*="job_description"]',
  '[id*="job-description"]',
  '[id*="jobDescription"]',
  'article',
  'main',
  '.content',
  '#main-content',
];

/**
 * Scrape JD text from a URL.
 * Returns { text, error } — exactly one of the two will be set.
 */
async function scrapeJdUrl(url) {
  let html;
  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        // Mimic a real browser to avoid bot-detection blocks
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });
    html = response.data;
  } catch (e) {
    const status = e.response?.status;
    if (status === 403 || status === 401) {
      return { error: 'This site requires login to access job details. Please paste the job description manually.' };
    }
    if (status === 404) {
      return { error: 'Job listing not found (404). The link may have expired.' };
    }
    return { error: `Unable to reach the URL: ${e.message}. Please paste the job description manually.` };
  }

  const $ = cheerio.load(html);

  // Remove noise nodes
  $('script, style, noscript, header, footer, nav, aside, [role="navigation"], [role="banner"]').remove();

  // Try targeted selectors first
  for (const selector of JD_SELECTORS) {
    const el = $(selector).first();
    if (el.length) {
      const text = el.text().replace(/\s+/g, ' ').trim();
      if (text.length >= MIN_JD_LENGTH) {
        return { text: text.substring(0, 10000) };
      }
    }
  }

  // Fallback: largest <div> / <section> by text length (heuristic)
  let best = '';
  $('div, section').each((_, el) => {
    const t = $(el).clone().children('div, section').remove().end().text().replace(/\s+/g, ' ').trim();
    if (t.length > best.length) best = t;
  });

  if (best.length >= MIN_JD_LENGTH) {
    return { text: best.substring(0, 10000) };
  }

  return {
    error:
      'Could not extract job description from this URL. ' +
      'The site may require login or block automated access. ' +
      'Please paste the job description text manually.',
  };
}

/**
 * Resolve final JD text from either raw text or URL input.
 * Throws an Error with a user-facing message if URL extraction fails.
 */
async function getJdContent(jdText, jdUrl) {
  if (jdUrl && jdUrl.trim()) {
    const { text, error } = await scrapeJdUrl(jdUrl.trim());
    if (error) throw new Error(error);
    return text;
  }
  return (jdText || '').trim();
}

// ----------------------------------------
// 1. Analyze Resume Endpoint
// ----------------------------------------
router.post('/analyze-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    const { jdText, jdUrl } = req.body;

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a PDF resume' });
    }

    const data = await pdfParse(req.file.buffer);
    const resumeText = data.text;

    // getJdContent throws a user-facing Error if URL extraction fails
    let jobDescription;
    try {
      jobDescription = await getJdContent(jdText, jdUrl);
    } catch (jdErr) {
      return res.status(400).json({ msg: jdErr.message });
    }

    if (!jobDescription || jobDescription.length < MIN_JD_LENGTH) {
      return res.status(400).json({
        msg: 'Job description is too short to score against. Please provide more detail or paste the text manually.',
      });
    }

    // ── Step 1: Deterministic ATS Scoring (no AI) ──────────────────────────
    const atsResult = computeAtsScore(resumeText, jobDescription);

    // Persist legacy score entry (kept for backwards-compat)
    await ResumeScore.create({ userId: req.user.id, score: atsResult.score });

    // Save resume record (with raw PDF buffer) so the user can view and mark it as primary
    const savedResume = await Resume.create({
      userId:        req.user.id,
      fileName:      req.file.originalname,
      fileData:      req.file.buffer,
      extractedText: resumeText,
      atsScore:      atsResult.score,
      isPrimary:     false,
    });

    // ── Step 2: AI generates only insights & improvement text ──────────────
    let insights = [];
    let improvements = [];

    try {
      const insightPrompt = `
You are an expert resume coach. A candidate's resume was scored against a job description using an ATS system.

ATS Score: ${atsResult.score}/100
Score Breakdown:
- Skill Match: ${atsResult.breakdown.skillScore}/100 (50% weight)
- Experience Relevance: ${atsResult.breakdown.experienceScore}/100 (20% weight)
- Project Relevance: ${atsResult.breakdown.projectScore}/100 (15% weight)
- ATS Format: ${atsResult.breakdown.formatScore}/100 (15% weight)

Matched Skills: ${atsResult.matchedSkills.join(', ') || 'None'}
Missing Skills: ${atsResult.missingSkills.join(', ') || 'None'}

Resume excerpt (first 2000 chars): ${resumeText.substring(0, 2000)}

Return ONLY valid JSON with this exact structure:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"]
}

Rules:
- insights: 3 specific observations about the resume's strengths/gaps based on the score data
- improvements: 3 concrete, actionable steps the candidate should take
- Do NOT mention randomness, guessing, or uncertainty
- Respond purely in JSON, no markdown wrappers
`;

      const rawAiResponse = await generateOpenRouterContent(
        insightPrompt,
        'You are an expert resume coach. Respond only with valid JSON.'
      );
      const cleanJson = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const aiData = JSON.parse(cleanJson);
      insights    = aiData.insights    || [];
      improvements = aiData.improvements || [];
    } catch (aiErr) {
      // AI insights are non-critical — fallback to rule-based text
      console.warn('[analyze-resume] AI insights failed, using fallback:', aiErr.message);
      insights = [
        atsResult.breakdown.skillScore < 50
          ? `Your skill match is low (${atsResult.breakdown.skillScore}%). Add the missing skills to your resume if you have experience with them.`
          : `Good skill alignment (${atsResult.breakdown.skillScore}%). Your resume covers most required technologies.`,
        atsResult.breakdown.experienceScore < 50
          ? 'Your experience section lacks strong action verbs and quantified achievements.'
          : 'Your experience section uses strong action verbs — good ATS signal.',
        atsResult.breakdown.formatScore < 60
          ? 'Your resume format may not parse well in ATS systems. Ensure clear section headings and bullet points.'
          : 'Your resume format is ATS-friendly with proper structure.',
      ];
      improvements = [
        `Add these missing skills to your resume if applicable: ${atsResult.missingSkills.slice(0, 5).join(', ') || 'N/A'}.`,
        'Quantify your achievements with numbers (e.g., "Reduced load time by 40%", "Managed a team of 5").',
        'Ensure your resume has clear sections: Summary, Experience, Skills, Projects, Education.',
      ];
    }

    createNotification(req.user.id, {
      title: 'Resume Analyzed',
      message: `Your resume scored ${atsResult.score}/100 against the job description.`,
      type: atsResult.score >= 70 ? 'success' : atsResult.score >= 45 ? 'info' : 'warning',
      actionLink: '/dashboard/analyzer',
    });

    res.json({
      resumeId:      savedResume._id,
      score:         atsResult.score,
      matchedSkills: atsResult.matchedSkills,
      missingSkills: atsResult.missingSkills,
      breakdown:     atsResult.breakdown,
      insights,
      improvements,
    });
  } catch (err) {
    console.error('[analyze-resume]', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// ----------------------------------------
// 2. Improve Resume Endpoint
// ----------------------------------------
router.post('/improve-resume', auth, async (req, res) => {
  try {
    const { bulletPoints } = req.body;

    const prompt = `
You are a professional resume writer and ATS optimization expert.

DETERMINISTIC OUTPUT RULES (MANDATORY):
1. For the same input, you MUST return the same output every time.
2. Do NOT rephrase differently across runs.
3. Do NOT introduce variation in wording, structure, or sentence order.
4. Always follow the exact same sentence pattern: Action Verb + What + How
5. If multiple improvements are possible, ALWAYS choose the most direct and simple version.
6. Avoid synonym variation — do NOT alternate between "Built", "Created", "Developed" randomly.
7. Keep bullet structure consistent across all outputs.

STRICT RULES (MANDATORY):
1. DO NOT add fake metrics, numbers, or results.
2. DO NOT assume impact (no % increase, no performance claims unless explicitly provided).
3. DO NOT introduce new technologies or tools not present in the input.
4. KEEP all original meaning intact.
5. DO NOT exaggerate or hallucinate.

IMPROVEMENT RULES:
1. Use strong action verbs (Developed, Engineered, Implemented, Designed, Built).
2. Make sentences concise and professional.
3. Improve readability and flow.
4. Remove redundancy or repeated phrasing.
5. Keep ATS-friendly keywords (React, Node.js, MongoDB, etc.).
6. Preserve all important technical details.
7. Prefer structure: Action + What + How + (Optional: Why)
8. If measurable data is NOT present → DO NOT invent it. Keep the statement clean and strong.
9. If a bullet is already strong → make only minimal improvements.

MANDATORY OUTPUT RULES:
- ALWAYS return both sections. NEVER return an empty array [] for any section.
- improvedBullets: one entry per input bullet, in the same order as the input.
- whatWasImproved: list only improvements actually made. If bullets were already strong and minimal changes were made, return ["Minimal changes — bullets were already well-structured"].

INPUT:
"""
${bulletPoints}
"""

Return ONLY a valid JSON object (no markdown, no explanation outside JSON):
{
  "improvedBullets": ["<rewritten bullet 1>", "<rewritten bullet 2>"],
  "whatWasImproved": ["<specific improvement 1>", "<specific improvement 2>"]
}
`;

    const rawAiResponse = await generateOpenRouterContent(prompt);
    const cleanJson = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json(JSON.parse(cleanJson));
  } catch (err) {
    console.error('[improve-resume]', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// ----------------------------------------
// 3. Bullet Analysis Endpoint (text-based, no PDF)
// ----------------------------------------
router.post('/bullet-analysis', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ msg: 'Please provide bullet points text.' });
    }

    const prompt = `
You are a professional resume reviewer and ATS expert.

STRICT RULES (MUST FOLLOW):
1. DO NOT rewrite the bullets.
2. DO NOT add fake metrics or assume results not in the input.
3. Base all analysis ONLY on the given text.
4. Ensure NO CONTRADICTIONS between strengths and weaknesses — a concept cannot appear in both.
5. Be specific — reference actual content from the bullets, not generic advice.

LOGIC RULES (FOLLOW EXACTLY):

Action Verbs:
- If strong verbs like "Developed", "Implemented", "Designed", "Engineered", "Built", "Architected" are present → mark as strength.
- DO NOT suggest improving verbs if they are already strong.

Technologies:
- If specific technologies (e.g., React, Node.js, MongoDB, Docker) are clearly named → mark as strength.

Generic / Unsubstantiated Terms:
- Words like "scalable", "optimized", "efficient", "secure", "robust", "high-performance" without measurable proof → MUST be treated as a weakness, NEVER a strength.

Measurable Impact:
- If no numbers, percentages, or quantifiable outcomes are present → add to weaknesses.

Redundancy:
- If multiple bullets repeat the same structure or theme → mark as weakness.

Clarity:
- If bullets are clear and understandable → strength.
- If vague or ambiguous → weakness.

Suggestions Logic:
- Only suggest improvements that are genuinely missing.
- DO NOT suggest improving something already identified as a strength.
- Keep each suggestion specific and actionable.

MANDATORY OUTPUT RULES:
- ALWAYS return all three sections: strengths, weaknesses, suggestions.
- NEVER return an empty array for any section.
- If no weaknesses found → return ["No major weaknesses found"].
- If no suggestions needed → return ["No additional suggestions — bullets are already strong"].

INPUT:
"""
${text}
"""

Return ONLY a valid JSON object (no markdown, no explanation outside JSON):
{
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>"]
}
`;

    const rawAiResponse = await generateOpenRouterContent(prompt);
    const cleanJson = rawAiResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    res.json(JSON.parse(cleanJson));
  } catch (err) {
    console.error('[bullet-analysis]', err.message);
    res.status(500).json({ msg: err.message });
  }
});

// ----------------------------------------
// 4. Generate Study Guide Endpoint
// ----------------------------------------
router.post('/study-guide', auth, async (req, res) => {
  try {
    const diaries = await Diary.find({ userId: req.user.id }).sort({ createdAt: -1 });

    // helper: get best available text from an entry
    const getEntryStrength = (d) => (d.keyLearnings || d.learnings)?.trim() || (d.topics ? `Topics covered: ${d.topics}` : null);
    const getEntryWeakness = (d) => (d.struggles || d.weakness)?.trim() || (d.topics ? `Topics to revisit: ${d.topics}` : null);

    const weaknesses = diaries.map(d => getEntryWeakness(d)).filter(Boolean);
    const learnings  = diaries.map(d => getEntryStrength(d)).filter(Boolean);

    // Strong areas = any entry with keyLearnings filled (result doesn't matter)
    const strongAreas = diaries
      .filter(d => (d.keyLearnings || d.learnings)?.trim())
      .map(d => d.keyLearnings || d.learnings);

    // Weak areas = any entry with struggles or topics
    const weakAreas = diaries
      .filter(d => getEntryWeakness(d))
      .map(d => getEntryWeakness(d));

    const prompt = `You are a technical interview coach. Generate a personalized study guide as a single valid JSON object.
${strongAreas.length > 0 ? `Strong areas: ${JSON.stringify(strongAreas.slice(0,3))}` : ''}
${weakAreas.length > 0 ? `Weak areas: ${JSON.stringify(weakAreas.slice(0,3))}` : 'No diary data — use standard SWE interview topics (DSA, System Design, Behavioral).'}

RESOURCE URLS (use only these):
LeetCode problems → https://leetcode.com/problems/SLUG/ (slug = title lowercased, spaces→hyphens)
NeetCode → https://neetcode.io/
GeeksforGeeks → https://www.geeksforgeeks.org/
System Design Primer → https://github.com/donnemartin/system-design-primer
Grokking → https://www.educative.io/courses/grokking-coding-interview-patterns-python
HackerRank → https://www.hackerrank.com/domains/data-structures
Blind 75 → https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions

Return ONLY this JSON (no markdown, no extra text):
{
  "focus_areas": [
    {"title":"string","reason":"1 sentence","priority":"high|medium|low"},
    {"title":"string","reason":"1 sentence","priority":"high|medium|low"},
    {"title":"string","reason":"1 sentence","priority":"high|medium|low"}
  ],
  "topics": [
    {
      "title":"string",
      "difficulty":"easy|medium|hard",
      "why_important":"1 sentence",
      "explanation":"2 sentences",
      "subtopics":[
        {"name":"string","description":"1 sentence","concepts":["c1","c2","c3"]},
        {"name":"string","description":"1 sentence","concepts":["c1","c2","c3"]},
        {"name":"string","description":"1 sentence","concepts":["c1","c2"]}
      ],
      "top_interview_questions":[
        {"question":"Two Sum","platform":"LeetCode","difficulty":"Easy","url":"https://leetcode.com/problems/two-sum/","frequency":"Very High","companies":["Google","Amazon"]},
        {"question":"string","platform":"LeetCode","difficulty":"Easy|Medium|Hard","url":"https://leetcode.com/problems/SLUG/","frequency":"Very High|High|Medium","companies":["Co1","Co2"]},
        {"question":"string","platform":"LeetCode","difficulty":"Easy|Medium|Hard","url":"https://leetcode.com/problems/SLUG/","frequency":"Very High|High|Medium","companies":["Co1"]},
        {"question":"string","platform":"LeetCode","difficulty":"Medium","url":"https://leetcode.com/problems/SLUG/","frequency":"High","companies":["Meta"]},
        {"question":"string","platform":"LeetCode","difficulty":"Medium","url":"https://leetcode.com/problems/SLUG/","frequency":"High","companies":["Amazon"]}
      ],
      "action_items":[
        {"step":"Specific action e.g. implement X from scratch","resource":"NeetCode","url":"https://neetcode.io/","time_estimate":"2 hours"},
        {"step":"Specific action e.g. solve 5 LeetCode problems on X","resource":"LeetCode","url":"https://leetcode.com/","time_estimate":"3 hours"},
        {"step":"Specific action","resource":"GeeksforGeeks","url":"https://www.geeksforgeeks.org/","time_estimate":"1 hour"}
      ],
      "resources":[
        {"name":"NeetCode","url":"https://neetcode.io/","type":"Video","description":"Structured video explanations with code"},
        {"name":"LeetCode","url":"https://leetcode.com/","type":"Platform","description":"Practice problems with solutions"},
        {"name":"GeeksforGeeks","url":"https://www.geeksforgeeks.org/","type":"Article","description":"Theory and implementation guides"}
      ]
    },
    {COPY ABOVE STRUCTURE for topic 2},
    {COPY ABOVE STRUCTURE for topic 3}
  ],
  "weekly_plan": [
    {
      "week":"Week 1","focus":"Topic theme","weekly_goal":"Measurable milestone","total_hours":"18-21 hours",
      "days":[
        {"range":"Day 1-2","topic":"Specific topic","tasks":["Watch NeetCode playlist on X (4 videos)","Implement X from scratch in your language"],"practice_target":"Solve Two Sum, Contains Duplicate, Valid Anagram (Easy)","time_estimate":"3 hours/day","resources":[{"name":"NeetCode","url":"https://neetcode.io/"}]},
        {"range":"Day 3-4","topic":"Specific topic","tasks":["Study Y pattern","Solve 4 Medium problems on Y"],"practice_target":"Solve 3 Medium LeetCode problems on Y pattern","time_estimate":"3 hours/day","resources":[{"name":"LeetCode","url":"https://leetcode.com/"}]},
        {"range":"Day 5-7","topic":"Review & Mock","tasks":["Re-solve 3 problems you struggled with, no hints","Timed 60-min mock: 2 random Medium problems"],"practice_target":"Complete Blind 75 first 10 problems","time_estimate":"3-4 hours/day","resources":[{"name":"Blind 75","url":"https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions"}]}
      ],
      "weekly_resources":[
        {"name":"NeetCode","url":"https://neetcode.io/","purpose":"Video explanations for all topics this week"},
        {"name":"LeetCode","url":"https://leetcode.com/","purpose":"Daily problem practice"}
      ]
    },
    {COPY ABOVE STRUCTURE for week 2},
    {COPY ABOVE STRUCTURE for week 3},
    {COPY ABOVE STRUCTURE for week 4}
  ]
}

Rules: use real LeetCode problem names only. Fill ALL placeholder text with actual content. No markdown. JSON only.`;

    const rawAiResponse = await generateOpenRouterContent(
      prompt,
      'You are an expert career coach and technical interviewer. You must respond with ONLY a valid JSON object — no markdown, no explanation, nothing else.',
      { max_tokens: 4096, temperature: 0.3 }
    );

    console.log('[study-guide] Raw AI length:', rawAiResponse?.length);

    const parsed = extractJSON(rawAiResponse);
    res.json(parsed);
  } catch (err) {
    console.error('[study-guide] ERROR:', err.message);
    res.status(500).json({
      msg: 'Failed to generate study guide. AI service is temporarily unavailable.',
      error: err.message
    });
  }
});

// ─── Deterministic Pattern Extractor ─────────────────────────────────────────

// Keyword → canonical topic label
const KEYWORD_TOPIC_MAP = [
  { keywords: ['dsa', 'data struct', 'algorithm', 'dynamic prog', 'dp', 'recursion',
               'sorting', 'searching', 'graph', 'tree', 'linked list', 'stack',
               'queue', 'heap', 'array'],                                           label: 'DSA' },
  { keywords: ['oop', 'oops', 'object orient', 'inheritance', 'polymorphism',
               'encapsul', 'abstraction', 'solid'],                                 label: 'OOPs' },
  { keywords: ['system design', 'lld', 'hld', 'low level design', 'high level design',
               'scalab', 'architect', 'microservice'],                              label: 'System Design' },
  { keywords: ['react', 'redux', 'hook', 'component', 'state manage', 'angular',
               'vue', 'svelte', 'frontend', 'front end'],                           label: 'React / Frontend' },
  { keywords: ['node', 'express', 'backend', 'rest api', 'graphql', 'django',
               'flask', 'spring'],                                                  label: 'Backend / APIs' },
  { keywords: ['sql', 'database', 'mongodb', 'postgres', 'mysql', 'query',
               'schema', 'indexing'],                                               label: 'Databases' },
  { keywords: ['javascript', 'typescript', 'python', 'java', 'c++', 'golang',
               'coding round'],                                                     label: 'Core Languages' },
  { keywords: ['behav', 'communication', 'soft skill', 'tell me about', 'hr round',
               'leadership', 'team work', 'culture fit'],                           label: 'Communication' },
  { keywords: ['project explain', 'project arch', 'past project', 'describe project',
               'walk me through', 'project explanation'],                           label: 'Project Explanation' },
  { keywords: ['time complex', 'space complex', 'big o', 'optimiz', 'complexity'],  label: 'Complexity Analysis' },
  { keywords: ['debug', 'testing', 'unit test', 'test case', 'jest', 'cypress'],    label: 'Testing & Debugging' },
  { keywords: ['cloud', 'aws', 'docker', 'kubernetes', 'devops', 'ci/cd', 'deploy'], label: 'DevOps / Cloud' },
  { keywords: ['os', 'operating system', 'process', 'thread', 'deadlock',
               'concurr', 'memory manage'],                                         label: 'Operating Systems' },
  { keywords: ['network', 'http', 'tcp', 'dns', 'protocol', 'socket'],             label: 'Networking' },
  { keywords: ['machine learn', 'deep learn', 'nlp', 'neural', 'data science'],    label: 'ML / AI' },
  { keywords: ['math', 'probability', 'statistic', 'puzzle', 'aptitude'],          label: 'Aptitude / Math' },
];

/** Match text against keyword map; return matched labels (deduped). */
function matchTopicLabels(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = [];
  for (const { keywords, label } of KEYWORD_TOPIC_MAP) {
    if (keywords.some(kw => lower.includes(kw))) found.push(label);
  }
  return found;
}

/**
 * Fully deterministic strength/weakness extraction.
 * Sources (in priority order):
 *  1. `topics` field (comma-separated tags) — counted by result
 *  2. `struggles` / `keyLearnings` text — matched against keyword map
 *  3. Legacy `weakness` / `learnings` fields for backward compat
 */
function deterministicPatterns(diaries, debug = false) {
  const log = (...args) => { if (debug) console.log(...args); };

  const strengthScores = {};
  const weaknessScores = {};

  for (const entry of diaries) {
    const result      = entry.result?.toLowerCase().trim();
    const isPassed    = result === 'passed';
    const isNotPassed = result !== 'passed';

    const learningText = (entry.keyLearnings || entry.learnings || '').trim();
    const struggleText = (entry.struggles    || entry.weakness  || '').trim();
    const topicsText   = (entry.topics || '').trim();

    log(`\n[DP] ── ${entry.company} (${entry.result}) ──`);
    log(`  keyLearnings : "${learningText}"`);
    log(`  struggles    : "${struggleText}"`);
    log(`  topics       : "${topicsText}"`);

    // ── PRIMARY: keyLearnings → Strengths ──────────────────────────────────────
    // The user explicitly wrote what went well / what they know → always a strength
    if (learningText) {
      const labels = matchTopicLabels(learningText.toLowerCase());
      log(`  [learning labels] : [${labels.join(', ')}]`);
      for (const label of labels) {
        strengthScores[label] = (strengthScores[label] || 0) + 2;
      }
    }

    // ── PRIMARY: struggles → Needs Improvement ─────────────────────────────────
    // The user explicitly wrote what stumped them → always a weakness
    if (struggleText) {
      const labels = matchTopicLabels(struggleText.toLowerCase());
      log(`  [struggle labels] : [${labels.join(', ')}]`);
      for (const label of labels) {
        weaknessScores[label] = (weaknessScores[label] || 0) + 2;
      }
    }

    // ── SECONDARY: topics field → result-based signal ──────────────────────────
    // Only used when keyLearnings/struggles are empty
    if (!learningText && !struggleText && topicsText) {
      const topicLabels = matchTopicLabels(topicsText.toLowerCase());
      log(`  [topic labels (secondary)] : [${topicLabels.join(', ')}]`);
      for (const label of topicLabels) {
        if (isPassed)    strengthScores[label] = (strengthScores[label] || 0) + 1;
        if (isNotPassed) weaknessScores[label] = (weaknessScores[label] || 0) + 1;
      }
    }
  }

  log('\n[DP] strengthScores:', strengthScores);
  log('[DP] weaknessScores:', weaknessScores);

  // Remove contradictions: if a label appears in both, keep it in the higher-scored side
  for (const label of Object.keys(strengthScores)) {
    if (weaknessScores[label] !== undefined) {
      if (strengthScores[label] >= weaknessScores[label]) delete weaknessScores[label];
      else delete strengthScores[label];
    }
  }

  const strengths  = Object.entries(strengthScores)
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);
  const weaknesses = Object.entries(weaknessScores)
    .sort((a, b) => b[1] - a[1]).slice(0, 5).map(([l]) => l);

  log('[DP] final strengths :', strengths);
  log('[DP] final weaknesses:', weaknesses);

  // Fallback: all fields empty — infer from role + result
  if (strengths.length === 0 && weaknesses.length === 0) {
    log('[DP] All fields empty — inferring from role/result');
    const failedTopics = [];
    const passedTopics = [];

    for (const entry of diaries) {
      const inferred = inferTopicsFromRole(entry.role);
      const r = entry.result?.toLowerCase().trim();
      if (r === 'passed') passedTopics.push(...inferred);
      else                failedTopics.push(...inferred);
    }

    const passedSet = new Set(passedTopics);
    const failedSet = new Set(failedTopics);
    const inferredStrong = [...passedSet].filter(t => !failedSet.has(t)).slice(0, 4);
    const inferredWeak   = [...failedSet].filter(t => !passedSet.has(t)).slice(0, 4);

    if (inferredStrong.length === 0 && inferredWeak.length === 0) {
      const all = [...new Set([...passedTopics, ...failedTopics])];
      const mid = Math.ceil(all.length / 2);
      return { strengths: all.slice(0, mid), weaknesses: all.slice(mid) };
    }

    return { strengths: inferredStrong, weaknesses: inferredWeak };
  }

  return { strengths, weaknesses };
}


// Role → likely interview topics (used when all text fields are empty)
const ROLE_TOPIC_MAP = [
  { pattern: /full.?stack|fsd|mern|mean/i,         topics: ['React / Frontend', 'Backend / APIs', 'Databases', 'Core Languages'] },
  { pattern: /frontend|ui|react|angular|vue/i,      topics: ['React / Frontend', 'Core Languages', 'OOPs'] },
  { pattern: /backend|server|api|node|java\b/i,     topics: ['Backend / APIs', 'Databases', 'Core Languages'] },
  { pattern: /sde|software\s*(dev|eng)|programmer/i,topics: ['DSA', 'System Design', 'OOPs', 'Core Languages'] },
  { pattern: /web\s*dev/i,                          topics: ['React / Frontend', 'Core Languages', 'Databases'] },
  { pattern: /data\s*(sci|eng|analyst)|ml|ai/i,     topics: ['ML / AI', 'Databases', 'Core Languages'] },
  { pattern: /devops|cloud|infra|site\s*rel/i,      topics: ['DevOps / Cloud', 'Networking', 'Operating Systems'] },
  { pattern: /mobile|android|ios|flutter/i,         topics: ['React / Frontend', 'Core Languages', 'OOPs'] },
];

function inferTopicsFromRole(role) {
  if (!role) return [];
  for (const { pattern, topics } of ROLE_TOPIC_MAP) {
    if (pattern.test(role)) return topics;
  }
  // Generic fallback for any tech role
  return ['DSA', 'Core Languages', 'Behavioral'];
}

// ----------------------------------------
// 4. Pattern Recognition Endpoint
// ----------------------------------------
router.post('/pattern-recognition', auth, async (req, res) => {
  try {
    const diaries = await Diary.find({ userId: req.user.id });
    if (diaries.length === 0) {
      return res.json(null);
    }

    console.log(`\n[Pattern] ══ REAL DATA (${diaries.length} entries) ══`);
    diaries.forEach((d, i) => {
      console.log(`[Pattern] Entry ${i + 1}: company="${d.company}" result="${d.result}" struggles="${d.struggles}" keyLearnings="${d.keyLearnings}" topics="${d.topics}" weakness="${d.weakness}" learnings="${d.learnings}"`);
    });

    const result = deterministicPatterns(diaries, true);   // debug=true → full trace
    console.log('[Pattern] ══ FINAL RESPONSE ══', result);
    return res.json(result);
  } catch (err) {
    console.error('[pattern-recognition]', err.stack || err.message);
    res.status(500).json({ msg: 'Pattern recognition error', error: err.message });
  }
});

module.exports = router;

