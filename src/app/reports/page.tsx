'use client';

import React, { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, Cell, LineChart, Line, Legend, AreaChart, Area, LabelList, ComposedChart
} from 'recharts';
import { Brain, TrendingUp, Users, Target, Zap, Waves, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';

const BRAND_COLORS = ['#FF4D00', '#CCFF00', '#007AFF', '#FFFFFF', '#333333'];

export default function ReportsPage() {
    const { zigData, financeData, loading, filters } = useData();

    const filteredZig = useMemo(() => {
        return zigData.filter(item => {
            const matchData = !filters.data || item.dataEvento === filters.data;
            const matchCidade = !filters.cidade || item.cidade === filters.cidade;
            const matchEstado = !filters.estado || item.estado === filters.estado;
            return matchData && matchCidade && matchEstado;
        });
    }, [zigData, filters]);

    const filteredFinance = useMemo(() => {
        return financeData.filter(item => {
            const matchData = !filters.data || item.dataEvento === filters.data;
            const matchCidade = !filters.cidade || item.cidade === filters.cidade;
            const matchEstado = !filters.estado || item.estado === filters.estado;
            return matchData && matchCidade && matchEstado;
        });
    }, [financeData, filters]);

    const analytics = useMemo(() => {
        if (loading) return null;

        // 1. Efficiency: Profit vs Courtesy % by Location
        const locations = Array.from(new Set(filteredFinance.map(d => `${d.cidade} - ${d.estado}`)));
        const efficiencyData = locations.map(loc => {
            const locData = filteredFinance.filter(d => `${d.cidade} - ${d.estado}` === loc);
            const rev = locData.filter(d => d.tipo === 'RECEITA').reduce((acc, d) => acc + d.valor, 0);
            const cst = locData.filter(d => d.tipo === 'CUSTO').reduce((acc, d) => acc + d.valor, 0);
            const profit = rev - cst;
            const totalTix = locData.reduce((acc, d) => acc + d.qtdIngressos, 0);
            const courtesies = locData.filter(d => d.descricao === 'CORTESIAS').reduce((acc, d) => acc + d.qtdIngressos, 0);
            const courtesyRate = totalTix > 0 ? (courtesies / totalTix) * 100 : 0;
            return { name: loc, profit, courtesyRate, totalTix };
        });

        // 2. Ticket Médio by Category (Zig)
        const itemsByCat = filteredZig.reduce((acc: any, d) => {
            if (!acc[d.categoria]) acc[d.categoria] = { totalRev: 0, totalQty: 0 };
            acc[d.categoria].totalRev += d.valorTotal;
            acc[d.categoria].totalQty += d.quantidade;
            return acc;
        }, {});

        const ticketByCat = Object.entries(itemsByCat).map(([name, data]: any) => ({
            name,
            "Ticket Médio R$": data.totalQty > 0 ? data.totalRev / data.totalQty : 0
        })).sort((a, b) => b["Ticket Médio R$"] - a["Ticket Médio R$"]).slice(0, 10);

        // 3. Correlation: Volume vs Revenue (Zig) by Location
        const correlationData = locations.map(loc => {
            const locZig = filteredZig.filter(d => `${d.cidade} - ${d.estado}` === loc);
            return {
                name: loc,
                "Quantidade": locZig.reduce((acc, d) => acc + d.quantidade, 0),
                "Receita R$": locZig.reduce((acc, d) => acc + d.valorTotal, 0)
            };
        }).filter(d => d["Quantidade"] > 0 || d["Receita R$"] > 0);

        return { efficiencyData, ticketByCat, correlationData };
    }, [filteredZig, filteredFinance, loading]);

    if (loading) return null;
    if (!analytics) return null;

    return (
        <div className="space-y-12 pb-20">
            {/* Reports Hero */}
            <div className="relative overflow-hidden bg-[#007AFF] p-10 border-4 border-black shadow-[10px_10px_0px_#fff]">
                <div className="absolute top-0 right-0 w-64 h-64 halftone-bg opacity-20 rotate-12 -translate-y-1/2 translate-x-1/4" />
                <h2 className="text-6xl font-black italic text-white tracking-tighter leading-none mb-4 uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    ANÁLISES & INSIGHTS
                </h2>
                <div className="flex gap-4">
                    <span className="bg-black text-[#007AFF] px-3 py-1 text-sm font-black italic">ESTRATÉGIA DE DADOS</span>
                    <span className="bg-white text-black px-3 py-1 text-sm font-black italic border-2 border-black uppercase italic font-black text-blue-600">Deep Dive</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Insight 1: Efficiency Scatter */}
                <div className="urban-card p-8 bg-black border-2 border-white">
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-[#FF4D00] pb-2">
                        <Brain className="w-6 h-6 text-[#FF4D00]" />
                        <h3 className="text-xl font-black italic text-white uppercase">CORTESIA VS LUCRATIVIDADE</h3>
                    </div>
                    <p className="text-xs text-white/40 mb-8 font-black uppercase tracking-widest italic">Análise de como a distribuição de cortesias afeta o resultado líquido final do evento.</p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart>
                                <XAxis type="number" dataKey="courtesyRate" name="Cortesias" unit="%" stroke="#fff" fontSize={10} fontWeight="900" />
                                <YAxis type="number" dataKey="profit" name="Lucro" stroke="#fff" fontSize={10} fontWeight="900" />
                                <ZAxis type="number" dataKey="totalTix" range={[100, 1000]} name="Volume" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Scatter data={analytics.efficiencyData} fill="#CCFF00" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 bg-[#FF4D00]/10 border-l-4 border-[#FF4D00] p-4 text-xs italic font-bold">
                        <span className="text-[#FF4D00] uppercase font-black">INSIGHT:</span> Eventos com cortesias acima de 15% tendem a ter uma margem de segurança reduzida, mesmo com alto volume.
                    </div>
                </div>

                {/* Insight 2: Avg Ticket by Category */}
                <div className="urban-card p-8 bg-black border-2 border-white">
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-[#CCFF00] pb-2">
                        <Target className="w-6 h-6 text-[#CCFF00]" />
                        <h3 className="text-xl font-black italic text-white uppercase">TICKET MÉDIO POR CATEGORIA</h3>
                    </div>
                    <p className="text-xs text-white/40 mb-8 font-black uppercase tracking-widest italic">Onde o público gasta mais? Ticket médio calculado por tipo de categoria de venda.</p>
                    <div className="h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.ticketByCat} layout="vertical" margin={{ left: 20, right: 80 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#fff" fontSize={10} fontWeight="900" width={140} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(val: any) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                                <Bar dataKey="Ticket Médio R$" fill="#CCFF00" radius={[0, 0, 0, 0]} barSize={25}>
                                    <LabelList dataKey="Ticket Médio R$" position="right" fill="#fff" fontSize={11} fontWeight="900" formatter={(val: any) => `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 bg-[#CCFF00]/10 border-l-4 border-[#CCFF00] p-4 text-xs italic font-bold">
                        <span className="text-[#CCFF00] uppercase font-black">ESTRATÉGIA:</span> Focar ativações de marketing em categorias com ticket médio superior para maximizar a receita por cliente.
                    </div>
                </div>
            </div>

            {/* Full Width Insight: Correlation Area */}
            <div className="urban-card p-10 bg-[#FF4D00] border-black border-4 shadow-[10px_10px_0px_#fff]">
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                    <div>
                        <h3 className="text-3xl font-black italic text-white uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">RELAÇÃO VOLUME X RECEITA</h3>
                        <p className="text-sm font-bold text-white/70 uppercase">Consistência de performance entre diferentes praças e datas.</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-black" />
                </div>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={analytics.correlationData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} orientation="left" />
                            <YAxis yAxisId="right" stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} orientation="right" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any, name: any) => [
                                    name === "Faturamento R$" ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value,
                                    name
                                ]}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar yAxisId="right" dataKey="Quantidade" fill="#fff" barSize={40} opacity={0.6} name="Vol. de Vendas" />
                            <Area yAxisId="left" type="monotone" dataKey="Receita R$" stroke="#fff" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" name="Faturamento R$" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-8 flex gap-8 items-start">
                    <div className="flex-1 bg-black p-6 border-2 border-white">
                        <p className="text-xs text-[#CCFF00] font-black uppercase mb-1">O que este gráfico mostra?</p>
                        <p className="text-sm text-white font-bold leading-relaxed">
                            Este gráfico cruza o **Volume de Vendas (Barras Brancas)** com o **Faturamento (Linha Branca)**.
                            <br /><br />
                            📌 **Vol. de Vendas:** Representa a quantidade total de itens saindo do bar (tickets gerados). É o volume operacional puro.
                            <br />
                            📌 **Faturamento R$:** É o dinheiro real entrando no caixa.
                            <br /><br />
                            Se a linha sobe mais que as barras, significa que o **Ticket Médio** naquela praça é superior (o público está consumindo itens de maior valor).
                        </p>
                    </div>
                    <div className="hidden md:block w-48 text-white font-black italic text-xl tracking-tighter leading-none pt-4 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        DADOS TRADUZIDOS EM RESULTADO REAL.
                    </div>
                </div>
            </div>
        </div>
    );
}
