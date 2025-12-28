import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { ZODIAC_SIGNS, MBTI_TYPES, ZODIAC_ANIMALS, BLOOD_TYPES } from './constants';
import { AppState, CardData, UserInput, HistoryItem } from './types';
import { generateCardContent, generateViralCopy } from './services/geminiService';
import InputSelect from './components/InputSelect';
import Card from './components/Card';
import { Sparkles, Download, Moon, Video, Upload, Loader2, Copy, Check, FileText, LayoutGrid, Type as TypeIcon, History, X, Trash2, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  // Main State
  const [userInput, setUserInput] = useState<UserInput>({
    zodiac: ZODIAC_SIGNS[10], // Default Aquarius
    mbti: MBTI_TYPES[0],      // Default INTJ
    animal: ZODIAC_ANIMALS[0], // Default Rat
    bloodType: BLOOD_TYPES[0],  // Default A
    style: 'descriptive'       // Default Descriptive
  });
  
  const [bgVideo, setBgVideo] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [viralCopy, setViralCopy] = useState<string>("");
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('destiny_archives');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('destiny_archives', JSON.stringify(history));
  }, [history]);

  // Handlers
  const handleInputChange = (field: keyof UserInput, value: string) => {
    setUserInput(prev => ({ ...prev, [field]: value }));
    setCardData(null);
    setViralCopy("");
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setBgVideo(url);
    }
  };

  const handleGenerate = async () => {
    setAppState(AppState.LOADING);
    setViralCopy("");
    setIsGeneratingCopy(true);
    try {
      const data = await generateCardContent(userInput);
      setCardData(data);
      let copy = "";
      try {
        copy = await generateViralCopy(userInput, data);
        setViralCopy(copy);
      } catch (copyError) {
        console.error("Auto-generate copy failed:", copyError);
      }
      
      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        userInput: { ...userInput },
        cardData: data,
        viralCopy: copy
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 100)); // Keep last 100

      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setUserInput(item.userInput);
    setCardData(item.cardData);
    setViralCopy(item.viralCopy);
    setAppState(AppState.SUCCESS);
    setIsHistoryOpen(false);
  };

  const handleDeleteHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(confirm("确定删除这条记录吗？")) {
      setHistory(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleDownloadTxt = () => {
    if (!viralCopy) return;
    const blob = new Blob([viralCopy], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const z = userInput.zodiac.split(' ')[0];
    const m = userInput.mbti;
    const a = userInput.animal.split(' ')[0];
    const b = userInput.bloodType;
    link.download = `${z}+${m}+${a}+${b}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyText = async () => {
    if (!viralCopy) return;
    try {
        await navigator.clipboard.writeText(viralCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
        console.error("Failed to copy", err);
    }
  };

  const handleDownloadImage = useCallback(async () => {
    if (cardRef.current === null) return;
    try {
      const filter = (node: HTMLElement) => !node.classList?.contains('card-bg-video');
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 2,
        backgroundColor: 'transparent', 
        filter
      });
      const link = document.createElement('a');
      const z = userInput.zodiac.split(' ')[0];
      const m = userInput.mbti;
      const a = userInput.animal.split(' ')[0];
      const b = userInput.bloodType;
      link.download = `${z}+${m}+${a}+${b}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    }
  }, [cardRef, userInput]);

  const handleGenerateVideo = async () => {
    if (!bgVideo || !cardRef.current) return;
    setIsGeneratingVideo(true);

    try {
        const filter = (node: HTMLElement) => !node.classList?.contains('card-bg-video');
        const overlayDataUrl = await toPng(cardRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: 'transparent',
            filter
        });

        const overlayImg = new Image();
        overlayImg.src = overlayDataUrl;
        await new Promise((resolve) => { overlayImg.onload = resolve; });

        const canvas = document.createElement('canvas');
        const width = cardRef.current.offsetWidth * 2;
        const height = cardRef.current.offsetHeight * 2;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");

        const video = document.createElement('video');
        video.crossOrigin = "anonymous";
        video.src = bgVideo;
        video.muted = false; 
        video.loop = false; 
        video.style.position = 'fixed';
        video.style.top = '-9999px';
        video.style.opacity = '0';
        document.body.appendChild(video);

        await new Promise((resolve) => { video.onloadedmetadata = resolve; });

        const canvasStream = canvas.captureStream(30); 
        let audioTrack: MediaStreamTrack | null = null;
        try {
            const vidStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
            if (vidStream) {
                audioTrack = vidStream.getAudioTracks()[0];
                if (audioTrack) canvasStream.addTrack(audioTrack);
            }
        } catch (e) { console.warn(e); }

        const mimeType = MediaRecorder.isTypeSupported("video/mp4") ? "video/mp4" : "video/webm";
        const recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 5000000 }); 
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const z = userInput.zodiac.split(' ')[0];
            const m = userInput.mbti;
            const animal = userInput.animal.split(' ')[0];
            const b = userInput.bloodType;
            a.download = `${z}+${m}+${animal}+${b}.${mimeType === "video/mp4" ? "mp4" : "webm"}`;
            a.click();
            document.body.removeChild(video);
            setIsGeneratingVideo(false);
        };

        video.onended = () => recorder.stop();
        recorder.start();
        await video.play();

        const drawFrame = () => {
            if (video.paused || video.ended) return;
            ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, width, height);
            ctx.drawImage(overlayImg, 0, 0, width, height);
            requestAnimationFrame(drawFrame);
        };
        drawFrame();
    } catch (err) {
        console.error(err);
        setIsGeneratingVideo(false);
    }
  };

  const descriptiveMock: CardData = {
    zodiac: { title: "水瓶座", traits: ["脑回路清奇可爱", "不随波逐流", "看见未来的先知", "理智与感性共存"] },
    mbti: { title: "INTJ", traits: ["上帝视角的军师", "看透本质只需一秒", "不过好只做自己", "冷静是最强武器"] },
    animal: { title: "鼠", traits: ["机灵劲儿无人能比", "总能嗅到机会", "适应力强得惊人", "活在当下的智者"] },
    bloodType: { title: "A型", traits: ["比谁都认真负责", "温柔体贴入微", "承诺了一定做到", "心思极其细腻"] },
    coreTrait: "看见未来的冷静是最强武器家",
    fortune: "你独特的脑回路清奇可爱与看透本质只需一秒正在为你开启新的篇章。凭借适应力强得惊人的韧性和温柔体贴的创意，近期你将迎来一次不可思议的飞跃，保持好奇心！"
  };

  const displayData: CardData = cardData || descriptiveMock;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden bg-slate-950 font-sans">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1a1c38] via-[#121225] to-[#0a0a0f] z-0" />

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative z-[110] bg-slate-900 border border-white/10 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <History className="text-indigo-400" />
                    <h3 className="text-xl font-bold text-white">灵感档案库</h3>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={24} className="text-slate-400" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-500 flex flex-col items-center">
                        <Moon size={48} className="mb-4 opacity-20" />
                        <p>尚无生成的命理记录</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="group relative bg-slate-800/40 border border-white/5 rounded-2xl p-4 hover:border-indigo-500/50 transition-all hover:bg-slate-800/60 cursor-pointer" onClick={() => handleLoadHistory(item)}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-medium text-slate-500">{new Date(item.timestamp).toLocaleString()}</span>
                                <button onClick={(e) => handleDeleteHistory(e, item.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 rounded-lg transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                                    {item.userInput.zodiac.split(' ')[0][0]}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">{item.userInput.zodiac.split(' ')[0]} · {item.userInput.mbti}</p>
                                    <p className="text-[10px] text-slate-400">{item.userInput.animal.split(' ')[0]} / {item.userInput.bloodType}</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2 italic">"{item.cardData.coreTrait}"</p>
                            <div className="absolute bottom-4 right-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ExternalLink size={14} />
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col md:flex-row gap-8 w-full max-w-6xl items-start justify-center h-full">
        <div className="w-full md:w-80 bg-slate-800/80 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-2xl flex-shrink-0 max-h-[85vh] overflow-y-auto custom-scrollbar">
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
               <span className="text-2xl">🔮</span>
               <h2 className="text-xl font-bold text-white tracking-wide">命理输入</h2>
            </div>
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-indigo-400" title="查看生成记录">
                <History size={22} />
            </button>
          </div>

          <div className="space-y-4">
             <InputSelect label="星座 (Zodiac)" options={ZODIAC_SIGNS} value={userInput.zodiac} onChange={(v) => handleInputChange('zodiac', v)} />
             <InputSelect label="MBTI" options={MBTI_TYPES} value={userInput.mbti} onChange={(v) => handleInputChange('mbti', v)} />
             <InputSelect label="属相 (Animal)" options={ZODIAC_ANIMALS} value={userInput.animal} onChange={(v) => handleInputChange('animal', v)} />
             <InputSelect label="血型 (Blood Type)" options={BLOOD_TYPES} value={userInput.bloodType} onChange={(v) => handleInputChange('bloodType', v)} />

             <div className="mb-4">
                <label className="block text-gray-400 text-xs font-medium mb-2 pl-1">解读风格 (Style)</label>
                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700">
                    <button onClick={() => handleInputChange('style', 'descriptive')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${userInput.style === 'descriptive' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                        <TypeIcon size={14} /> 灵感短句
                    </button>
                    <button onClick={() => handleInputChange('style', 'concise')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${userInput.style === 'concise' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
                        <LayoutGrid size={14} /> 四字精炼
                    </button>
                </div>
             </div>
          </div>

          <div className="mt-8 space-y-3">
            <button onClick={handleGenerate} disabled={appState === AppState.LOADING || isGeneratingVideo} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                {appState === AppState.LOADING ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-yellow-300" />}
                <span>{appState === AppState.LOADING ? '正在洞察中...' : '生成解读'}</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={handleDownloadImage} disabled={isGeneratingVideo} className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Download size={16} /> 保存图片
                </button>
                <button onClick={handleGenerateVideo} disabled={isGeneratingVideo || !bgVideo} className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-white text-xs font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isGeneratingVideo ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />} 生成视频
                </button>
            </div>
             <div className="relative group pt-4">
               <input type="file" accept="video/*" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" id="video-upload" />
               <label htmlFor="video-upload" className="block w-full text-center text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer border border-dashed border-white/10 py-2 rounded-xl">
                 <Upload size={12} className="inline mr-1" /> 点击更换视频背景
               </label>
             </div>
             {viralCopy && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-100 tracking-widest uppercase">Viral Copy</span>
                        <div className="flex items-center gap-1">
                            <button onClick={handleDownloadTxt} className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors text-slate-300" title="导出为 TXT">
                                <FileText size={16} className="text-amber-400" />
                            </button>
                            <button onClick={handleCopyText} className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors text-slate-300" title="复制文本">
                                {copySuccess ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50">
                        <textarea readOnly value={viralCopy} className="w-full bg-transparent text-[11px] text-slate-300 font-sans leading-relaxed outline-none resize-none h-40 custom-scrollbar" />
                    </div>
                </div>
             )}
          </div>
        </div>
        <div className="flex-grow flex flex-col justify-center items-center relative">
           <Card data={displayData} selectedAnimal={userInput.animal} selectedMBTI={userInput.mbti} selectedZodiac={userInput.zodiac} bgVideoUrl={bgVideo} ref={cardRef} />
           {appState === AppState.SUCCESS && (
               <p className="mt-4 text-[10px] text-slate-500 italic">生成的内容已自动存入档案库</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default App;