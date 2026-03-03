const fs = require('fs');
const path = require('path');

const enPath = path.join(process.cwd(), 'src/locales/en/translation.json');
const arPath = path.join(process.cwd(), 'src/locales/ar/translation.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

function walkMissingInAr(enNode, arNode, prefix = '', missingInAr = [], typeMismatches = []) {
  if (isObject(enNode) && isObject(arNode)) {
    for (const k of Object.keys(enNode)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (!(k in arNode)) {
        missingInAr.push(p);
      } else {
        walkMissingInAr(enNode[k], arNode[k], p, missingInAr, typeMismatches);
      }
    }
    return { missingInAr, typeMismatches };
  }

  if (Array.isArray(enNode) && Array.isArray(arNode)) {
    if (arNode.length < enNode.length) {
      for (let i = arNode.length; i < enNode.length; i++) {
        missingInAr.push(`${prefix}[${i}]`);
      }
    }

    const max = Math.min(enNode.length, arNode.length);
    for (let i = 0; i < max; i++) {
      walkMissingInAr(enNode[i], arNode[i], `${prefix}[${i}]`, missingInAr, typeMismatches);
    }
    return { missingInAr, typeMismatches };
  }

  const enType = Array.isArray(enNode) ? 'array' : typeof enNode;
  const arType = Array.isArray(arNode) ? 'array' : typeof arNode;
  if (enType !== arType) {
    typeMismatches.push(`${prefix} (en:${enType} ar:${arType})`);
  }

  return { missingInAr, typeMismatches };
}

const result = walkMissingInAr(en, ar);

if (result.missingInAr.length) {
  console.error('\nMissing in Arabic locale:');
  result.missingInAr.forEach((k) => console.error(`- ${k}`));
}

if (result.typeMismatches.length) {
  console.error('\nType mismatches between English and Arabic locales:');
  result.typeMismatches.forEach((k) => console.error(`- ${k}`));
}

if (result.missingInAr.length || result.typeMismatches.length) {
  process.exit(1);
}

console.log('Locale parity check passed: all English keys exist in Arabic.');
