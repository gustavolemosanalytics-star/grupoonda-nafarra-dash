import { NextResponse } from 'next/server';
import { getZigData, getFinanceData } from '@/lib/sheets';

export async function GET() {
    try {
        const [zig, finance] = await Promise.all([
            getZigData(),
            getFinanceData(),
        ]);

        return NextResponse.json({ zig, finance });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
