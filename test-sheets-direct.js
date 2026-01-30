const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1U14ne7suYZCAuzDTnR0Yztx0wrkisu7njBIOFyC2NTk';

async function getAuth() {
    const credsPath = path.join(process.cwd(), 'credentials.json');
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    return new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
}

async function testGID(gid, name) {
    console.log(`Testing ${name} (GID ${gid})...`);
    try {
        const auth = await getAuth();
        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsById[gid];
        if (!sheet) throw new Error(`Sheet with GID ${gid} not found`);
        const rows = await sheet.getRows();
        console.log(`- ${name} OK: ${rows.length} rows`);
        if (rows.length > 0) {
            console.log(`- Sample keys: ${Object.keys(rows[0].toObject()).join(', ')}`);
        }
    } catch (e) {
        console.error(`- ${name} FAIL: ${e.message}`);
    }
}

async function runAll() {
    await testGID('0', 'ZIG');
    await testGID('1192804610', 'FINANCE');
    await testGID('631411023', 'TIMELINE');
    await testGID('1797204899', 'COMISSARIOS');
    await testGID('1480455280', 'GENERO');
    await testGID('2102251348', 'IDADE');
    await testGID('391085550', 'PAGAMENTO');
    await testGID('249163603', 'ESTADO');
    await testGID('1942719994', 'CIDADE');
}

runAll();
