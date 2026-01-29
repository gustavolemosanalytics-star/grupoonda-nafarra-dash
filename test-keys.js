const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1U14ne7suYZCAuzDTnR0Yztx0wrkisu7njBIOFyC2NTk';
const GID_ZIG = '0';

async function test() {
    const credsPath = path.join(process.cwd(), 'credentials.json');
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

    const auth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsById[GID_ZIG];
    const rows = await sheet.getRows();
    console.log('Keys of row[0].toObject():', Object.keys(rows[0].toObject()));
    console.log('Sample data:', rows[0].toObject());
}

test().catch(console.error);
