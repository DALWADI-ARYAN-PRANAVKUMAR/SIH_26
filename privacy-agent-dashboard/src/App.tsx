import React, { useState, useEffect, useRef } from 'react';

const EXTENSION_ID_KEY = 'privacy_agent_extension_id';

// ——— Preset Character Avatars ———
// Using high-quality emoji-style SVG data URIs for anime/cartoon characters.
// These are small inline SVGs so they load instantly with zero network dependency.

const PRESET_AVATARS = [
  {
    id: "shinchan",
    name: "Shin-chan",
    // Yellow face, big eyebrows, red cheeks
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#FFE4B5"/>
      <ellipse cx="35" cy="45" rx="10" ry="11" fill="white"/>
      <ellipse cx="65" cy="45" rx="10" ry="11" fill="white"/>
      <circle cx="35" cy="46" r="5" fill="#1a1a1a"/>
      <circle cx="65" cy="46" r="5" fill="#1a1a1a"/>
      <circle cx="33" cy="44" r="1.5" fill="white"/>
      <circle cx="63" cy="44" r="1.5" fill="white"/>
      <rect x="22" y="32" width="22" height="6" rx="3" fill="#1a1a1a"/>
      <rect x="56" y="32" width="22" height="6" rx="3" fill="#1a1a1a"/>
      <ellipse cx="28" cy="58" rx="8" ry="5" fill="#FF6B6B" opacity="0.5"/>
      <ellipse cx="72" cy="58" rx="8" ry="5" fill="#FF6B6B" opacity="0.5"/>
      <ellipse cx="50" cy="65" rx="12" ry="8" fill="#1a1a1a"/>
      <ellipse cx="50" cy="63" rx="8" ry="4" fill="#ff6b6b"/>
      <path d="M20 20 Q35 5 50 15 Q65 5 80 20" fill="#1a1a1a" stroke="none"/>
    </svg>`,
  },
  {
    id: "doraemon",
    name: "Doraemon",
    // Blue cat robot face
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#0093D3"/>
      <ellipse cx="50" cy="55" rx="36" ry="34" fill="white"/>
      <ellipse cx="38" cy="40" rx="11" ry="13" fill="white" stroke="#1a1a1a" stroke-width="1.5"/>
      <ellipse cx="62" cy="40" rx="11" ry="13" fill="white" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="41" cy="40" r="5" fill="#1a1a1a"/>
      <circle cx="59" cy="40" r="5" fill="#1a1a1a"/>
      <circle cx="39" cy="38" r="2" fill="white"/>
      <circle cx="57" cy="38" r="2" fill="white"/>
      <ellipse cx="50" cy="52" rx="7" ry="6" fill="#E74C3C"/>
      <line x1="50" y1="58" x2="50" y2="78" stroke="#1a1a1a" stroke-width="2"/>
      <path d="M25 68 Q50 82 75 68" fill="none" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="15" y1="48" x2="30" y2="52" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="15" y1="56" x2="30" y2="56" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="15" y1="64" x2="30" y2="60" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="70" y1="52" x2="85" y2="48" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="70" y1="56" x2="85" y2="56" stroke="#1a1a1a" stroke-width="1.5"/>
      <line x1="70" y1="60" x2="85" y2="64" stroke="#1a1a1a" stroke-width="1.5"/>
      <circle cx="50" cy="14" r="3" fill="#E74C3C"/>
    </svg>`,
  },
  {
    id: "pikachu",
    name: "Pikachu",
    // Yellow electric mouse
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="52" r="46" fill="#FFD700"/>
      <ellipse cx="50" cy="55" rx="44" ry="42" fill="#FFD700"/>
      <ellipse cx="36" cy="48" rx="7" ry="8" fill="white"/>
      <ellipse cx="64" cy="48" rx="7" ry="8" fill="white"/>
      <circle cx="37" cy="49" r="5" fill="#1a1a1a"/>
      <circle cx="63" cy="49" r="5" fill="#1a1a1a"/>
      <circle cx="35" cy="47" r="2" fill="white"/>
      <circle cx="61" cy="47" r="2" fill="white"/>
      <ellipse cx="30" cy="62" rx="10" ry="7" fill="#E74C3C" opacity="0.6"/>
      <ellipse cx="70" cy="62" rx="10" ry="7" fill="#E74C3C" opacity="0.6"/>
      <ellipse cx="50" cy="58" rx="4" ry="2.5" fill="#1a1a1a"/>
      <path d="M42 63 Q50 70 58 63" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
      <polygon points="22,5 15,35 32,28" fill="#1a1a1a"/>
      <polygon points="22,8 17,32 30,26" fill="#FFD700"/>
      <polygon points="78,5 85,35 68,28" fill="#1a1a1a"/>
      <polygon points="78,8 83,32 70,26" fill="#FFD700"/>
    </svg>`,
  },
  {
    id: "totoro",
    name: "Totoro",
    // Gray forest spirit
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="58" rx="42" ry="40" fill="#7B8B8E"/>
      <ellipse cx="50" cy="65" rx="32" ry="28" fill="#D5D8DC"/>
      <polygon points="28,20 22,5 38,28" fill="#7B8B8E"/>
      <polygon points="72,20 78,5 62,28" fill="#7B8B8E"/>
      <ellipse cx="38" cy="40" rx="10" ry="12" fill="white"/>
      <ellipse cx="62" cy="40" rx="10" ry="12" fill="white"/>
      <circle cx="38" cy="41" r="5" fill="#1a1a1a"/>
      <circle cx="62" cy="41" r="5" fill="#1a1a1a"/>
      <path d="M38 56 L42 52 L46 56 L50 52 L54 56 L58 52 L62 56" fill="none" stroke="#7B8B8E" stroke-width="2.5"/>
      <ellipse cx="50" cy="60" rx="8" ry="5" fill="#1a1a1a"/>
      <path d="M44 55 Q50 48 56 55" fill="none" stroke="#1a1a1a" stroke-width="2"/>
    </svg>`,
  },
  {
    id: "naruto",
    name: "Naruto",
    // Orange ninja
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="52" r="46" fill="#FFD700"/>
      <rect x="8" y="30" width="84" height="16" rx="4" fill="#1565C0"/>
      <rect x="38" y="30" width="24" height="16" rx="2" fill="#90A4AE"/>
      <ellipse cx="36" cy="50" rx="8" ry="9" fill="white"/>
      <ellipse cx="64" cy="50" rx="8" ry="9" fill="white"/>
      <circle cx="36" cy="51" r="4.5" fill="#2196F3"/>
      <circle cx="64" cy="51" r="4.5" fill="#2196F3"/>
      <circle cx="36" cy="51" r="2" fill="#1a1a1a"/>
      <circle cx="64" cy="51" r="2" fill="#1a1a1a"/>
      <line x1="18" y1="54" x2="28" y2="56" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="18" y1="58" x2="28" y2="58" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="18" y1="62" x2="28" y2="60" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="72" y1="56" x2="82" y2="54" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="72" y1="58" x2="82" y2="58" stroke="#1a1a1a" stroke-width="2"/>
      <line x1="72" y1="60" x2="82" y2="62" stroke="#1a1a1a" stroke-width="2"/>
      <path d="M42 68 Q50 74 58 68" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M15 20 Q30 8 50 18 Q70 8 85 20" fill="#FFD700" stroke="none"/>
    </svg>`,
  },
  {
    id: "goku",
    name: "Goku",
    // Spiky hair orange gi
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="55" r="42" fill="#FFCC80"/>
      <path d="M15 30 Q25 -5 40 20 Q45 -10 55 15 Q60 -5 70 20 Q80 -5 85 30" fill="#1a1a1a"/>
      <ellipse cx="37" cy="50" rx="7" ry="8" fill="white"/>
      <ellipse cx="63" cy="50" rx="7" ry="8" fill="white"/>
      <circle cx="37" cy="51" r="4" fill="#1a1a1a"/>
      <circle cx="63" cy="51" r="4" fill="#1a1a1a"/>
      <circle cx="35" cy="49" r="1.5" fill="white"/>
      <circle cx="61" cy="49" r="1.5" fill="white"/>
      <path d="M44 66 Q50 72 56 66" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/>
      <rect x="35" y="82" width="30" height="16" rx="3" fill="#FF6F00"/>
      <rect x="47" y="82" width="6" height="16" fill="#1565C0"/>
    </svg>`,
  },
  {
    id: "kirby",
    name: "Kirby",
    // Pink puffball
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="52" r="44" fill="#FFB6C1"/>
      <ellipse cx="38" cy="44" rx="8" ry="10" fill="white"/>
      <ellipse cx="58" cy="44" rx="8" ry="10" fill="white"/>
      <ellipse cx="40" cy="46" rx="5" ry="7" fill="#2196F3"/>
      <ellipse cx="56" cy="46" rx="5" ry="7" fill="#2196F3"/>
      <circle cx="39" cy="43" r="2.5" fill="white"/>
      <circle cx="55" cy="43" r="2.5" fill="white"/>
      <ellipse cx="40" cy="49" rx="3" ry="4" fill="#1565C0"/>
      <ellipse cx="56" cy="49" rx="3" ry="4" fill="#1565C0"/>
      <ellipse cx="28" cy="60" rx="7" ry="5" fill="#FF69B4" opacity="0.5"/>
      <ellipse cx="68" cy="60" rx="7" ry="5" fill="#FF69B4" opacity="0.5"/>
      <ellipse cx="48" cy="60" rx="8" ry="5" fill="#E74C3C"/>
      <ellipse cx="15" cy="65" rx="12" ry="8" fill="#FF1493"/>
      <ellipse cx="85" cy="65" rx="12" ry="8" fill="#FF1493"/>
    </svg>`,
  },
  {
    id: "chopper",
    name: "Chopper",
    // Reindeer doctor from One Piece
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="55" r="40" fill="#D2B48C"/>
      <ellipse cx="50" cy="60" rx="30" ry="28" fill="#FAEBD7"/>
      <circle cx="50" cy="22" r="14" fill="#FF1493"/>
      <rect x="42" y="12" width="16" height="16" rx="3" fill="#FF1493"/>
      <line x1="44" y1="15" x2="44" y2="26" stroke="white" stroke-width="3"/>
      <line x1="38" y1="20" x2="50" y2="20" stroke="white" stroke-width="3"/>
      <polygon points="30,22 24,5 38,18" fill="#8B4513"/>
      <polygon points="70,22 76,5 62,18" fill="#8B4513"/>
      <circle cx="40" cy="52" r="7" fill="white"/>
      <circle cx="60" cy="52" r="7" fill="white"/>
      <circle cx="40" cy="53" r="4" fill="#1a1a1a"/>
      <circle cx="60" cy="53" r="4" fill="#1a1a1a"/>
      <circle cx="38" cy="51" r="1.5" fill="white"/>
      <circle cx="58" cy="51" r="1.5" fill="white"/>
      <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#E74C3C"/>
      <path d="M43 70 Q50 76 57 70" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function App() {
  const [extensionId, setExtensionId] = useState(localStorage.getItem(EXTENSION_ID_KEY) || '');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const [selectedAvatar, setSelectedAvatar] = useState<string>('classic');
  const [avatarSize, setAvatarSize] = useState<number>(52);
  const [customImage, setCustomImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (extensionId) localStorage.setItem(EXTENSION_ID_KEY, extensionId);
  }, [extensionId]);

  const sendToExtension = (payload: any) => {
    if (!extensionId) {
      setStatus('error');
      setStatusMessage('Please enter your Extension ID first.');
      return;
    }
    const win = window as any;
    if (!win.chrome || !win.chrome.runtime) {
      setStatus('error');
      setStatusMessage('Chrome extension API not available.');
      return;
    }
    win.chrome.runtime.sendMessage(extensionId, payload, (response: any) => {
      if (win.chrome.runtime.lastError) {
        setStatus('error');
        setStatusMessage(`Error: ${win.chrome.runtime.lastError.message}`);
      } else if (response?.success) {
        setStatus('success');
        setStatusMessage('✓ Synced!');
        setTimeout(() => setStatus('idle'), 2000);
      }
    });
  };

  const handleBuiltinStyle = (style: 'classic' | 'robot' | 'minimal') => {
    setSelectedAvatar(style);
    setCustomImage(null);
    sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { style, image: null } });
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = PRESET_AVATARS.find(p => p.id === presetId);
    if (!preset) return;
    const dataUrl = svgToDataUrl(preset.svg);
    setSelectedAvatar(presetId);
    setCustomImage(dataUrl);
    sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { style: 'custom', image: dataUrl } });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10);
    setAvatarSize(size);
    sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { size } });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomImage(base64);
        setSelectedAvatar('custom-upload');
        sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { style: 'custom', image: base64 } });
      };
      reader.readAsDataURL(file);
    }
  };

  // Skeuomorphic style constants
  const neu = {
    bg: "bg-[#e0e5ec]",
    card: "bg-[#e0e5ec] rounded-3xl p-6 shadow-[8px_8px_16px_rgb(163,177,198,0.6),-8px_-8px_16px_rgba(255,255,255,0.5)] border border-white/30",
    input: "w-full bg-[#e0e5ec] text-gray-700 px-4 py-3 rounded-xl shadow-[inset_4px_4px_8px_0_rgba(163,177,198,0.5),inset_-4px_-4px_8px_0_rgba(255,255,255,0.8)] border-none outline-none focus:shadow-[inset_2px_2px_4px_0_rgba(163,177,198,0.5),inset_-2px_-2px_4px_0_rgba(255,255,255,0.8)] transition-shadow duration-200 text-sm",
    btn: "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#e0e5ec] text-gray-600 font-medium transition-all duration-150 shadow-[5px_5px_10px_0_rgba(163,177,198,0.5),-5px_-5px_10px_0_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_6px_0_rgba(163,177,198,0.5),-3px_-3px_6px_0_rgba(255,255,255,0.8)] active:shadow-[inset_3px_3px_6px_0_rgba(163,177,198,0.5),inset_-3px_-3px_6px_0_rgba(255,255,255,0.8)] border border-white/20 cursor-pointer",
    btnActive: "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-[#e0e5ec] text-indigo-600 font-bold transition-all duration-150 shadow-[inset_3px_3px_6px_0_rgba(163,177,198,0.5),inset_-3px_-3px_6px_0_rgba(255,255,255,0.8)] border border-indigo-200/40 cursor-pointer ring-2 ring-indigo-400/30",
  };
  
  return (
    <div className={`${neu.bg} min-h-screen text-gray-700 font-sans p-6 md:p-10`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center pt-6 pb-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400 mb-1">
            Privacy Browser Agent
          </h1>
          <p className="text-gray-400 font-medium text-sm">Control Center</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ——— Left Column ——— */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Connection */}
            <div className={neu.card}>
              <h2 className="text-lg font-bold mb-4 text-gray-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                Connection
              </h2>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 pl-1 uppercase tracking-wider">Extension ID</label>
              <input 
                type="text" 
                value={extensionId}
                onChange={(e) => setExtensionId(e.target.value)}
                placeholder="Paste from chrome://extensions" 
                className={neu.input}
              />
              {status !== 'idle' && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-xs font-semibold ${status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Avatar Size */}
            <div className={neu.card}>
              <h2 className="text-lg font-bold mb-4 text-gray-600">Avatar Size</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scale</span>
                <span className="text-sm font-bold text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full">{avatarSize}px</span>
              </div>
              <input 
                type="range" 
                min="32" max="96" step="2"
                value={avatarSize}
                onChange={handleSizeChange}
                className="w-full h-2 bg-[#e0e5ec] rounded-lg appearance-none cursor-pointer shadow-[inset_2px_2px_4px_0_rgba(163,177,198,0.5),inset_-2px_-2px_4px_0_rgba(255,255,255,0.8)] accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-0.5">
                <span>Small</span><span>Medium</span><span>Large</span>
              </div>
            </div>

            {/* Live Preview */}
            <div className={neu.card}>
              <h2 className="text-lg font-bold mb-4 text-gray-600">Live Preview</h2>
              <div className="flex items-center justify-center py-6">
                <div 
                  style={{
                    width: `${avatarSize}px`, 
                    height: `${avatarSize}px`,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
                    backgroundColor: customImage ? 'transparent' : '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: `${Math.max(16, avatarSize * 0.4)}px`,
                    fontWeight: 'bold',
                  }}
                >
                  {customImage ? (
                    <img src={customImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedAvatar === 'robot' ? '🤖' : selectedAvatar === 'minimal' ? '⚪' : '✦'
                  )}
                </div>
              </div>
              <p className="text-center text-xs text-gray-400">This is how your avatar looks on pages</p>
            </div>
          </div>

          {/* ——— Right Column ——— */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Built-in Styles */}
            <div className={neu.card}>
              <h2 className="text-lg font-bold mb-4 text-gray-600">Style</h2>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => handleBuiltinStyle('classic')} className={selectedAvatar === 'classic' ? neu.btnActive : neu.btn}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg border border-indigo-300/50">✦</div>
                  <span className="text-xs">Classic</span>
                </button>
                <button onClick={() => handleBuiltinStyle('robot')} className={selectedAvatar === 'robot' ? neu.btnActive : neu.btn}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-900 flex items-center justify-center text-2xl shadow-lg border-2 border-gray-400/50">🤖</div>
                  <span className="text-xs">Robot</span>
                </button>
                <button onClick={() => handleBuiltinStyle('minimal')} className={selectedAvatar === 'minimal' ? neu.btnActive : neu.btn}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center text-gray-700 text-2xl shadow-[inset_2px_2px_4px_rgba(255,255,255,1),3px_3px_6px_rgba(163,177,198,0.4)] border border-gray-200/50">⚪</div>
                  <span className="text-xs">Minimal</span>
                </button>
              </div>
            </div>

            {/* Anime / Cartoon Characters */}
            <div className={neu.card}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-600">Characters</h2>
                <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Anime & Cartoon</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={selectedAvatar === preset.id ? neu.btnActive : neu.btn}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md border border-white/50">
                      <img src={svgToDataUrl(preset.svg)} alt={preset.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] leading-tight">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Upload */}
            <div className={neu.card}>
              <h2 className="text-lg font-bold mb-4 text-gray-600">Custom Upload</h2>
              <p className="text-xs text-gray-400 mb-4">Upload your own image to use as the floating avatar.</p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 text-sm font-semibold text-indigo-600 bg-[#e0e5ec] rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.4),-5px_-5px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] transition-all duration-150 flex items-center gap-2"
                >
                  <span>📁</span> Choose File
                </button>
                {selectedAvatar === 'custom-upload' && customImage && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-300 shadow-md">
                      <img src={customImage} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-green-600 font-semibold">✓ Active</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6">
          <p className="text-xs text-gray-400">Privacy Browser Agent · Dashboard v1.0</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
