const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/Component/ExpertFormModal.jsx');
const source = fs.readFileSync(filePath, 'utf8');

const requiredCalls = [
  "t('expertFormModal.title')",
  "t('expertFormModal.subtitle')",
  "t('expertFormModal.sections.personal')",
  "t('expertFormModal.sections.contacts')",
  "t('expertFormModal.sections.requirement')",
  "t('expertFormModal.actions.submit')",
  "t('expertFormModal.actions.submitting')"
];

const forbiddenLiterals = [
  'Book a Consultation',
  'Fill in your details below. It will only take a minute.',
  'Personal Details',
  'Contacts',
  'Requirement Details',
  'Submit Details',
  'Submitting...'
];

const missingCalls = requiredCalls.filter((call) => !source.includes(call));
const foundForbidden = forbiddenLiterals.filter((text) => source.includes(text));

if (!source.includes("useTranslation")) {
  console.error('ExpertFormModal must use useTranslation from react-i18next.');
  process.exit(1);
}

if (missingCalls.length) {
  console.error('\nMissing required i18n calls in ExpertFormModal:');
  missingCalls.forEach((call) => console.error(`- ${call}`));
}

if (foundForbidden.length) {
  console.error('\nFound hardcoded literals in ExpertFormModal:');
  foundForbidden.forEach((text) => console.error(`- ${text}`));
}

if (missingCalls.length || foundForbidden.length) {
  process.exit(1);
}

console.log('ExpertFormModal i18n check passed.');
