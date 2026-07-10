'use client';

import React from 'react';

interface WeaponData {
  weapon_name: string;
  count: number;
}

interface WeaponsPodiumProps {
  weapons: WeaponData[];
  title: string; // Titolo parametrico
  type: 'offensive' | 'defensive';
}

// Mappatura dei nomi delle armi alle loro immagini
const WEAPON_IMAGES: Record<string, string> = {
  'AK-47': '/weapons/ak47.png',
  'M4A4': '/weapons/m4a4.png',
  'AWP': '/weapons/awp.png',
  'Desert Eagle': '/weapons/deagle.png',
};

// Icone SVG custom inline per evitare dipendenze esterne
import TargetIcon from './TargetIcon';

import SkullIcon from './SkullIcon';
export function WeaponsPodium({ weapons, title, type }: WeaponsPodiumProps) {
  const topThree = weapons.slice(0, 3);

  const podiumOrder = [
    topThree[1] || null, // 2° Posto (Sinistra)
    topThree[0] || null, // 1° Posto (Centro)
    topThree[2] || null, // 3° Posto (Destra)
  ];

  const Icon = type === 'offensive' ? TargetIcon : SkullIcon;
  const labelColor = type === 'offensive' ? 'text-green-400' : 'text-ctp-red';
  const labelSuffix = type === 'offensive' ? 'Kills' : 'Deaths';

  const stepStyles = [
    { height: 'h-24', bgColor: 'bg-ctp-surface/40', border: 'border-silver-500/30', rank: '2' },
    { height: 'h-32', bgColor: 'bg-ctp-surface/60', border: 'border-yellow-500/30', rank: '1' },
    { height: 'h-16', bgColor: 'bg-ctp-surface/20', border: 'border-amber-700/30', rank: '3' },
  ];

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-ctp-subtext mb-3">
        {title}
      </h4>

      <div className="w-full bg-ctp-bg border border-ctp-line p-6 flex flex-col justify-end min-h-[260px] rounded-none">

        {topThree.length === 0 ? (
          <p className="text-xs text-ctp-muted italic text-center py-4 my-auto">Nessun dato sulle armi</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 items-end w-full max-w-md mx-auto mt-auto">
            {podiumOrder.map((weapon, index) => {
              const style = stepStyles[index];

              if (!weapon) {
                return (
                  <div key={`empty-${index}`} className="flex flex-col items-center opacity-20">
                    <div className={`w-full ${style.height} bg-ctp-surface/10 border border-dashed border-ctp-line rounded-t-md flex items-center justify-center`}>
                      <span className="text-xs font-mono font-bold text-ctp-muted">{style.rank}°</span>
                    </div>
                  </div>
                );
              }

              const imageSrc = WEAPON_IMAGES[weapon.weapon_name] || '/weapons/default.png';

              return (
                <div key={weapon.weapon_name} className="flex flex-col items-center group">
                  <div className="flex items-center gap-1 mb-2 bg-ctp-bg/80 px-2 py-0.5 rounded border border-ctp-line/50 text-[11px] font-mono shadow-sm">
                    <Icon className={`w-6 h-6 ${labelColor}`} />
                    <span className="font-bold text-ctp-text">{weapon.count}</span>
                    <span className="text-[9px] text-ctp-subtext uppercase">{labelSuffix}</span>
                  </div>

                  <div className="h-16 flex items-center justify-center px-2 mb-2 transition-transform group-hover:-translate-y-1">
                    <img
                      src={imageSrc}
                      alt={weapon.weapon_name}
                      className="max-h-full max-w-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/120x60/1e1e2e/cc241d?text=' + encodeURIComponent(weapon.weapon_name);
                      }}
                    />
                  </div>

                  <div className={`w-full ${style.height} ${style.bgColor} border-t-2 ${style.border} rounded-t-md flex flex-col items-center justify-between p-3 shadow-inner`}>
                    <div className="text-lg font-black font-mono text-ctp-subtext/40 group-hover:text-ctp-subtext/70 transition-colors">
                      {style.rank}°
                    </div>
                    {/* <div className="text-[11px] font-bold text-center truncate w-full text-ctp-text tracking-wide uppercase">
                      {weapon.weapon_name}
                    </div> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}