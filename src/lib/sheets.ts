import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

export interface ZigData {
    dataEvento: string;
    evento: string;
    cidade: string;
    estado: string;
    tipo: string;
    nome: string;
    categoria: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
}

export interface FinanceData {
    dataEvento: string;
    evento: string;
    cidade: string;
    estado: string;
    descricao: string;
    valor: number;
    categoria: string;
    tipo: 'CUSTO' | 'RECEITA';
    qtdIngressos: number;
}

const SHEET_ID = '1U14ne7suYZCAuzDTnR0Yztx0wrkisu7njBIOFyC2NTk';
const GID_ZIG = '0';
const GID_FINANCE = '1192804610';

async function getAuth() {
    let creds: any;

    // 1. Try environment variable
    if (process.env.GOOGLE_CREDENTIALS) {
        try {
            creds = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        } catch (e) {
            console.error('Error parsing GOOGLE_CREDENTIALS env var:', e);
        }
    }

    // 2. Try local file if env var failed or not present
    if (!creds) {
        try {
            const credsPath = path.join(process.cwd(), 'credentials.json');
            if (fs.existsSync(credsPath)) {
                creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            }
        } catch (e) {
            console.error('Error reading credentials.json:', e);
        }
    }

    if (!creds) {
        throw new Error('Google credentials not found (GOOGLE_CREDENTIALS or credentials.json)');
    }

    return new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
}

async function getRowsFromSheet(gid: string) {
    try {
        const auth = await getAuth();
        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsById[gid];
        if (!sheet) throw new Error(`Sheet with GID ${gid} not found`);
        const rows = await sheet.getRows();
        console.log(`Fetched ${rows.length} rows for GID ${gid}`);
        if (rows.length > 0) {
            console.log('Sample row keys:', Object.keys(rows[0].toObject()));
        }
        return rows.map(row => row.toObject());
    } catch (error) {
        console.error(`Error fetching rows for GID ${gid}:`, error);
        throw error;
    }
}

export async function getZigData(): Promise<ZigData[]> {
    const data = await getRowsFromSheet(GID_ZIG);
    return data.map((row) => ({
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estado: String(row['Estado'] || ''),
        tipo: String(row['Tipo'] || ''),
        nome: String(row['Nome'] || ''),
        categoria: String(row['Categoria'] || ''),
        quantidade: parseFloat(String(row['Quantidade'])) || 0,
        valorUnitario: parseCurrency(String(row['Valor unitário'])),
        valorTotal: parseCurrency(String(row['Valor total'])),
    }));
}

export async function getFinanceData(): Promise<FinanceData[]> {
    const data = await getRowsFromSheet(GID_FINANCE);
    return data.map((row) => ({
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estado: String(row['Estado'] || ''),
        descricao: String(row['Descrição'] || ''),
        valor: parseCurrency(String(row['Valor'])),
        categoria: String(row['Categoria'] || ''),
        tipo: row['Tipo'] as 'CUSTO' | 'RECEITA',
        qtdIngressos: parseFloat(String(row['QTD Ingressos'])) || 0,
    }));
}

function parseCurrency(val: string): number {
    if (!val) return 0;
    // Handle currency strings like "R$ 1.234,56" or pure numbers
    const clean = val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(clean) || 0;
}
