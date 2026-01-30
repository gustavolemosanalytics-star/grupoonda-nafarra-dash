import { NextResponse } from 'next/server';
import {
    getZigData,
    getFinanceData,
    getIngresseTimelineData,
    getIngresseComissarioData,
    getIngresseGeneroData,
    getIngresseIdadeData,
    getIngressePagamentoData,
    getIngresseEstadoData,
    getIngresseCidadeData
} from '@/lib/sheets';

export async function GET() {
    try {
        const [
            zig,
            finance,
            ingresseTimeline,
            ingresseComissarios,
            ingresseGenero,
            ingresseIdade,
            ingressePagamento,
            ingresseEstado,
            ingresseCidade
        ] = await Promise.all([
            getZigData(),
            getFinanceData(),
            getIngresseTimelineData(),
            getIngresseComissarioData(),
            getIngresseGeneroData(),
            getIngresseIdadeData(),
            getIngressePagamentoData(),
            getIngresseEstadoData(),
            getIngresseCidadeData()
        ]);

        return NextResponse.json({
            zig,
            finance,
            ingresseTimeline,
            ingresseComissarios,
            ingresseGenero,
            ingresseIdade,
            ingressePagamento,
            ingresseEstado,
            ingresseCidade
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
