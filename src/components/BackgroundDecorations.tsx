"use client";

import Image from "next/image";
import React from "react";

const decorations = [
    { src: "/assets/Boca v2.png", top: "5%", left: "2%", size: 120, rotate: -15 },
    { src: "/assets/Cavalete de Bar.png", top: "15%", right: "5%", size: 150, rotate: 10 },
    { src: "/assets/Cone.png", bottom: "10%", left: "8%", size: 100, rotate: 15 },
    { src: "/assets/Copo Drink.png", top: "40%", right: "2%", size: 130, rotate: -10 },
    { src: "/assets/Hidrante.png", bottom: "20%", right: "12%", size: 90, rotate: 5 },
    { src: "/assets/Mão.png", top: "60%", left: "5%", size: 140, rotate: -5 },
    { src: "/assets/Megafone.png", top: "25%", left: "15%", size: 110, rotate: 20 },
    { src: "/assets/Mesa.png", bottom: "5%", right: "5%", size: 160, rotate: 0 },
    { src: "/assets/Oculos.png", top: "8%", left: "40%", size: 80, rotate: 12 },
    { src: "/assets/Orelha-v2.png", bottom: "35%", left: "2%", size: 120, rotate: -8 },
    { src: "/assets/Placa de Rua.png", top: "50%", left: "80%", size: 140, rotate: -15 },
    { src: "/assets/Semáforo.png", top: "70%", right: "3%", size: 110, rotate: 10 },
    { src: "/assets/Seta.png", top: "12%", right: "45%", size: 70, rotate: 180 },
    { src: "/assets/isqueiro.png", bottom: "15%", left: "45%", size: 90, rotate: -20 },
];

export default function BackgroundDecorations() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-10">
            {decorations.map((deco, index) => (
                <div
                    key={index}
                    className="absolute transition-all duration-1000"
                    style={{
                        top: deco.top,
                        left: deco.left,
                        right: deco.right,
                        bottom: deco.bottom,
                        transform: `rotate(${deco.rotate}deg)`,
                    }}
                >
                    <Image
                        src={deco.src}
                        alt="decoration"
                        width={deco.size}
                        height={deco.size}
                        className="object-contain"
                    />
                </div>
            ))}
        </div>
    );
}
