import Papa from 'papaparse';

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

const SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1U14ne7suYZCAuzDTnR0Yztx0wrkisu7njBIOFyC2NTk/export?format=csv&gid=';
const GID_ZIG = '0';
const GID_FINANCE = '1192804610';

async function fetchCSV(gid: string) {
    const response = await fetch(`${SHEETS_URL}${gid}`, { cache: 'no-store' });
    const csvText = await response.text();
    return new Promise<any[]>((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
        });
    });
}

export async function getZigData(): Promise<ZigData[]> {
    const data = await fetchCSV(GID_ZIG);
    return data.map((row) => ({
        dataEvento: row['Data do Evento'],
        evento: row['Evento'],
        cidade: row['Cidade'],
        estado: row['Estado'],
        tipo: row['Tipo'],
        nome: row['Nome'],
        categoria: row['Categoria'],
        quantidade: parseFloat(row['Quantidade']) || 0,
        valorUnitario: parseCurrency(row['Valor unitário']),
        valorTotal: parseCurrency(row['Valor total']),
    }));
}

export async function getFinanceData(): Promise<FinanceData[]> {
    const data = await fetchCSV(GID_FINANCE);
    return data.map((row) => ({
        dataEvento: row['Data do Evento'],
        evento: row['Evento'],
        cidade: row['Cidade'],
        estado: row['Estado'],
        descricao: row['Descrição'],
        valor: parseCurrency(row['Valor']),
        categoria: row['Categoria'],
        tipo: row['Tipo'] as 'CUSTO' | 'RECEITA',
        qtdIngressos: parseFloat(row['QTD Ingressos']) || 0,
    }));
}

function parseCurrency(val: string): number {
    if (!val) return 0;
    return parseFloat(val.replace('R$', '').replace(/\./g, '').replace(',', '.')) || 0;
}
