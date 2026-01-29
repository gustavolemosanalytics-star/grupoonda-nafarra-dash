'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Wallet, Ticket, Gift,
    ArrowUpRight, ArrowDownRight, ChevronRight, DollarSign,
    Activity, BarChart3, PieChart as PieIcon, Layers
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, CartesianGrid, LabelList
} from 'recharts';
import { clsx } from 'clsx';

const BRAND_COLORS = ['#FF4D00', '#CCFF00', '#007AFF', '#FFFFFF', '#333333'];

export default function FinancePage() {
    const { financeData, loading, filters } = useData();
    const [selectedCostCategory, setSelectedCostCategory] = useState<string | null>(null);
    const [selectedRevCategory, setSelectedRevCategory] = useState<string | null>(null);

    const filteredData = useMemo(() => {
        return financeData.filter(item => {
            const matchData = !filters.data || item.dataEvento === filters.data;
            const matchCidade = !filters.cidade || item.cidade === filters.cidade;
            const matchEstado = !filters.estado || item.estado === filters.estado;
            return matchData && matchCidade && matchEstado;
        });
    }, [financeData, filters]);

    const stats = useMemo(() => {
        const revenue = filteredData.filter(d => d.tipo === 'RECEITA').reduce((acc, d) => acc + d.valor, 0);
        const costs = filteredData.filter(d => d.tipo === 'CUSTO').reduce((acc, d) => acc + d.valor, 0);
        const result = revenue - costs;

        const totalTickets = filteredData.reduce((acc, d) => acc + d.qtdIngressos, 0);
        const courtesies = filteredData.filter(d => d.descricao === 'CORTESIAS').reduce((acc, d) => acc + d.qtdIngressos, 0);
        const paidTickets = totalTickets - courtesies;
        const courtesyRate = totalTickets > 0 ? (courtesies / totalTickets) * 100 : 0;

        return { revenue, costs, result, totalTickets, courtesies, paidTickets, courtesyRate };
    }, [filteredData]);

    const locationComparison = useMemo(() => {
        const locations = Array.from(new Set(financeData.map(d => `${d.cidade} - ${d.estado}`)));
        return locations.map(loc => {
            const locData = financeData.filter(d => `${d.cidade} - ${d.estado}` === loc);
            const rev = locData.filter(d => d.tipo === 'RECEITA').reduce((acc, d) => acc + d.valor, 0);
            const cst = locData.filter(d => d.tipo === 'CUSTO').reduce((acc, d) => acc + d.valor, 0);
            return { name: loc, "Receita R$": rev, "Custo R$": cst, "Resultado R$": rev - cst };
        }).filter(d => d["Receita R$"] > 0 || d["Custo R$"] > 0).slice(0, 5);
    }, [financeData]);

    const costsByCategory = useMemo(() => {
        const costs = filteredData.filter(d => d.tipo === 'CUSTO');
        const grouped = costs.reduce((acc: any, d) => {
            acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
            return acc;
        }, {});
        return Object.entries(grouped).map(([name, value]) => ({ name, "Valor R$": value as number })).sort((a, b) => (b["Valor R$"] as number) - (a["Valor R$"] as number));
    }, [filteredData]);

    const revByCategory = useMemo(() => {
        const revs = filteredData.filter(d => d.tipo === 'RECEITA');
        const grouped = revs.reduce((acc: any, d) => {
            acc[d.categoria] = (acc[d.categoria] || 0) + d.valor;
            return acc;
        }, {});
        return Object.entries(grouped).map(([name, value]) => ({ name, "Valor R$": value as number })).sort((a, b) => (b["Valor R$"] as number) - (a["Valor R$"] as number));
    }, [filteredData]);

    const costDetails = useMemo(() => {
        if (!selectedCostCategory) return [];
        return filteredData
            .filter(d => d.tipo === 'CUSTO' && d.categoria === selectedCostCategory)
            .map(d => ({ name: d.descricao, value: d.valor }))
            .sort((a, b) => b.value - a.value);
    }, [filteredData, selectedCostCategory]);

    const revDetails = useMemo(() => {
        if (!selectedRevCategory) return [];
        return filteredData
            .filter(d => d.tipo === 'RECEITA' && d.categoria === selectedRevCategory)
            .map(d => ({ name: d.descricao, value: d.valor }))
            .sort((a, b) => b.value - a.value);
    }, [filteredData, selectedRevCategory]);

    if (loading) return null;

    return (
        <div className="space-y-12 pb-20">
            {/* Finance Hero Header */}
            <div className="relative overflow-hidden bg-[#CCFF00] p-10 border-4 border-black shadow-[10px_10px_0px_#fff]">
                <div className="absolute top-0 right-0 w-64 h-64 halftone-bg opacity-10 rotate-12 -translate-y-1/2 translate-x-1/4" />
                <h2 className="text-6xl font-black italic text-white tracking-tighter leading-none mb-4 uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    RESULTADOS
                </h2>
                <div className="flex gap-4">
                    <span className="bg-black text-[#CCFF00] px-3 py-1 text-sm font-black italic">CORE BUSINESS</span>
                    <span className="bg-white text-black px-3 py-1 text-sm font-black italic border-2 border-black">FINANCIAL HUB</span>
                </div>
            </div>

            {/* Financial Health Indicators */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <UrbanKPI
                    title="RESULTADO REAL"
                    value={`R$ ${stats.result.toLocaleString('pt-BR')}`}
                    icon={Wallet}
                    color={stats.result >= 0 ? "#CCFF00" : "#FF4D00"}
                    subtitle="Lucro Líquido"
                    highlight
                    index={0}
                />
                <UrbanKPI
                    title="TOTAL INGRESSOS"
                    value={stats.totalTickets.toLocaleString()}
                    icon={Ticket}
                    subtitle={`${stats.paidTickets.toLocaleString()} Pagos`}
                    index={1}
                />
                <UrbanKPI
                    title="CORTESIAS"
                    value={stats.courtesies.toLocaleString()}
                    icon={Gift}
                    subtitle={`${stats.courtesyRate.toFixed(1)}% Ratio`}
                    color="#007AFF"
                    index={2}
                />
                <UrbanKPI
                    title="ROI EVENTO"
                    value={`${((stats.revenue / (stats.costs || 1)) * 100).toFixed(0)}%`}
                    icon={Activity}
                    subtitle="Revenue/Cost"
                    index={3}
                />
            </section>

            {/* COMPARISON CHART: Multi-Event Analysis */}
            <div className="urban-card p-8 bg-[#111]">
                <div className="flex items-center justify-between mb-8 border-b-2 border-white pb-4">
                    <div>
                        <h3 className="text-2xl font-black italic text-white uppercase">BENCHMARK DE EVENTOS</h3>
                        <p className="text-xs font-bold text-white/40 uppercase">Comparativo de Receita vs Custo entre Edições</p>
                    </div>
                    <Layers className="w-8 h-8 text-[#FF4D00]" />
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationComparison}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis dataKey="name" stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                            <YAxis stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }} itemStyle={{ color: '#CCFF00' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px', color: '#fff' }} />
                            <Bar dataKey="Receita R$" fill="#CCFF00" name="RECEITA">
                                <LabelList dataKey="Receita R$" position="top" fill="#fff" fontSize={10} formatter={(val: any) => `R$${(Number(val) / 1000).toFixed(0)}k`} />
                            </Bar>
                            <Bar dataKey="Custo R$" fill="#FF4D00" name="CUSTO">
                                <LabelList dataKey="Custo R$" position="top" fill="#fff" fontSize={10} formatter={(val: any) => `R$${(Number(val) / 1000).toFixed(0)}k`} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Costs Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic flex items-center gap-3">
                            <span className="w-4 h-8 bg-[#FF4D00]" />
                            GASTOS POR CATEGORIA
                        </h2>
                        <div className="bg-black text-[#FF4D00] border-2 border-[#FF4D00] px-4 py-1 text-xl font-black italic">
                            R$ {stats.costs.toLocaleString('pt-BR')}
                        </div>
                    </div>

                    <div className="urban-card p-6 halftone-bg">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={costsByCategory}
                                    onClick={(data) => {
                                        if (data && data.activeLabel) {
                                            setSelectedCostCategory(String(data.activeLabel));
                                        }
                                    }}
                                >
                                    <XAxis dataKey="name" stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,45,0,0.1)' }}
                                        contentStyle={{ background: '#000', border: '2px solid #fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar
                                        dataKey="Valor R$"
                                        fill="#FF4D00"
                                        className="cursor-pointer hover:opacity-80"
                                        radius={[0, 0, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-center text-[#FF4D00] font-black mt-4 uppercase tracking-[0.3em]">Clique para detalhar o custo</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedCostCategory && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="urban-card bg-black border-[#FF4D00] p-6"
                            >
                                <div className="flex justify-between items-center mb-6 border-b border-[#FF4D00] pb-2">
                                    <h4 className="text-xl font-black italic uppercase text-[#FF4D00]">{selectedCostCategory}</h4>
                                    <button onClick={() => setSelectedCostCategory(null)} className="text-[10px] bg-[#FF4D00] text-black px-2 py-1 font-black">CLOSE</button>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {costDetails.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group hover:bg-white/5 px-2 transition-colors">
                                            <span className="text-sm font-black italic text-white/60 group-hover:text-white uppercase tracking-tighter">{item.name}</span>
                                            <span className="text-lg font-black italic text-[#FF4D00]">R$ {item.value.toLocaleString('pt-BR')}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Revenue Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black italic flex items-center gap-3">
                            <span className="w-4 h-8 bg-[#007AFF]" />
                            FONTES DE RECEITA
                        </h2>
                        <div className="bg-black text-[#007AFF] border-2 border-[#007AFF] px-4 py-1 text-xl font-black italic">
                            R$ {stats.revenue.toLocaleString('pt-BR')}
                        </div>
                    </div>

                    <div className="urban-card p-6 bg-black">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="Valor R$"
                                        onClick={(data) => data && setSelectedRevCategory(data.name)}
                                    >
                                        {revByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} className="cursor-pointer border-2 border-black" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: '#000', border: '2px solid #fff' }} itemStyle={{ color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[10px] text-center text-[#007AFF] font-black mt-4 uppercase tracking-[0.3em]">Selecione a fonte para ver detalhes</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedRevCategory && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="urban-card bg-black border-[#007AFF] p-6"
                            >
                                <div className="flex justify-between items-center mb-6 border-b border-[#007AFF] pb-2">
                                    <h4 className="text-xl font-black italic uppercase text-[#007AFF]">{selectedRevCategory}</h4>
                                    <button onClick={() => setSelectedRevCategory(null)} className="text-[10px] bg-[#007AFF] text-black px-2 py-1 font-black">CLOSE</button>
                                </div>
                                <div className="space-y-3">
                                    {revDetails.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 transition-colors">
                                            <span className="text-sm font-black italic text-white/60 uppercase">{item.name}</span>
                                            <span className="text-lg font-black italic text-[#007AFF]">R$ {item.value.toLocaleString('pt-BR')}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function UrbanKPI({ title, value, icon: Icon, color, subtitle, highlight, index }: any) {
    return (
        <div className={clsx(
            "urban-card p-6 flex flex-col justify-between min-h-[160px]",
            highlight ? "bg-[#FF4D00] border-black border-4" : "bg-black border-white"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={clsx(
                    "w-12 h-12 bg-black flex items-center justify-center border-2 border-white",
                    highlight && "bg-white"
                )}>
                    <Icon className="w-6 h-6" style={{ color: highlight ? '#FF4D00' : (color || '#CCFF00') }} />
                </div>
                <div className="text-[30px] font-black text-white/5 italic select-none">
                    {index + 1}
                </div>
            </div>
            <div>
                <p className={clsx("text-[10px] font-black uppercase tracking-widest mb-1", highlight ? "text-white/90" : "text-white/40")}>{title}</p>
                <h3 className={clsx("text-2xl font-black italic tracking-tighter truncate text-white", highlight && "drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]")} style={{ color: !highlight && color ? color : undefined }}>
                    {value}
                </h3>
                <p className={clsx("text-[10px] font-bold mt-1 uppercase", highlight ? "text-white/70" : "text-white/20")}>{subtitle}</p>
            </div>
        </div>
    );
}
