'use client';

import React, { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { motion } from 'framer-motion';
import { ShoppingCart, Ticket, DollarSign, TrendingUp, Utensils, GlassWater, Zap, BarChart3, Target } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, ComposedChart, Line, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LabelList
} from 'recharts';
import { clsx } from 'clsx';

const BRAND_COLORS = ['#FF4D00', '#CCFF00', '#007AFF', '#FFFFFF', '#333333'];

export default function ZigPage() {
    const { zigData, loading, filters } = useData();

    const filteredData = useMemo(() => {
        return zigData.filter(item => {
            const matchData = !filters.data || item.dataEvento === filters.data;
            const matchCidade = !filters.cidade || item.cidade === filters.cidade;
            const matchEstado = !filters.estado || item.estado === filters.estado;
            return matchData && matchCidade && matchEstado;
        });
    }, [zigData, filters]);

    const stats = useMemo(() => {
        const totalItems = filteredData.reduce((acc, item) => acc + item.quantidade, 0);
        const totalRevenue = filteredData.reduce((acc, item) => acc + item.valorTotal, 0);
        const averageTicket = totalItems > 0 ? totalRevenue / totalItems : 0;

        return { totalItems, totalRevenue, averageTicket };
    }, [filteredData]);

    const foodData = useMemo(() => {
        const food = filteredData.filter(item => item.tipo === 'Comida');
        const itemsByQuantity = food.reduce((acc: any, item) => {
            acc[item.nome] = (acc[item.nome] || 0) + item.quantidade;
            return acc;
        }, {});

        return Object.entries(itemsByQuantity)
            .map(([name, value]) => ({ name, value: value as number }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredData]);

    const drinkData = useMemo(() => {
        const drinks = filteredData.filter(item => item.tipo === 'Bebida');
        const itemsByQuantity = drinks.reduce((acc: any, item) => {
            acc[item.nome] = (acc[item.nome] || 0) + item.quantidade;
            return acc;
        }, {});

        return Object.entries(itemsByQuantity)
            .map(([name, value]) => ({ name, value: value as number }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [filteredData]);

    const categoryMix = useMemo(() => {
        const categories = Array.from(new Set(filteredData.map(d => d.categoria)));
        return categories.map(cat => {
            const catData = filteredData.filter(d => d.categoria === cat);
            return {
                subject: cat,
                A: catData.reduce((acc, d) => acc + d.quantidade, 0),
                fullMark: Math.max(...categories.map(c => filteredData.filter(d => d.categoria === c).reduce((acc, d) => acc + d.quantidade, 0)))
            };
        }).slice(0, 6);
    }, [filteredData]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center halftone-bg">
                <div className="animate-spin w-16 h-16 border-8 border-[#FF4D00] border-t-[#CCFF00]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Hero Header */}
            <div className="relative overflow-hidden bg-[#FF4D00] p-10 border-4 border-black shadow-[10px_10px_0px_#fff]">
                <div className="absolute top-0 right-0 w-64 h-64 halftone-bg opacity-20 rotate-12 -translate-y-1/2 translate-x-1/4" />
                <h2 className="text-6xl font-black italic text-white tracking-tighter leading-none mb-4 uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    VENDAS ZIG
                </h2>
                <div className="flex gap-4">
                    <span className="bg-black text-white px-3 py-1 text-sm font-black italic">SUMMER EDITION</span>
                    <span className="bg-white text-black px-3 py-1 text-sm font-black italic border-2 border-black">LIVE DATA</span>
                </div>
            </div>

            {/* Main KPIs */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <UrbanKPI
                    title="ITENS VENDIDOS"
                    value={stats.totalItems.toLocaleString()}
                    icon={Zap}
                    color="#CCFF00"
                    index={0}
                />
                <UrbanKPI
                    title="TICKET MÉDIO"
                    value={`R$ ${stats.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={Target}
                    color="#007AFF"
                    index={1}
                />
                <UrbanKPI
                    title="RECEITA BRUTA"
                    value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    color="#FFFFFF"
                    highlight
                    index={2}
                />
            </section>

            {/* Detailed Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radar Chart for Categories */}
                <div className="lg:col-span-1 urban-card p-6 min-h-[400px]">
                    <h3 className="text-xl font-black italic mb-6 border-b-2 border-white pb-2">MIX DE CATEGORIAS</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryMix}>
                                <PolarGrid stroke="#ffffff20" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#fff', fontSize: 10, fontWeight: '900' }} />
                                <Radar name="Vendas" dataKey="A" stroke="#FF4D00" fill="#FF4D00" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Composto Chart: Food Performance */}
                <div className="lg:col-span-2 urban-card p-6">
                    <div className="flex items-center justify-between mb-6 border-b-2 border-white pb-2">
                        <h3 className="text-xl font-black italic">PERFORMANCE: COMIDA</h3>
                        <Utensils className="w-6 h-6 text-[#CCFF00]" />
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={foodData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                <YAxis stroke="#fff" fontSize={10} fontWeight="900" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }} />
                                <Area type="monotone" dataKey="value" fill="#FF4D00" stroke="#FF4D00" fillOpacity={0.2} />
                                <Bar dataKey="value" fill="#CCFF00" radius={[0, 0, 0, 0]} barSize={40}>
                                    <LabelList dataKey="value" position="top" fill="#fff" fontSize={10} fontWeight="900" />
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Drinks Section with extra visual weight */}
            <section className="relative">
                <div className="absolute -left-10 top-1/2 -rotate-90 hidden xl:block">
                    <span className="text-8xl font-black text-white/5 uppercase select-none">BAR SERVICE</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="urban-card bg-[#007AFF] p-8 border-black">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-black p-3 border-2 border-white">
                                <GlassWater className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black italic text-white leading-none uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">TOP DRINKS</h3>
                                <p className="text-xs font-bold text-white/60 uppercase">As bebidas mais vendidas da noite</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {drinkData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between bg-black p-4 border-2 border-white shadow-[4px_4px_0px_#000]">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-black italic text-[#CCFF00]">0{i + 1}</span>
                                        <span className="font-black italic text-white uppercase">{item.name}</span>
                                    </div>
                                    <span className="font-mono font-black text-[#FF4D00] text-xl">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="urban-card p-6 bg-black flex flex-col items-center justify-center halftone-orange overflow-hidden">
                        <div className="relative z-10 text-center">
                            <div className="mb-4 inline-block bg-[#CCFF00] text-black px-6 py-2 font-black italic text-2xl border-4 border-black">
                                VOLUME TOTAL BAR
                            </div>
                            <h4 className="text-[120px] font-black italic leading-none text-white pop-shadow mb-4">
                                {drinkData.reduce((acc, d) => acc + d.value, 0)}
                            </h4>
                            <p className="text-xl font-black text-[#CCFF00] uppercase tracking-widest italic">UNIDADES SAÍDAS</p>
                        </div>
                        <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>
        </div>
    );
}

function UrbanKPI({ title, value, icon: Icon, color, highlight, index }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={clsx(
                "urban-card p-8 group flex flex-col justify-between min-h-[200px]",
                highlight && "bg-white text-black border-black border-8 shadow-[12px_12px_0px_#FF4D00]"
            )}
        >
            <div className="flex justify-between items-start">
                <div className={clsx(
                    "w-14 h-14 bg-black flex items-center justify-center border-2 border-white transition-transform group-hover:rotate-12",
                    highlight && "bg-[#FF4D00]"
                )}>
                    <Icon className={clsx("w-8 h-8", highlight ? "text-black" : "text-white")} style={{ color: !highlight ? color : undefined }} />
                </div>
                <div className="text-[40px] font-black text-white/10 italic select-none">
                    0{index + 1}
                </div>
            </div>
            <div className="mt-6">
                <p className={clsx("text-xs font-black italic uppercase tracking-widest mb-1", highlight ? "text-white/90" : "text-white/40")}>
                    {title}
                </p>
                <h3 className={clsx("text-4xl font-black italic tracking-tighter truncate text-white", highlight && "drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]")}>
                    {value}
                </h3>
            </div>
            {highlight && (
                <div className="absolute -right-4 top-0 w-8 h-full bg-[#CCFF00] transform skew-x-[-12deg]" />
            )}
        </motion.div>
    );
}
