'use client';

import React from 'react';
import { Search, Bell, Calendar, Filter } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function TopBar() {
    const { filters, setFilters, availableFilters } = useData();

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <header className="fixed top-0 right-0 left-[var(--sidebar-width)] h-[var(--header-height)] bg-black/90 backdrop-blur-sm border-b-4 border-white z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
                <div className="flex items-center gap-2 text-[#CCFF00]">
                    <Filter className="w-5 h-5" />
                    <span className="text-xs font-black uppercase italic">Filtros Ativos:</span>
                </div>
                <div className="flex gap-4">
                    <FilterSelect
                        label="EVENTO"
                        value={filters.evento}
                        options={availableFilters.eventos}
                        onChange={(v) => handleFilterChange('evento', v)}
                        color="border-[#FF4D00]"
                    />
                    <FilterSelect
                        label="CIDADE"
                        value={filters.cidade}
                        options={availableFilters.cidades}
                        onChange={(v) => handleFilterChange('cidade', v)}
                        color="border-[#007AFF]"
                    />
                    <FilterSelect
                        label="DATA"
                        value={filters.data}
                        options={availableFilters.datas}
                        onChange={(v) => handleFilterChange('data', v)}
                        color="border-[#CCFF00]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="bg-[#FF4D00] px-4 py-2 border-2 border-black shadow-[4px_4px_0px_#fff] flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-black" />
                    <span className="text-xs font-black text-black italic uppercase">Jan 2026</span>
                </div>

                <button className="w-12 h-12 bg-white flex items-center justify-center border-2 border-black hover:bg-[#CCFF00] transition-colors shadow-[4px_4px_0px_#FF4D00]">
                    <Bell className="w-6 h-6 text-black" />
                </button>
            </div>
        </header>
    );
}

function FilterSelect({ label, value, options, onChange, color }: { label: string, value: string, options: string[], onChange: (v: string) => void, color: string }) {
    return (
        <div className="relative group">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`bg-black text-white border-2 ${color} px-4 py-2 text-xs font-black italic cursor-pointer focus:outline-none hover:bg-white hover:text-black transition-all appearance-none pr-8 min-w-[120px]`}
            >
                <option value="" className="bg-black text-white">{label}</option>
                {options.map(opt => (
                    <option key={opt} value={opt} className="bg-black text-white">{opt}</option>
                ))}
            </select>
            <div className={`absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] ${color.replace('border-', 'border-t-')} pointer-events-none group-hover:border-t-black`} />
        </div>
    );
}
