'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    ZigData,
    FinanceData,
    IngresseTimelineData,
    IngresseComissarioData,
    IngresseGeneroData,
    IngresseIdadeData,
    IngressePagamentoData,
    IngresseEstadoData,
    IngresseCidadeData
} from '@/lib/sheets';

interface DataContextType {
    zigData: ZigData[];
    financeData: FinanceData[];
    ingresseTimeline: IngresseTimelineData[];
    ingresseComissarios: IngresseComissarioData[];
    ingresseGenero: IngresseGeneroData[];
    ingresseIdade: IngresseIdadeData[];
    ingressePagamento: IngressePagamentoData[];
    ingresseEstado: IngresseEstadoData[];
    ingresseCidade: IngresseCidadeData[];
    loading: boolean;
    filters: {
        data: string;
        cidade: string;
        estado: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<DataContextType['filters']>>;
    availableFilters: {
        datas: string[];
        cidades: string[];
        estados: string[];
    };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [zigData, setZigData] = useState<ZigData[]>([]);
    const [financeData, setFinanceData] = useState<FinanceData[]>([]);
    const [ingresseTimeline, setIngresseTimeline] = useState<IngresseTimelineData[]>([]);
    const [ingresseComissarios, setIngresseComissarios] = useState<IngresseComissarioData[]>([]);
    const [ingresseGenero, setIngresseGenero] = useState<IngresseGeneroData[]>([]);
    const [ingresseIdade, setIngresseIdade] = useState<IngresseIdadeData[]>([]);
    const [ingressePagamento, setIngressePagamento] = useState<IngressePagamentoData[]>([]);
    const [ingresseEstado, setIngresseEstado] = useState<IngresseEstadoData[]>([]);
    const [ingresseCidade, setIngresseCidade] = useState<IngresseCidadeData[]>([]);

    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        data: '',
        cidade: '',
        estado: '',
    });

    const [availableFilters, setAvailableFilters] = useState({
        datas: [] as string[],
        cidades: [] as string[],
        estados: [] as string[],
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/data');
                const data = await response.json();
                setZigData(data.zig);
                setFinanceData(data.finance);
                setIngresseTimeline(data.ingresseTimeline);
                setIngresseComissarios(data.ingresseComissarios);
                setIngresseGenero(data.ingresseGenero);
                setIngresseIdade(data.ingresseIdade);
                setIngressePagamento(data.ingressePagamento);
                setIngresseEstado(data.ingresseEstado);
                setIngresseCidade(data.ingresseCidade);

                // Extract available filters from Zig data AND Ingresse data
                const zigDatas = data.zig.map((d: ZigData) => d.dataEvento);
                const zigCidades = data.zig.map((d: ZigData) => d.cidade);
                const zigEstados = data.zig.map((d: ZigData) => d.estado);

                const ingresseDatas = data.ingresseTimeline.map((d: IngresseTimelineData) => d.dataEvento);
                const ingresseCidades = data.ingresseTimeline.map((d: IngresseTimelineData) => d.cidade);
                const ingresseEstados = data.ingresseTimeline.map((d: IngresseTimelineData) => d.estado);

                const datas = Array.from(new Set([...zigDatas, ...ingresseDatas])).filter(Boolean) as string[];
                const cidades = Array.from(new Set([...zigCidades, ...ingresseCidades])).filter(Boolean) as string[];
                const estados = Array.from(new Set([...zigEstados, ...ingresseEstados])).filter(Boolean) as string[];

                setAvailableFilters({ datas, cidades, estados });

                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch data', error);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <DataContext.Provider value={{
            zigData,
            financeData,
            ingresseTimeline,
            ingresseComissarios,
            ingresseGenero,
            ingresseIdade,
            ingressePagamento,
            ingresseEstado,
            ingresseCidade,
            loading,
            filters,
            setFilters,
            availableFilters
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
