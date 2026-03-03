const fs = require('fs');
const path = require('path');

const arPath = path.join(process.cwd(), 'src/locales/ar/translation.json');
const raw = fs.readFileSync(arPath, 'utf8');

let parsed;
try {
  parsed = JSON.parse(raw);
} catch (error) {
  console.error('Arabic locale JSON is invalid:', error.message);
  process.exit(1);
}

const hasArabic = (text) => /[\u0600-\u06FF]/.test(text);
const hasLatin = (text) => /[A-Za-z]/.test(text);
const hasQuestionRuns = (text) => /\?{3,}/.test(text);
const hasMojibake = (text) => /[ØÙÃÂ][^\s]{0,2}/.test(text);

const findings = {
  questionRuns: [],
  mojibake: [],
  totalLeafStrings: 0,
  humanReadableLeafStrings: 0,
  stringsWithArabicScript: 0
};

function walk(node, keyPath = '') {
  if (typeof node === 'string') {
    findings.totalLeafStrings += 1;
    const text = node.trim();
    const isHumanReadable = text.length >= 4 && (hasArabic(text) || hasLatin(text));

    if (isHumanReadable) {
      findings.humanReadableLeafStrings += 1;
      if (hasArabic(text)) {
        findings.stringsWithArabicScript += 1;
      }
    }

    if (hasQuestionRuns(text)) {
      findings.questionRuns.push(keyPath);
    }
    if (hasMojibake(text)) {
      findings.mojibake.push(keyPath);
    }
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((item, idx) => walk(item, `${keyPath}[${idx}]`));
    return;
  }

  if (node && typeof node === 'object') {
    Object.entries(node).forEach(([k, v]) => {
      const nextPath = keyPath ? `${keyPath}.${k}` : k;
      walk(v, nextPath);
    });
  }
}

walk(parsed, '');

const arabicCoverage = findings.humanReadableLeafStrings
  ? findings.stringsWithArabicScript / findings.humanReadableLeafStrings
  : 0;

const MIN_ARABIC_COVERAGE = 0.2;

const hasBlockingIssues =
  findings.questionRuns.length > 0 ||
  findings.mojibake.length > 0 ||
  arabicCoverage < MIN_ARABIC_COVERAGE;

if (findings.questionRuns.length > 0) {
  console.error('\nArabic locale contains placeholder/corrupted question marks (???):');
  findings.questionRuns.slice(0, 50).forEach((p) => console.error(`- ${p}`));
  if (findings.questionRuns.length > 50) {
    console.error(`... and ${findings.questionRuns.length - 50} more`);
  }
}

if (findings.mojibake.length > 0) {
  console.error('\nArabic locale contains mojibake-like text (e.g. ØÙ...):');
  findings.mojibake.slice(0, 50).forEach((p) => console.error(`- ${p}`));
  if (findings.mojibake.length > 50) {
    console.error(`... and ${findings.mojibake.length - 50} more`);
  }
}

console.log(
  `\nArabic script coverage: ${(arabicCoverage * 100).toFixed(2)}% ` +
  `(${findings.stringsWithArabicScript}/${findings.humanReadableLeafStrings} human-readable strings)`
);

if (arabicCoverage < MIN_ARABIC_COVERAGE) {
  console.error(
    `Arabic script coverage is too low. Expected >= ${(MIN_ARABIC_COVERAGE * 100).toFixed(0)}%.`
  );
}

if (hasBlockingIssues) {
  process.exit(1);
}

console.log('Arabic locale integrity check passed.');
