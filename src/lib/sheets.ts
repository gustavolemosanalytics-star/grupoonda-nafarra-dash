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
const GID_INGRESSE_TIMELINE = '631411023';
const GID_INGRESSE_COMISSARIOS = '1797204899';
const GID_INGRESSE_GENERO = '1480455280';
const GID_INGRESSE_IDADE = '2102251348';
const GID_INGRESSE_PAGAMENTO = '391085550';
const GID_INGRESSE_ESTADO = '249163603';
const GID_INGRESSE_CIDADE = '1942719994';

export interface IngresseTimelineData {
    dataVenda: string;
    quantidade: number;
    valor: number;
    dataEvento: string;
    evento: string;
    cidade: string;
    estado: string;
}

export interface IngresseComissarioData {
    passkey: string;
    ingressos: number;
    receita: number;
}

export interface IngresseGeneroData {
    genero: string;
    porcentagem: number;
    dataEvento: string;
    evento: string;
    cidade: string;
    estado: string;
}

export interface IngresseIdadeData {
    faixaEtaria: string;
    porcentagem: number;
    dataEvento: string;
    evento: string;
    cidade: string;
    estado: string;
}

export interface IngressePagamentoData {
    tipoPagamento: string;
    parcelas: string;
    ingressos: number;
    receita: number;
    dataEvento: string;
    evento: string;
    cidade: string;
    estado: string;
}

export interface IngresseEstadoData {
    estado: string;
    ingressos: number;
    faturamento: number;
    dataEvento: string;
    evento: string;
    cidade: string;
    estadoOriginal: string;
}

export interface IngresseCidadeData {
    cidade: string;
    ingressos: number;
    faturamento: number;
    dataEvento: string;
    evento: string;
    estado: string;
}

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
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

async function getRowsFromSheet(gid: string) {
    try {
        const auth = await getAuth();
        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();
        const sheet = doc.sheetsById[gid];
        if (!sheet) throw new Error(`Sheet with GID ${gid} not found`);

        try {
            const rows = await sheet.getRows();
            console.log(`Fetched ${rows.length} rows for GID ${gid}`);
            return rows.map(row => row.toObject());
        } catch (e: any) {
            if (e.message.includes('Duplicate header detected')) {
                console.warn(`Duplicate headers in GID ${gid}, falling back to cell-based loading`);
                await sheet.loadCells(); // Load all cells

                const rows: any[] = [];
                const headerRow = 0;
                const headers: string[] = [];

                // Get headers (1st row)
                for (let col = 0; col < sheet.columnCount; col++) {
                    const cell = sheet.getCell(headerRow, col);
                    if (cell.value === null || cell.value === undefined) break;
                    headers.push(String(cell.value));
                }

                // Get data
                for (let rowIdx = 1; rowIdx < sheet.rowCount; rowIdx++) {
                    const rowData: any = {};
                    let hasData = false;
                    for (let col = 0; col < headers.length; col++) {
                        const cell = sheet.getCell(rowIdx, col);
                        // Store the first occurrence of a header if duplicates exist
                        // Or store both if needed? For now, first match is fine for the requested fields.
                        const header = headers[col];
                        if (rowData[header] === undefined) {
                            rowData[header] = cell.value;
                        } else {
                            // If it's a duplicate, we might need the second one if the first is empty
                            // but usually it's better to just keep track of all indices
                            rowData[`${header}_${col}`] = cell.value;
                        }
                        if (cell.value !== null && cell.value !== undefined) hasData = true;
                    }
                    if (!hasData) break;
                    rows.push(rowData);
                }
                return rows;
            }
            throw e;
        }
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

export async function getIngresseTimelineData(): Promise<IngresseTimelineData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_TIMELINE);
    return data.map((row) => ({
        dataVenda: String(row['Data da Venda'] || ''),
        quantidade: parseFloat(String(row['Quantidade de Ingressos'])) || 0,
        valor: parseCurrency(String(row['Valor'])),
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estado: String(row['Estado'] || ''),
    }));
}

