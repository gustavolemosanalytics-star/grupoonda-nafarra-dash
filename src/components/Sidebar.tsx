'use client';

import React from 'react';
import { LayoutDashboard, Receipt, BarChart3, Settings, Menu, Sun, Flame, Ticket, Brain } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: 'ZIG VENDAS', href: '/zig', icon: LayoutDashboard },
    { name: 'FINANCEIRO', href: '/finance', icon: Receipt },
    { name: 'INGRESSE', href: '/ingresse', icon: Ticket },
    { name: 'ANÁLISES', href: '/reports', icon: Brain },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-[var(--sidebar-width)] bg-[#000] border-r-4 border-white z-50 flex flex-col halftone-bg">
            <div className="p-8 mb-6 relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#FF4D00]/20 rounded-full blur-2xl" />
                <h1 className="text-4xl font-black text-white italic tracking-tighter leading-none pop-shadow">
                    NA<br />FARRA
                </h1>
                <div className="mt-2 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#FF4D00]" />
                    <p className="text-[10px] text-[#CCFF00] font-black uppercase tracking-[0.2em]">Summer 2026</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-4 transition-all duration-200 group border-2",
                                isActive
                                    ? "bg-[#CCFF00] border-[#000] text-[#000] translate-x-1 -translate-y-1 shadow-[4px_4px_0px_#fff]"
                                    : "bg-white/5 border-transparent text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive ? "text-[#000]" : "text-white/40 group-hover:text-white")} />
                            <span className="font-black italic text-lg tracking-tight">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 mt-auto">
                <div className="bg-[#FF4D00] p-4 border-4 border-black shadow-[6px_6px_0px_#fff] flex items-center gap-3">
                    <div className="w-12 h-12 bg-black flex items-center justify-center text-[#CCFF00] font-black text-xl border-2 border-[#fff]">
                        O
                    </div>
                    <div>
                        <p className="text-sm font-black text-black italic text-white uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">GRUPO ONDA</p>
                        <p className="text-[10px] text-white/60 font-bold uppercase drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">Summer 2026</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
