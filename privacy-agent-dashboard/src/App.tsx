import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Moon, Sun, Menu, X, ArrowUp, Copy, Check, Eye, EyeOff, 
  ChevronDown, ChevronUp, RefreshCw, Send, Loader2, AlertCircle, Info, Home, Settings, HelpCircle, Mail, BarChart2,
  MoreHorizontal
} from 'lucide-react';

const EXTENSION_ID_KEY = 'privacy_agent_extension_id';

const PRESET_AVATARS = [
  { id: "shinchan", name: "Shin-chan", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#FFE4B5"/><ellipse cx="35" cy="45" rx="10" ry="11" fill="white"/><ellipse cx="65" cy="45" rx="10" ry="11" fill="white"/><circle cx="35" cy="46" r="5" fill="#1a1a1a"/><circle cx="65" cy="46" r="5" fill="#1a1a1a"/><circle cx="33" cy="44" r="1.5" fill="white"/><circle cx="63" cy="44" r="1.5" fill="white"/><rect x="22" y="32" width="22" height="6" rx="3" fill="#1a1a1a"/><rect x="56" y="32" width="22" height="6" rx="3" fill="#1a1a1a"/><ellipse cx="28" cy="58" rx="8" ry="5" fill="#FF6B6B" opacity="0.5"/><ellipse cx="72" cy="58" rx="8" ry="5" fill="#FF6B6B" opacity="0.5"/><ellipse cx="50" cy="65" rx="12" ry="8" fill="#1a1a1a"/><ellipse cx="50" cy="63" rx="8" ry="4" fill="#ff6b6b"/><path d="M20 20 Q35 5 50 15 Q65 5 80 20" fill="#1a1a1a" stroke="none"/></svg>` },
  { id: "doraemon", name: "Doraemon", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0093D3"/><ellipse cx="50" cy="55" rx="36" ry="34" fill="white"/><ellipse cx="38" cy="40" rx="11" ry="13" fill="white" stroke="#1a1a1a" stroke-width="1.5"/><ellipse cx="62" cy="40" rx="11" ry="13" fill="white" stroke="#1a1a1a" stroke-width="1.5"/><circle cx="41" cy="40" r="5" fill="#1a1a1a"/><circle cx="59" cy="40" r="5" fill="#1a1a1a"/><circle cx="39" cy="38" r="2" fill="white"/><circle cx="57" cy="38" r="2" fill="white"/><ellipse cx="50" cy="52" rx="7" ry="6" fill="#E74C3C"/><line x1="50" y1="58" x2="50" y2="78" stroke="#1a1a1a" stroke-width="2"/><path d="M25 68 Q50 82 75 68" fill="none" stroke="#1a1a1a" stroke-width="2"/><line x1="15" y1="48" x2="30" y2="52" stroke="#1a1a1a" stroke-width="1.5"/><line x1="15" y1="56" x2="30" y2="56" stroke="#1a1a1a" stroke-width="1.5"/><line x1="15" y1="64" x2="30" y2="60" stroke="#1a1a1a" stroke-width="1.5"/><line x1="70" y1="52" x2="85" y2="48" stroke="#1a1a1a" stroke-width="1.5"/><line x1="70" y1="56" x2="85" y2="56" stroke="#1a1a1a" stroke-width="1.5"/><line x1="70" y1="60" x2="85" y2="64" stroke="#1a1a1a" stroke-width="1.5"/><circle cx="50" cy="14" r="3" fill="#E74C3C"/></svg>` },
  { id: "pikachu", name: "Pikachu", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="52" r="46" fill="#FFD700"/><ellipse cx="50" cy="55" rx="44" ry="42" fill="#FFD700"/><ellipse cx="36" cy="48" rx="7" ry="8" fill="white"/><ellipse cx="64" cy="48" rx="7" ry="8" fill="white"/><circle cx="37" cy="49" r="5" fill="#1a1a1a"/><circle cx="63" cy="49" r="5" fill="#1a1a1a"/><circle cx="35" cy="47" r="2" fill="white"/><circle cx="61" cy="47" r="2" fill="white"/><ellipse cx="30" cy="62" rx="10" ry="7" fill="#E74C3C" opacity="0.6"/><ellipse cx="70" cy="62" rx="10" ry="7" fill="#E74C3C" opacity="0.6"/><ellipse cx="50" cy="58" rx="4" ry="2.5" fill="#1a1a1a"/><path d="M42 63 Q50 70 58 63" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/><polygon points="22,5 15,35 32,28" fill="#1a1a1a"/><polygon points="22,8 17,32 30,26" fill="#FFD700"/><polygon points="78,5 85,35 68,28" fill="#1a1a1a"/><polygon points="78,8 83,32 70,26" fill="#FFD700"/></svg>` },
  { id: "totoro", name: "Totoro", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="42" ry="40" fill="#7B8B8E"/><ellipse cx="50" cy="65" rx="32" ry="28" fill="#D5D8DC"/><polygon points="28,20 22,5 38,28" fill="#7B8B8E"/><polygon points="72,20 78,5 62,28" fill="#7B8B8E"/><ellipse cx="38" cy="40" rx="10" ry="12" fill="white"/><ellipse cx="62" cy="40" rx="10" ry="12" fill="white"/><circle cx="38" cy="41" r="5" fill="#1a1a1a"/><circle cx="62" cy="41" r="5" fill="#1a1a1a"/><path d="M38 56 L42 52 L46 56 L50 52 L54 56 L58 52 L62 56" fill="none" stroke="#7B8B8E" stroke-width="2.5"/><ellipse cx="50" cy="60" rx="8" ry="5" fill="#1a1a1a"/><path d="M44 55 Q50 48 56 55" fill="none" stroke="#1a1a1a" stroke-width="2"/></svg>` },
  { id: "naruto", name: "Naruto", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="52" r="46" fill="#FFD700"/><rect x="8" y="30" width="84" height="16" rx="4" fill="#1565C0"/><rect x="38" y="30" width="24" height="16" rx="2" fill="#90A4AE"/><ellipse cx="36" cy="50" rx="8" ry="9" fill="white"/><ellipse cx="64" cy="50" rx="8" ry="9" fill="white"/><circle cx="36" cy="51" r="4.5" fill="#2196F3"/><circle cx="64" cy="51" r="4.5" fill="#2196F3"/><circle cx="36" cy="51" r="2" fill="#1a1a1a"/><circle cx="64" cy="51" r="2" fill="#1a1a1a"/><line x1="18" y1="54" x2="28" y2="56" stroke="#1a1a1a" stroke-width="2"/><line x1="18" y1="58" x2="28" y2="58" stroke="#1a1a1a" stroke-width="2"/><line x1="18" y1="62" x2="28" y2="60" stroke="#1a1a1a" stroke-width="2"/><line x1="72" y1="56" x2="82" y2="54" stroke="#1a1a1a" stroke-width="2"/><line x1="72" y1="58" x2="82" y2="58" stroke="#1a1a1a" stroke-width="2"/><line x1="72" y1="60" x2="82" y2="62" stroke="#1a1a1a" stroke-width="2"/><path d="M42 68 Q50 74 58 68" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/><path d="M15 20 Q30 8 50 18 Q70 8 85 20" fill="#FFD700" stroke="none"/></svg>` },
  { id: "goku", name: "Goku", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="42" fill="#FFCC80"/><path d="M15 30 Q25 -5 40 20 Q45 -10 55 15 Q60 -5 70 20 Q80 -5 85 30" fill="#1a1a1a"/><ellipse cx="37" cy="50" rx="7" ry="8" fill="white"/><ellipse cx="63" cy="50" rx="7" ry="8" fill="white"/><circle cx="37" cy="51" r="4" fill="#1a1a1a"/><circle cx="63" cy="51" r="4" fill="#1a1a1a"/><circle cx="35" cy="49" r="1.5" fill="white"/><circle cx="61" cy="49" r="1.5" fill="white"/><path d="M44 66 Q50 72 56 66" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round"/><rect x="35" y="82" width="30" height="16" rx="3" fill="#FF6F00"/><rect x="47" y="82" width="6" height="16" fill="#1565C0"/></svg>` },
  { id: "kirby", name: "Kirby", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="52" r="44" fill="#FFB6C1"/><ellipse cx="38" cy="44" rx="8" ry="10" fill="white"/><ellipse cx="58" cy="44" rx="8" ry="10" fill="white"/><ellipse cx="40" cy="46" rx="5" ry="7" fill="#2196F3"/><ellipse cx="56" cy="46" rx="5" ry="7" fill="#2196F3"/><circle cx="39" cy="43" r="2.5" fill="white"/><circle cx="55" cy="43" r="2.5" fill="white"/><ellipse cx="40" cy="49" rx="3" ry="4" fill="#1565C0"/><ellipse cx="56" cy="49" rx="3" ry="4" fill="#1565C0"/><ellipse cx="28" cy="60" rx="7" ry="5" fill="#FF69B4" opacity="0.5"/><ellipse cx="68" cy="60" rx="7" ry="5" fill="#FF69B4" opacity="0.5"/><ellipse cx="48" cy="60" rx="8" ry="5" fill="#E74C3C"/><ellipse cx="15" cy="65" rx="12" ry="8" fill="#FF1493"/><ellipse cx="85" cy="65" rx="12" ry="8" fill="#FF1493"/></svg>` },
  { id: "chopper", name: "Chopper", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="55" r="40" fill="#D2B48C"/><ellipse cx="50" cy="60" rx="30" ry="28" fill="#FAEBD7"/><circle cx="50" cy="22" r="14" fill="#FF1493"/><rect x="42" y="12" width="16" height="16" rx="3" fill="#FF1493"/><line x1="44" y1="15" x2="44" y2="26" stroke="white" stroke-width="3"/><line x1="38" y1="20" x2="50" y2="20" stroke="white" stroke-width="3"/><polygon points="30,22 24,5 38,18" fill="#8B4513"/><polygon points="70,22 76,5 62,18" fill="#8B4513"/><circle cx="40" cy="52" r="7" fill="white"/><circle cx="60" cy="52" r="7" fill="white"/><circle cx="40" cy="53" r="4" fill="#1a1a1a"/><circle cx="60" cy="53" r="4" fill="#1a1a1a"/><circle cx="38" cy="51" r="1.5" fill="white"/><circle cx="58" cy="51" r="1.5" fill="white"/><ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#E74C3C"/><path d="M43 70 Q50 76 57 70" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/></svg>` },
  { id: "spongebob", name: "SpongeBob", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="10" fill="#FCEB3B"/><circle cx="35" cy="40" r="12" fill="white" stroke="#1a1a1a" stroke-width="2"/><circle cx="65" cy="40" r="12" fill="white" stroke="#1a1a1a" stroke-width="2"/><circle cx="35" cy="40" r="4" fill="#3B82F6"/><circle cx="65" cy="40" r="4" fill="#3B82F6"/><circle cx="35" cy="40" r="2" fill="#1a1a1a"/><circle cx="65" cy="40" r="2" fill="#1a1a1a"/><path d="M30 65 Q50 85 70 65" fill="none" stroke="#1a1a1a" stroke-width="3"/><circle cx="25" cy="25" r="4" fill="#D4C82A"/><circle cx="75" cy="25" r="3" fill="#D4C82A"/><circle cx="20" cy="70" r="5" fill="#D4C82A"/><circle cx="80" cy="65" r="4" fill="#D4C82A"/></svg>` },
  { id: "spiderman", name: "Spider-Man", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#E53935"/><path d="M50 4 L50 96 M4 50 L96 50 M17 17 L83 83 M17 83 L83 17" stroke="#1a1a1a" stroke-width="1.5" opacity="0.3"/><polygon points="20,40 45,60 15,65" fill="white" stroke="#1a1a1a" stroke-width="2"/><polygon points="80,40 55,60 85,65" fill="white" stroke="#1a1a1a" stroke-width="2"/></svg>` },
];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Subcomponents
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl minimal-card bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 animate-in slide-in-from-bottom-5">
      {type === 'success' && <Check size={18} className="text-zinc-400 dark:text-zinc-500" />}
      {type === 'error' && <AlertCircle size={18} className="text-red-400" />}
      {type === 'info' && <Info size={18} className="text-zinc-400 dark:text-zinc-500" />}
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity"><X size={16} /></button>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="minimal-card w-full max-w-sm overflow-hidden p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X size={18} /></button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || '#18181b');

  const [activeTab, setActiveTab] = useState('avatar');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  const [extensionId, setExtensionId] = useState(localStorage.getItem(EXTENSION_ID_KEY) || '');
  const [isIdVisible, setIsIdVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('classic');
  const [avatarSize, setAvatarSize] = useState(52);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync theme changes locally and to extension
  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    localStorage.setItem('themeColor', themeColor);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    if (extensionId) {
      const win = window as any;
      if (win.chrome && win.chrome.runtime) {
        win.chrome.runtime.sendMessage(extensionId, {
          type: "SET_THEME_PREFS",
          payload: { isDark: isDarkMode, color: themeColor }
        });
      }
    }
  }, [themeColor, isDarkMode, extensionId]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    for (const [key, value] of params.entries()) {
      if (key.startsWith('utm_')) utms[key] = value;
    }
    setUtmParams(utms);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = totalScroll / windowHeight;
      setScrollProgress(Number(scroll) * 100);
      setShowBackToTop(totalScroll > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (extensionId) localStorage.setItem(EXTENSION_ID_KEY, extensionId);
  }, [extensionId]);

  const sendToExtension = (payload: any) => {
    if (!extensionId) {
      setToast({ message: 'Please set your Extension ID in Settings first.', type: 'error' });
      return;
    }
    const win = window as any;
    if (!win.chrome || !win.chrome.runtime) {
      setToast({ message: 'Chrome extension API not available in this environment.', type: 'error' });
      return;
    }
    win.chrome.runtime.sendMessage(extensionId, payload, (response: any) => {
      if (win.chrome.runtime.lastError) {
        setToast({ message: `Error: ${win.chrome.runtime.lastError.message}`, type: 'error' });
      } else if (response?.success) {
        setToast({ message: 'Synced to extension.', type: 'success' });
      }
    });
  };

  const handleReset = () => {
    setExtensionId('');
    setSelectedAvatar('classic');
    setAvatarSize(52);
    setCustomImage(null);
    setThemeColor('#18181b');
    setIsDarkMode(false);
    localStorage.removeItem(EXTENSION_ID_KEY);
    setIsResetModalOpen(false);
    setToast({ message: 'Settings reset to default.', type: 'info' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    setTimeout(() => {
      setContactStatus(Math.random() > 0.2 ? 'success' : 'error');
    }, 1500);
  };

  const filteredAvatars = PRESET_AVATARS.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" />
      </div>
    );
  }

  // Notice FAQ is removed from Nav!
  const navItems = [
    { id: 'avatar', icon: Home, label: 'Avatar' },
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'contact', icon: Mail, label: 'Support' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
  ];

  return (
    <div className="flex h-screen font-sans bg-zinc-50 dark:bg-zinc-950 overflow-hidden text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium">
        Skip to content
      </a>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 h-1 z-50 transition-all duration-150" style={{ width: `${scrollProgress}%`, backgroundColor: themeColor }} />

      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-20'} hidden md:flex`}>
        <div className="h-16 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800 shrink-0 cursor-pointer" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: themeColor }}>
             <div className="w-2.5 h-2.5 rounded-full bg-white" />
          </div>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'text-white shadow-md' 
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-100 dark:hover:bg-zinc-800'
              }`}
              style={activeTab === item.id ? { backgroundColor: themeColor } : {}}
              title={item.label}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : ''} />
              {isSidebarExpanded && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col h-screen relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: themeColor }}>
               <div className="w-2.5 h-2.5 rounded-full bg-white" />
             </div>
             <span className="font-bold">Privacy Agent</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
             {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute inset-0 z-30 flex pt-16 top-0">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-full bg-white dark:bg-zinc-950 h-auto border-b border-zinc-200 dark:border-zinc-800 p-4 shadow-xl">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl font-medium transition-colors ${
                      activeTab === item.id 
                        ? 'text-white' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                    }`}
                    style={activeTab === item.id ? { backgroundColor: themeColor } : {}}
                  >
                    <item.icon size={18} strokeWidth={2.5} /> {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main id="main-content" className="flex-1 overflow-y-auto w-full px-6 py-6 md:px-12 md:py-8">
          <div className="max-w-6xl mx-auto w-full flex flex-col">
            
            {/* Unified Top Action Bar */}
            <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <h1 className="text-3xl font-bold tracking-tight capitalize">
                   {activeTab === 'avatar' ? 'Your Avatar' : activeTab === 'settings' ? 'Settings & FAQ' : activeTab}
                </h1>
                <p className="text-zinc-500 text-sm mt-1">
                   {activeTab === 'avatar' && 'Customize your digital companion.'}
                   {activeTab === 'settings' && 'Configure appearance and syncing.'}
                   {activeTab === 'contact' && 'Get in touch with support.'}
                   {activeTab === 'analytics' && 'Session tracking metrics.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input 
                    type="text" placeholder="Search everywhere..." value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); if (activeTab !== 'avatar') setActiveTab('avatar'); }}
                    className="pl-10 minimal-input w-full md:w-64 rounded-full py-2 bg-white dark:bg-zinc-900 shadow-sm focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                    style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
                  />
                </div>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)} 
                  className="p-2.5 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
                  title="Toggle Theme"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
            </div>
          
          {/* AVATAR TAB - New Premium Redesign */}
          {activeTab === 'avatar' && (
            <div className="animate-in fade-in duration-500 space-y-8 w-full">
              
              {/* Top Hero: Current Avatar */}
              <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-black text-white p-8 md:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                {/* Background ambient glow */}
                <div className="absolute inset-0 opacity-20 blur-3xl pointer-events-none" style={{ backgroundColor: themeColor }}></div>
                
                <div className="relative z-10 flex-shrink-0">
                  <div 
                    className="shadow-2xl ring-4 ring-offset-4 ring-offset-zinc-900 dark:ring-offset-black transition-transform duration-500 hover:scale-105"
                    style={{
                      width: `${Math.max(120, avatarSize * 1.5)}px`, height: `${Math.max(120, avatarSize * 1.5)}px`,
                      borderRadius: '50%', overflow: 'hidden',
                      backgroundColor: customImage ? 'transparent' : 'var(--fallback-color, #27272a)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 'bold', fontSize: `${Math.max(120, avatarSize * 1.5) * 0.4}px`,
                      borderColor: themeColor,
                      boxShadow: `0 0 40px ${themeColor}40`
                    }}
                  >
                    {customImage ? <img src={customImage} className="w-full h-full object-cover" /> : (
                      selectedAvatar === 'robot' ? '🤖' : selectedAvatar === 'minimal' ? '⚪' : '✦'
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: themeColor }}>
                      <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }}></span>
                      Active Profile
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold capitalize tracking-tight mb-2">
                      {selectedAvatar.replace('-', ' ')}
                    </h2>
                    <p className="text-zinc-400 max-w-md mx-auto md:mx-0">
                      This avatar represents your privacy agent across all websites.
                    </p>
                  </div>
                  
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="minimal-btn-primary !px-8 !py-3 w-full sm:w-auto" style={{ backgroundColor: themeColor }}>
                      Upload Custom Photo
                    </button>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-2 w-full sm:w-auto">
                      <span className="text-xs font-medium text-zinc-300">Size</span>
                      <input 
                        type="range" min="32" max="96" step="2" value={avatarSize}
                        onChange={(e) => {
                          const size = parseInt(e.target.value, 10);
                          setAvatarSize(size);
                          sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { size } });
                        }}
                        className="w-24 accent-white"
                      />
                      <span className="text-xs font-medium text-zinc-300 w-6">{avatarSize}</span>
                    </div>
                  </div>
                  
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCustomImage(reader.result as string);
                        setSelectedAvatar('custom-upload');
                        sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { style: 'custom', image: reader.result } });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </div>
              </div>

              {/* Presets Gallery */}
              <div className="pt-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Character Gallery</h3>
                  {searchQuery && <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{filteredAvatars.length} found</span>}
                </div>
                
                {filteredAvatars.length === 0 ? (
                  <div className="minimal-card py-16 text-center text-zinc-500">
                    <div className="text-4xl mb-4 opacity-50">🔍</div>
                    <p>No matches found for "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                    {/* Always show base styles if no search */}
                    {(!searchQuery) && [
                      { id: 'classic', icon: '✦', name: 'Classic' },
                      { id: 'robot', icon: '🤖', name: 'Robot' },
                      { id: 'minimal', icon: '⚪', name: 'Minimal' },
                    ].map(style => (
                      <button 
                        key={style.id}
                        onClick={() => {
                          setSelectedAvatar(style.id); setCustomImage(null);
                          sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { style: style.id, image: null } });
                        }}
                        className={`group relative flex flex-col items-center gap-4 p-6 rounded-3xl transition-all duration-300 ${
                          selectedAvatar === style.id 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl scale-105 z-10 ring-2 ring-offset-2 dark:ring-offset-zinc-950' 
                            : 'bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-md hover:-translate-y-1'
                        }`}
                        style={selectedAvatar === style.id ? { '--tw-ring-color': themeColor } as React.CSSProperties : {}}
                      >
                        <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{style.icon}</div>
                        <span className="text-xs font-bold uppercase tracking-wider">{style.name}</span>
                      </button>
                    ))}

                    {/* Animated Characters */}
                    {filteredAvatars.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => {
                          const dataUrl = svgToDataUrl(preset.svg);
                          setSelectedAvatar(preset.id); setCustomImage(dataUrl);
                          sendToExtension({ type: 'SET_AVATAR_PREFS', payload: { style: 'custom', image: dataUrl } });
                        }}
                        className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl transition-all duration-300 ${
                          selectedAvatar === preset.id 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl scale-105 z-10 ring-2 ring-offset-2 dark:ring-offset-zinc-950' 
                            : 'bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-md hover:-translate-y-1'
                        }`}
                        style={selectedAvatar === preset.id ? { '--tw-ring-color': themeColor } as React.CSSProperties : {}}
                      >
                        <img src={svgToDataUrl(preset.svg)} className="w-14 h-14 rounded-full drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-xs font-bold text-center w-full truncate tracking-wide">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="animate-in fade-in duration-500 max-w-4xl space-y-8 w-full">
              <header className="mb-10">
                <h2 className="text-4xl font-bold tracking-tight mb-2">Settings & FAQ</h2>
                <p className="text-zinc-500">Configure appearance, extension syncing, and view help.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Col: Settings */}
                <div className="space-y-6">
                  
                  {/* Theme Switcher */}
                  <div className="minimal-card p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Appearance</h3>
                    
                    <div className="mb-6">
                      <label className="block text-xs font-semibold text-zinc-500 mb-3">Mode</label>
                      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-full">
                        <button onClick={() => setIsDarkMode(false)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-colors ${!isDarkMode ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                          <Sun size={14} /> Light
                        </button>
                        <button onClick={() => setIsDarkMode(true)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-colors ${isDarkMode ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                          <Moon size={14} /> Dark
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-3">Accent Color</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { name: 'Monochrome', hex: '#18181b' },
                          { name: 'Rose', hex: '#e11d48' },
                          { name: 'Emerald', hex: '#059669' },
                          { name: 'Indigo', hex: '#4f46e5' },
                          { name: 'Sky', hex: '#0284c7' },
                          { name: 'Amber', hex: '#d97706' },
                        ].map(color => (
                          <button 
                            key={color.hex}
                            onClick={() => setThemeColor(color.hex)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${themeColor === color.hex ? 'ring-2 ring-offset-2 dark:ring-offset-zinc-950 ring-zinc-400' : ''}`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          >
                            {themeColor === color.hex && <Check size={16} className="text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Extension Sync */}
                  <div className="minimal-card p-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">Connection</h3>
                    <label className="block text-xs font-semibold text-zinc-500 mb-3">Extension ID</label>
                    <div className="flex gap-2 mb-2">
                      <div className="relative flex-1">
                        <input 
                          type={isIdVisible ? 'text' : 'password'}
                          value={extensionId}
                          onChange={(e) => setExtensionId(e.target.value)}
                          placeholder="Enter ID..."
                          className="minimal-input w-full pr-12"
                        />
                        <button onClick={() => setIsIdVisible(!isIdVisible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                          {isIdVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(extensionId); setToast({ message: 'Copied', type: 'info' }); }} className="minimal-btn-secondary px-4 text-sm">
                        <Copy size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500">Connecting allows syncing theme & avatar changes to the browser agent.</p>
                  </div>

                  {/* Danger Zone */}
                  <div className="minimal-card p-6 border-red-200 dark:border-red-900/30">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-2">Danger Zone</h3>
                    <p className="text-xs text-zinc-500 mb-4">Wipe all local settings and preferences.</p>
                    <button onClick={() => setIsResetModalOpen(true)} className="minimal-btn-secondary !text-red-500 !bg-red-50 dark:!bg-red-500/10 hover:!bg-red-100 px-6 py-2.5 text-sm w-full">
                      Reset All Data
                    </button>
                  </div>
                </div>

                {/* Right Col: FAQ */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-2 pl-2">Frequently Asked Questions</h3>
                  {[
                    { q: "How do I connect the extension?", a: "Go to System, paste your Extension ID from the chrome://extensions page, and settings will sync automatically." },
                    { q: "Can I use my own image?", a: "Yes, in the Avatar tab, use the Upload Custom button to select an image from your device." },
                    { q: "Is tracking data shared?", a: "No, everything runs locally. The dashboard simply talks to your local browser extension." },
                    { q: "How do themes work?", a: "Choosing Light or Dark mode, or changing the Accent color here will instantly sync to your extension panel." },
                    { q: "Why is the Vault empty?", a: "The vault stores data securely on-device. You must add data to it or 'import from page' before autofill works." }
                  ].map((faq, i) => (
                    <details key={i} className="minimal-card p-5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <summary className="flex justify-between items-center font-medium text-sm list-none">
                        {faq.q}
                        <span className="text-zinc-400 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-full group-open:rotate-180 transition-transform"><ChevronDown size={16} /></span>
                      </summary>
                      <p className="mt-4 text-xs text-zinc-500 leading-relaxed animate-in slide-in-from-top-2">{faq.a}</p>
                    </details>
                  ))}
                </div>
                
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="animate-in fade-in duration-500 max-w-xl space-y-8 w-full">
              <header className="mb-10">
                <h2 className="text-4xl font-bold tracking-tight mb-2">Support</h2>
                <p className="text-zinc-500">Send us a message.</p>
              </header>

              {contactStatus === 'success' ? (
                <div className="minimal-card p-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-green-500"><Check size={32} /></div>
                  <h3 className="text-xl font-semibold mb-2">Message Sent</h3>
                  <p className="text-zinc-500 text-sm mb-8">We will be in touch shortly.</p>
                  <button onClick={() => setContactStatus('idle')} className="minimal-btn-secondary px-6 py-2.5 text-sm">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="minimal-card p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Name</label>
                      <input required type="text" className="minimal-input w-full" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email</label>
                      <input required type="email" className="minimal-input w-full" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Message</label>
                    <textarea required rows={4} className="minimal-input w-full resize-none" placeholder="..." />
                  </div>
                  <button disabled={contactStatus === 'loading'} type="submit" className="minimal-btn-primary w-full py-3.5">
                    {contactStatus === 'loading' ? <Loader2 size={18} className="animate-spin" /> : 'Submit'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-500 max-w-2xl space-y-8 w-full">
              <header className="mb-10">
                <h2 className="text-4xl font-bold tracking-tight mb-2">Analytics</h2>
                <p className="text-zinc-500">Session tracking metrics.</p>
              </header>

              <div className="minimal-card p-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6">UTM Parameters</h3>
                {Object.keys(utmParams).length === 0 ? (
                  <p className="text-sm text-zinc-500 py-4">No parameters found in the current URL.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(utmParams).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <span className="font-mono text-xs font-medium text-zinc-400">{k}</span>
                        <span className="text-sm font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          </div>
        </main>
      </div>

      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 right-8 p-3.5 minimal-btn-primary shadow-xl z-40 transition-all duration-300 ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
      >
        <ArrowUp size={20} />
      </button>

      <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Settings?">
        <p className="text-sm text-zinc-500 mb-8">This will wipe all preferences. You cannot undo this action.</p>
        <div className="flex gap-3">
          <button onClick={() => setIsResetModalOpen(false)} className="flex-1 minimal-btn-secondary py-2.5 text-sm">Cancel</button>
          <button onClick={handleReset} className="flex-1 minimal-btn-primary !bg-red-500 !text-white hover:!opacity-90 py-2.5 text-sm">Reset</button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
