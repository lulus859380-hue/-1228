import React, { forwardRef } from 'react';
import { CardData } from '../types';
import { Sparkles } from 'lucide-react';

interface CardProps {
  data: CardData;
  selectedAnimal?: string;
  selectedMBTI?: string;
  selectedZodiac?: string;
  bgVideoUrl?: string | null;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  data, 
  selectedAnimal = "Rat", 
  selectedMBTI = "INTJ",
  selectedZodiac = "Aquarius",
  bgVideoUrl
}, ref) => {
  // Logic to separate the Letter for the icon vs the Full Title for the section
  const getBloodLetter = (str: string) => {
    const match = str.match(/[ABO]+/i);
    return match ? match[0].toUpperCase() : 'A';
  };
  
  const bloodLetter = getBloodLetter(data.bloodType.title);
  const bloodTypeSectionTitle = `${bloodLetter}型血`;

  // Map animal string to Emoji
  const getAnimalEmoji = (animalStr: string) => {
    if (!animalStr) return '🐀';
    if (animalStr.includes('Rat')) return '🐀';
    if (animalStr.includes('Ox')) return '🐂';
    if (animalStr.includes('Tiger')) return '🐅';
    if (animalStr.includes('Rabbit')) return '🐇';
    if (animalStr.includes('Dragon')) return '🐉';
    if (animalStr.includes('Snake')) return '🐍';
    if (animalStr.includes('Horse')) return '🐎';
    if (animalStr.includes('Goat')) return '🐐';
    if (animalStr.includes('Monkey')) return '🐒';
    if (animalStr.includes('Rooster')) return '🐓';
    if (animalStr.includes('Dog')) return '🐕';
    if (animalStr.includes('Pig')) return '🐖';
    return '🐾';
  };

  const animalEmoji = getAnimalEmoji(selectedAnimal);

  const getMBTIColor = (mbti: string) => {
    const code = mbti?.toUpperCase() || '';
    if (['INTJ', 'INTP', 'ENTJ', 'ENTP'].includes(code)) return 'bg-purple-500';
    if (['INFJ', 'INFP', 'ENFJ', 'ENFP'].includes(code)) return 'bg-emerald-500';
    if (['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'].includes(code)) return 'bg-sky-500';
    if (['ISTP', 'ISFP', 'ESTP', 'ESFP'].includes(code)) return 'bg-amber-500';
    return 'bg-purple-500';
  };

  const mbtiBgColor = getMBTIColor(selectedMBTI || 'INTJ');

  const getZodiacSymbol = (zodiacStr: string) => {
    if (!zodiacStr) return '♒';
    if (zodiacStr.includes('Aries')) return '♈';
    if (zodiacStr.includes('Taurus')) return '♉';
    if (zodiacStr.includes('Gemini')) return '♊';
    if (zodiacStr.includes('Cancer')) return '♋';
    if (zodiacStr.includes('Leo')) return '♌';
    if (zodiacStr.includes('Virgo')) return '♍';
    if (zodiacStr.includes('Libra')) return '♎';
    if (zodiacStr.includes('Scorpio')) return '♏';
    if (zodiacStr.includes('Sagittarius')) return '♐';
    if (zodiacStr.includes('Capricorn')) return '♑';
    if (zodiacStr.includes('Aquarius')) return '♒';
    if (zodiacStr.includes('Pisces')) return '♓';
    return '✨';
  };

  const zodiacSymbol = getZodiacSymbol(selectedZodiac);

  const getZodiacStyle = (zodiacStr: string) => {
    if (!zodiacStr) return 'bg-gradient-to-br from-sky-400 to-sky-600 shadow-sky-500/30';
    const z = zodiacStr.toLowerCase();
    if (z.includes('aries') || z.includes('leo') || z.includes('sagittarius')) return 'bg-gradient-to-br from-rose-500 to-red-600 shadow-red-500/30';
    if (z.includes('taurus') || z.includes('virgo') || z.includes('capricorn')) return 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30';
    if (z.includes('gemini') || z.includes('libra') || z.includes('aquarius')) return 'bg-gradient-to-br from-sky-400 to-blue-500 shadow-sky-500/30';
    if (z.includes('cancer') || z.includes('scorpio') || z.includes('pisces')) return 'bg-gradient-to-br from-violet-400 to-indigo-600 shadow-indigo-500/30';
    return 'bg-gradient-to-br from-sky-400 to-sky-600 shadow-sky-500/30';
  };

  const zodiacStyleClass = getZodiacStyle(selectedZodiac);

  // Helper to split fortune into sentences
  const splitSentences = (text: string) => {
    return text.split(/[。！？]/).filter(s => s.trim().length > 0).map(s => s.trim() + '。');
  };

  return (
    <div 
      ref={ref}
      className="relative w-full max-w-[550px] aspect-[4/5] rounded-3xl overflow-hidden flex flex-col items-center text-white select-none shadow-2xl font-sans"
    >
      {bgVideoUrl && (
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 card-bg-video"
          src={bgVideoUrl}
        />
      )}

      <div className={`absolute inset-0 ${bgVideoUrl ? 'bg-slate-900/50' : 'bg-slate-900/60'} backdrop-blur-sm z-0`}></div>
      <div className="absolute inset-0 border border-white/10 z-10 pointer-events-none rounded-3xl"></div>

      <div className="relative z-20 w-full h-full px-8 py-6 flex flex-col">
        <h1 className="text-4xl font-black text-center tracking-widest mb-6 drop-shadow-lg text-white">命理卡片</h1>

        <div className="relative flex justify-center items-center gap-8 mb-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[2px] bg-indigo-300/30"></div>
            <div className={`relative z-10 w-11 h-11 rounded-xl ${zodiacStyleClass} flex items-center justify-center text-2xl text-white shadow-lg border-t border-white/20`}>
               <span className="drop-shadow-sm filter">{zodiacSymbol}</span>
            </div>
            <div className={`relative z-10 h-8 px-2 flex items-center justify-center ${mbtiBgColor} rounded text-[10px] font-bold text-white tracking-widest shadow-sm border-t border-white/20`}>
              {selectedMBTI}
            </div>
            <div className="relative z-10 flex items-center justify-center">
               <span className="text-3xl filter drop-shadow-md">{animalEmoji}</span>
            </div>
            <div className="relative z-10 w-9 h-9 rounded bg-rose-500 flex items-center justify-center text-white shadow-lg border-t border-white/20">
               <span className="font-bold text-lg">{bloodLetter}</span>
            </div>
        </div>

        <div className="flex-grow grid grid-cols-2 relative gap-y-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 flex items-center justify-center pointer-events-none z-0 rounded-full bg-slate-950/80 shadow-2xl backdrop-blur-md">
                 <div className="w-full h-full border-[1.5px] border-amber-200/20 border-dashed rounded-full animate-spin-slow"></div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+3.5rem)] z-0 text-[10px] tracking-[0.2em] text-amber-100/40 uppercase font-medium">
                Core Trait
            </div>

            {/* Top Left: Zodiac */}
            <div className="flex flex-col items-center text-center pb-2 z-10 pr-2">
                <h2 className="text-2xl font-black mb-2 text-sky-100 drop-shadow-md inline-block border-b-2 border-sky-200/20 pb-1 px-2">
                  {data.zodiac.title}
                </h2>
                <div className="space-y-1">
                   {data.zodiac.traits.map(t => <p key={t} className="text-sm text-sky-100/70 font-medium tracking-wide">{t}</p>)}
                </div>
            </div>

            {/* Top Right: MBTI */}
            <div className="flex flex-col items-center text-center pb-2 z-10 pl-2">
                <h2 className="text-2xl font-black mb-2 text-purple-100 drop-shadow-md inline-block border-b-2 border-purple-200/20 pb-1 px-2">
                  {data.mbti.title}
                </h2>
                <div className="space-y-1">
                   {data.mbti.traits.map(t => <p key={t} className="text-sm text-purple-100/70 font-medium tracking-wide">{t}</p>)}
                </div>
            </div>

            {/* Center Core Trait Text - Single Line */}
            <div className="col-span-2 py-4 z-20 flex justify-center items-center overflow-hidden">
                 <p className="text-lg font-bold text-white text-center px-4 leading-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
                    {data.coreTrait}
                 </p>
            </div>

            {/* Bottom Left: Animal */}
            <div className="flex flex-col items-center text-center pt-1 z-10 pr-2">
                <h2 className="text-2xl font-black mb-2 text-amber-100 drop-shadow-md inline-block border-b-2 border-amber-200/20 pb-1 px-2">
                  {data.animal.title}
                </h2>
                <div className="space-y-1">
                   {data.animal.traits.map(t => <p key={t} className="text-sm text-amber-100/70 font-medium tracking-wide">{t}</p>)}
                </div>
            </div>

            {/* Bottom Right: Blood Type */}
            <div className="flex flex-col items-center text-center pt-1 z-10 pl-2">
                <h2 className="text-2xl font-black mb-2 text-rose-100 drop-shadow-md inline-block border-b-2 border-rose-200/20 pb-1 px-2">
                  {bloodTypeSectionTitle}
                </h2>
                <div className="space-y-1">
                   {data.bloodType.traits.map(t => <p key={t} className="text-sm text-rose-100/70 font-medium tracking-wide">{t}</p>)}
                </div>
            </div>
        </div>

        {/* 4. Fortune Section - Moved Up and Multi-line */}
        <div className="mt-0 pt-0 relative -translate-y-4">
             <div className="w-full flex justify-center mb-2">
                 <svg width="100%" height="20" viewBox="0 0 200 20" preserveAspectRatio="none" className="opacity-70">
                   <defs>
                     <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                       <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
                       <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                     </linearGradient>
                   </defs>
                   <path d="M0,20 Q100,0 200,20" stroke="url(#arcGradient)" strokeWidth="1.5" fill="none" />
                 </svg>
             </div>
             
             <div className="flex justify-center items-center gap-2 mb-2 text-amber-300">
                <Sparkles size={14} className="text-yellow-200" />
                <span className="font-bold text-sm tracking-widest text-yellow-100">运势解读</span>
             </div>
             
             <div className="text-[11px] text-center text-slate-200 leading-relaxed px-6 opacity-95 font-light tracking-wide flex flex-col items-center gap-1">
                {splitSentences(data.fortune).map((sentence, idx) => (
                  <p key={idx}>{sentence}</p>
                ))}
             </div>
        </div>

      </div>
    </div>
  );
});

Card.displayName = 'Card';

export default Card;