export async function getIngresseComissarioData(): Promise<IngresseComissarioData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_COMISSARIOS);
    return data.map((row) => ({
        passkey: String(row['Passkey'] || ''),
        ingressos: parseFloat(String(row['Nº Total de Ingressos'])) || 0,
        receita: parseCurrency(String(row['Receita'])),
    }));
}

export async function getIngresseGeneroData(): Promise<IngresseGeneroData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_GENERO);
    return data.map((row) => ({
        genero: String(row['genero'] || ''),
        porcentagem: parseFloat(String(row['porcentagem']).replace('%', '').replace(',', '.')) || 0,
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estado: String(row['Estado'] || ''),
    }));
}

export async function getIngresseIdadeData(): Promise<IngresseIdadeData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_IDADE);
    return data.map((row) => ({
        faixaEtaria: String(row['faixa_etaria'] || ''),
        porcentagem: parseFloat(String(row['porcentagem']).replace('%', '').replace(',', '.')) || 0,
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estado: String(row['Estado'] || ''),
    }));
}

export async function getIngressePagamentoData(): Promise<IngressePagamentoData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_PAGAMENTO);
    return data.map((row) => ({
        tipoPagamento: String(row['Tipo de Pagamento'] || ''),
        parcelas: String(row['Parcelas'] || ''),
        ingressos: parseFloat(String(row['Ingressos'])) || 0,
        receita: parseCurrency(String(row['Receita'])),
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estado: String(row['Estado'] || ''),
    }));
}

export async function getIngresseEstadoData(): Promise<IngresseEstadoData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_ESTADO);
    return data.map((row) => ({
        estado: String(row['Estado'] || ''),
        ingressos: parseFloat(String(row['Nº Ingressos'])) || 0,
        faturamento: parseCurrency(String(row['Faturamento Ingressos'])),
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        cidade: String(row['Cidade'] || ''),
        estadoOriginal: String(row['Estado'] || ''),
    }));
}

export async function getIngresseCidadeData(): Promise<IngresseCidadeData[]> {
    const data = await getRowsFromSheet(GID_INGRESSE_CIDADE);
    return data.map((row) => ({
        cidade: String(row['Cidade'] || 'Sem Cidade').trim() || 'Sem Cidade',
        ingressos: parseFloat(String(row['Nº Ingressos'])) || 0,
        faturamento: parseCurrency(String(row['Faturamento Ingressos'])),
        dataEvento: String(row['Data do Evento'] || ''),
        evento: String(row['Evento'] || ''),
        estado: String(row['Estado'] || ''),
    }));
}

function parseCurrency(val: string): number {
    if (!val) return 0;
    // Handle currency strings like "R$ 1.234,56", " 136.590 ", " 44735.25 "
    let clean = val.replace('R$', '').trim();

    // If it has both dot and comma, assume Br format: 1.234,56
    if (clean.includes('.') && clean.includes(',')) {
        return parseFloat(clean.replace(/\./g, '').replace(',', '.')) || 0;
    }

    // If it has only a comma, it's likely the decimal separator: 1234,56
    if (clean.includes(',')) {
        return parseFloat(clean.replace(',', '.')) || 0;
    }

    // If it has only a dot:
    if (clean.includes('.')) {
        const parts = clean.split('.');
        // If the last part has exactly 3 digits and there is more than one part, 
        // it's likely a thousands separator (Br format) like "136.590"
        // But what if it's "44735.25"? 
        // We check if any segment before the dot has at least 1 digit.
        // Usually, in these sheets, if it's a decimal dot, it's like 44735.25 (2 decimals)
        // or 123.4 (1 decimal). If it's a thousands dot, it's 136.590 (3 digits after dot).
        const lastPart = parts[parts.length - 1];
        if (parts.length > 1 && lastPart.length === 3) {
            // Check if it's a round number used as thousands
            return parseFloat(clean.replace(/\./g, '')) || 0;
        }
        // Otherwise assume it's a decimal dot (US format)
        return parseFloat(clean) || 0;
    }

    return parseFloat(clean) || 0;
}
