'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ZigData, FinanceData } from '@/lib/sheets';

interface DataContextType {
    zigData: ZigData[];
    financeData: FinanceData[];
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

                // Extract available filters from Zig data (common to both)
                const datas = Array.from(new Set(data.zig.map((d: ZigData) => d.dataEvento))).filter(Boolean) as string[];
                const cidades = Array.from(new Set(data.zig.map((d: ZigData) => d.cidade))).filter(Boolean) as string[];
                const estados = Array.from(new Set(data.zig.map((d: ZigData) => d.estado))).filter(Boolean) as string[];

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
        <DataContext.Provider value={{ zigData, financeData, loading, filters, setFilters, availableFilters }}>
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
