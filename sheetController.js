import { JWT } from 'google-auth-library';
import fs from 'fs/promises';
import { GoogleSpreadsheet } from 'google-spreadsheet';


const data = await fs.readFile(`./keys/${process.env.SHEET_AUTH_FILE}`, 'utf8');
const creds = JSON.parse(data);
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets'
];
const jwt = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: SCOPES,
});

export async function getWebsitesFinished() {
    const doc = new GoogleSpreadsheet(process.env.SHEET_FILE_ID, jwt);
    await doc.loadInfo();
    let data = [];

    for(let i = 0; i < doc.sheetCount; i++) {
        const sheet = doc.sheetsByIndex[i];
        const rows = await sheet.getRows();
        data.push({
            "websitesFinished": rows[0].get('Websites Finished'),
            "lastUpdated": rows[0].get('Last Updated'),
        });
    }
    return data;
}