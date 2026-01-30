'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, LabelList
} from 'recharts';
import { Users, Ticket, DollarSign, TrendingUp, MapPin, CreditCard } from 'lucide-react';

const COLORS = ['#CCFF00', '#FF4D00', '#000000', '#FFFFFF', '#333333', '#666666'];

export default function IngressePage() {
    const {
        ingresseTimeline,
        ingresseComissarios,
        ingresseGenero,
        ingresseIdade,
        ingressePagamento,
        ingresseEstado,
        ingresseCidade,
        loading
    } = useData();

    // Aggregation logic for Global Average (Weighted by event volume if possible, or simple average if not)
    const aggregatedGenderData = React.useMemo(() => {
        const genderTotals = ingresseGenero.reduce((acc: any, curr) => {
            if (!acc[curr.genero]) acc[curr.genero] = { sum: 0, count: 0 };
            acc[curr.genero].sum += (curr.porcentagem || 0);
            acc[curr.genero].count += 1;
            return acc;
        }, {});

        return Object.entries(genderTotals).map(([genero, data]: any) => ({
            genero,
            porcentagem: data.sum / data.count // Simple average of percentages across events
        })).sort((a, b) => b.porcentagem - a.porcentagem);
    }, [ingresseGenero]);

    const aggregatedAgeData = React.useMemo(() => {
        const ageTotals = ingresseIdade.reduce((acc: any, curr) => {
            if (!acc[curr.faixaEtaria]) acc[curr.faixaEtaria] = { sum: 0, count: 0 };
            acc[curr.faixaEtaria].sum += (curr.porcentagem || 0);
            acc[curr.faixaEtaria].count += 1;
            return acc;
        }, {});

        return Object.entries(ageTotals).map(([faixaEtaria, data]: any) => ({
            faixaEtaria,
            porcentagem: data.sum / data.count // Simple average of percentages across events
        })).sort((a, b) => {
            // Sort by age range if possible
            const getStart = (s: string) => parseInt(s.split('-')[0]) || 999;
            return getStart(a.faixaEtaria) - getStart(b.faixaEtaria);
        });
    }, [ingresseIdade]);

    // Normalize timeline dates and sort
    const timelineData = React.useMemo(() => {
        return ingresseTimeline
            .map(item => {
                let day, month, year;
                if (item.dataVenda.includes('/')) {
                    [day, month, year] = item.dataVenda.split('/');
                } else if (item.dataVenda.includes('-')) {
                    const parts = item.dataVenda.split('-');
                    if (parts[0].length === 4) {
                        [year, month, day] = parts;
                    } else {
                        [day, month, year] = parts;
                    }
                } else {
                    // Fallback or handle other formats
                    return { ...item, dateObj: new Date(0), formattedDate: item.dataVenda };
                }

                const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
                const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

                return {
                    ...item,
                    dateObj,
                    formattedDate
                };
            })
            .filter(item => !isNaN(item.dateObj.getTime()))
            .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, [ingresseTimeline]);

    // Calculate totals
    const { totalRevenue, totalTickets, avgTicketValue } = React.useMemo(() => {
        const rev = ingresseTimeline.reduce((acc, curr) => acc + curr.valor, 0);
        const tix = ingresseTimeline.reduce((acc, curr) => acc + curr.quantidade, 0);
        return {
            totalRevenue: rev,
            totalTickets: tix,
            avgTicketValue: tix > 0 ? rev / tix : 0
        };
    }, [ingresseTimeline]);

    // Process payment types: grouping and percentage
    const processedPaymentData = React.useMemo(() => {
        const paymentGroups = ingressePagamento.reduce((acc: any, curr) => {
            let type = curr.tipoPagamento;
            if (type.toLowerCase().includes('cartão de crédito')) type = 'Cartão de Crédito';
            if (type.toLowerCase().includes('cartão de débito')) type = 'Cartão de Débito';

            if (!acc[type]) {
                acc[type] = { tipoPagamento: type, receita: 0, ingressos: 0 };
            }
            acc[type].receita += curr.receita;
            acc[type].ingressos += curr.ingressos;
            return acc;
        }, {});

        return Object.values(paymentGroups).map((item: any) => ({
            ...item,
            porcentagem: totalTickets > 0 ? (item.ingressos / totalTickets) * 100 : 0
        })).sort((a, b) => b.receita - a.receita);
    }, [ingressePagamento, totalTickets]);

    // Process comissários with percentage
    const processedComissarios = React.useMemo(() => {
        return ingresseComissarios
            .map(c => ({
                ...c,
                porcentagem: totalTickets > 0 ? (c.ingressos / totalTickets) * 100 : 0
            }))
            .sort((a, b) => b.receita - a.receita)
            .slice(0, 10);
    }, [ingresseComissarios, totalTickets]);

    const processedCidade = React.useMemo(() => {
        return ingresseCidade.map(item => ({
            ...item,
            cidade: item.cidade === 'Sem Cidade' ? `Sem Cidade - ${item.evento}` : item.cidade
        })).sort((a, b) => b.ingressos - a.ingressos).slice(0, 15);
    }, [ingresseCidade]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center halftone-bg">
                <div className="animate-spin w-16 h-16 border-8 border-[#FF4D00] border-t-[#CCFF00]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase pop-shadow mb-2">
                    INGRESSE <span className="text-[#CCFF00]">INSIGHTS</span>
                </h1>
                <p className="text-white/60 font-medium uppercase tracking-widest text-sm border-l-4 border-[#FF4D00] pl-4">
                    Performance e demografia de vendas via Ingresse
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_#000] group hover:-translate-y-1 hover:shadow-[12px_12px_0px_#CCFF00] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="p-3 bg-black text-[#CCFF00] border border-white/20">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <p className="font-black italic text-black uppercase tracking-tight">Receita Total</p>
                    </div>
                    <p className="text-4xl font-black text-black relative z-10">
                        {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_#000] group hover:-translate-y-1 hover:shadow-[12px_12px_0px_#FF4D00] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="p-3 bg-black text-[#FF4D00] border border-white/20">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <p className="font-black italic text-black uppercase tracking-tight">Total Ingressos</p>
                    </div>
                    <p className="text-4xl font-black text-black relative z-10">
                        {totalTickets.toLocaleString('pt-BR')}
                    </p>
                </div>

                <div className="bg-white p-6 border-4 border-black shadow-[8px_8px_0px_#000] group hover:-translate-y-1 hover:shadow-[12px_12px_0px_#007AFF] transition-all relative overflow-hidden">
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <div className="p-3 bg-black text-[#007AFF] border border-white/20">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <p className="font-black italic text-black uppercase tracking-tight">Ticket Médio</p>
                    </div>
                    <p className="text-3xl font-black text-black relative z-10">
                        {avgTicketValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            {/* Sales Timeline */}
            <div className="urban-card p-8">
                <h2 className="text-3xl font-black text-white italic uppercase mb-8 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-[#CCFF00]" /> Linha do Tempo de Vendas
                </h2>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timelineData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                            <XAxis
                                dataKey="formattedDate"
                                stroke="#fff"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val} // Already dd/mm/yyyy from normalization
                            />
                            <YAxis
                                stroke="#fff"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `R$ ${v.toLocaleString('pt-BR')}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#000', border: '2px solid #fff', borderRadius: '0px' }}
                                itemStyle={{ fontWeight: 'black', textTransform: 'uppercase' }}
                                formatter={(value: any, name: any) => [
                                    name === 'Receita' ? `R$ ${value.toLocaleString('pt-BR')}` : value,
                                    name
                                ]}
                                labelStyle={{ color: '#fff', fontWeight: 'black', marginBottom: '8px' }}
                            />
                            <Area type="monotone" dataKey="valor" name="Receita" stroke="#CCFF00" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            <Area type="monotone" dataKey="quantidade" name="Qtd Ingressos" stroke="#FF4D00" strokeWidth={2} fill="transparent" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Comissários */}
                <div className="urban-card p-8">
                    <h2 className="text-2xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
                        <Users className="w-6 h-6 text-[#FF4D00]" /> Comissários
                    </h2>
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={processedComissarios}
                                layout="vertical"
                                margin={{ left: 30, right: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="passkey"
                                    type="category"
                                    stroke="#fff"
                                    fontSize={10}
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff10' }}
                                    contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }}
                                    labelStyle={{ color: '#fff', fontWeight: 'black' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    formatter={(value: any, name: any) => [
                                        name === 'receita' ? `R$ ${value.toLocaleString('pt-BR')}` :
                                            name === 'porcentagem' ? `${value.toFixed(1)}%` : value,
                                        name === 'receita' ? 'Receita' :
                                            name === 'porcentagem' ? '% do Evento' : 'Ingressos'
                                    ]}
                                />
                                <Bar dataKey="receita" name="receita" fill="#CCFF00" radius={[0, 4, 4, 0]}>
                                    <LabelList
                                        dataKey="receita"
                                        position="right"
                                        fill="#fff"
                                        fontSize={10}
                                        fontWeight="bold"
                                        formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`}
                                    />
                                </Bar>
                                <Bar dataKey="porcentagem" name="porcentagem" fill="#007AFF" radius={[0, 4, 4, 0]}>
                                    <LabelList
                                        dataKey="porcentagem"
                                        position="right"
                                        fill="#fff"
                                        fontSize={10}
                                        fontWeight="bold"
                                        formatter={(v: any, entry: any) => {
                                            const payload = entry?.payload;
                                            if (!payload) return '';
                                            const receita = payload.receita?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0';
                                            const ingressos = payload.ingressos || 0;
                                            return `${receita} | ${ingressos} Und | ${v.toFixed(1)}%`;
                                        }}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pagamento */}
                <div className="urban-card p-8">
                    <h2 className="text-2xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-[#007AFF]" /> Tipo de Pagamento
                    </h2>
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedPaymentData} layout="vertical" margin={{ left: 30, right: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="tipoPagamento" type="category" stroke="#fff" fontSize={11} width={120} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#ffffff10' }}
                                    contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }}
                                    labelStyle={{ color: '#fff' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                    formatter={(value: any, name: any) => [
                                        name === 'receita' ? `R$ ${value.toLocaleString('pt-BR')}` : `${value.toFixed(1)}%`,
                                        name === 'receita' ? 'Receita' : '% do Evento'
                                    ]}
                                />
                                <Bar dataKey="receita" name="receita" fill="#007AFF" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="receita" position="right" fill="#fff" fontSize={11} fontWeight="bold" formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
                                </Bar>
                                <Bar dataKey="porcentagem" name="porcentagem" fill="#CCFF00" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="porcentagem" position="right" fill="#fff" fontSize={10} fontWeight="bold" formatter={(v: any) => `${v.toFixed(1)}%`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gênero */}
                <div className="urban-card p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                            <span className="w-2 h-6 bg-[#CCFF00]" /> Gênero (Média)
                        </h2>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={aggregatedGenderData}
                                    cx="40%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => (percent || 0) > 0.05 ? `${name}` : ''}
                                    outerRadius={100}
                                    stroke="#000"
                                    strokeWidth={2}
                                    dataKey="porcentagem"
                                    nameKey="genero"
                                >
                                    {aggregatedGenderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }}
                                    formatter={(v: any) => `${Number(v).toFixed(1)}%`}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Idade */}
                <div className="urban-card p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                        <h2 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                            <span className="w-2 h-6 bg-[#FF4D00]" /> Faixa Etária (Média)
                        </h2>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={aggregatedAgeData} margin={{ top: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis dataKey="faixaEtaria" stroke="#fff" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#fff" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#FF4D00' }} />
                                <Bar dataKey="porcentagem" name="Média (%)" fill="#FF4D00" radius={[4, 4, 0, 0]}>
                                    <LabelList dataKey="porcentagem" position="top" fill="#fff" fontSize={10} fontWeight="bold" formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Estados */}
                <div className="urban-card p-8">
                    <h2 className="text-2xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-[#FF4D00]" /> Top 15 Estados
                    </h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ingresseEstado.sort((a, b) => b.ingressos - a.ingressos).slice(0, 15)} layout="vertical" margin={{ right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="estado" type="category" stroke="#fff" fontSize={11} width={40} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#CCFF00' }} />
                                <Bar dataKey="ingressos" name="Ingressos" fill="#FF4D00" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="ingressos" position="right" fill="#fff" fontSize={10} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cidades */}
                <div className="urban-card p-8">
                    <h2 className="text-2xl font-black text-white italic uppercase mb-6 flex items-center gap-3">
                        <MapPin className="w-6 h-6 text-[#CCFF00]" /> Cidades
                    </h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processedCidade} layout="vertical" margin={{ right: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="cidade" type="category" stroke="#fff" fontSize={10} width={100} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#000', border: '2px solid #fff' }} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#CCFF00' }} />
                                <Bar dataKey="ingressos" name="Ingressos" fill="#CCFF00" radius={[0, 4, 4, 0]}>
                                    <LabelList dataKey="ingressos" position="right" fill="#fff" fontSize={10} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
