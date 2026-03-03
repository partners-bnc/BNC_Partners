const fs = require('fs');
const https = require('https');

const en = JSON.parse(fs.readFileSync('src/locales/en/translation.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('src/locales/ar/translation.json', 'utf8'));

async function translate(text) {
    return new Promise((resolve, reject) => {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ar&dt=t&q=' + encodeURIComponent(text);
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed[0]) {
                        const translation = parsed[0].map(p => p[0]).join('');
                        resolve(translation);
                    } else {
                        resolve(text); // Fallback
                    }
                } catch (e) {
                    console.error('Parse error for text:', text, data);
                    resolve(text); // Fallback
                }
            });
        }).on('error', (err) => resolve(text));
    });
}

function extractBadKeys(e, a, path, badItems) {
    for (const key in e) {
        if (typeof e[key] === 'object' && e[key] !== null) {
            extractBadKeys(e[key], a[key] || {}, path ? path + '.' + key : key, badItems);
        } else {
            // Check if missing, same as English (and English actually has text), or has non-Arabic (like ?????)
            const isEnglish = e[key] === a[key] && e[key].length > 0;
            const hasNoArabic = !/[\u0600-\u06FF]/.test(a[key]);
            if (isEnglish || hasNoArabic || typeof a[key] === 'undefined') {
                badItems.push({
                    path: (path ? path + '.' : '') + key,
                    englishText: e[key],
                    refE: e,
                    refA: a,
                    key: key
                });
            }
        }
    }
}

const badItems = [];
extractBadKeys(en, ar, '', badItems);
console.log(`Found ${badItems.length} items to translate.`);

async function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function run() {
    for (let i = 0; i < badItems.length; i++) {
        const item = badItems[i];
        try {
            const translated = await translate(item.englishText);
            console.log(`[${i+1}/${badItems.length}] ${item.englishText} -> ${translated}`);
            item.refA[item.key] = translated;
        } catch (e) {
            console.error('Failed to translate:', item.englishText);
        }
        await delay(200); // 200ms delay to prevent rate limiting
    }
    
    fs.writeFileSync('src/locales/ar/translation.json', JSON.stringify(ar, null, 2) + '\n', 'utf8');
    console.log('Finished updating translation.json');
}

run();
