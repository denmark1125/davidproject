
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Layers, Camera, Mail, MapPin, 
  ChevronRight, Menu, X, Settings, 
  Save, Plus, Trash2, Globe, TrendingUp,
  Lock, LogOut, Image as ImageIcon, Briefcase, BarChart3, Upload,
  Instagram, FileText, ExternalLink
} from 'lucide-react';
import { DEFAULT_DATA } from './data';
import { ResumeData, Experience, Skill, PortfolioItem, PerformanceMetric } from './types';
import { SectionTitle } from './components/SectionTitle';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const STORAGE_KEY = 'david_portfolio_data_v3';
const ADMIN_PASSWORD = 'admin123';

const App: React.FC = () => {
  const [data, setData] = useState<ResumeData>(DEFAULT_DATA);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState('全部 (All)');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "portfolio", "david");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setData(docSnap.data() as ResumeData);
        } else {
          // Fallback to localStorage if no firebase data yet
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            setData(JSON.parse(saved));
          }
        }
      } catch (e) {
        console.error("Failed to load data from Firebase", e);
        // Fallback to localStorage on error
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setData(JSON.parse(saved));
          } catch (err) {
            console.error("Failed to parse local data", err);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setIsAdminMode(true);
      setPasswordInput('');
    } else {
      alert("密碼錯誤！(Wrong Password)");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdminMode(false);
  };

  const handleSaveData = async (newData: ResumeData) => {
    try {
      setData(newData);
      // Save to Firestore
      const docRef = doc(db, "portfolio", "david");
      await setDoc(docRef, newData);
      
      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      alert("內容已成功發布並同步至雲端資料庫！");
    } catch (e) {
      console.error("Error saving to Firebase", e);
      alert("儲存至雲端失敗，但已暫存於本地。請檢查網路連線。");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    }
  };

  const categories = ['全部 (All)', ...Array.from(new Set(data.portfolio.map(item => item.category)))];
  const filteredPortfolio = activeCategory === '全部 (All)' 
    ? data.portfolio 
    : data.portfolio.filter(item => item.category === activeCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-yellow-400 font-black tracking-widest uppercase text-xs">Loading Portfolio Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-yellow-200 font-sans transition-colors duration-500">
      
      {/* 管理按鈕 */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {isLoggedIn ? (
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group border-2 border-yellow-400"
          >
            {isAdminMode ? <LogOut size={20} /> : <Settings size={20} />}
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold text-xs uppercase tracking-widest">
              {isAdminMode ? '返回前台' : '進入後台'}
            </span>
          </button>
        ) : (
          <button 
            onClick={() => setShowLoginModal(true)}
            className="bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group"
          >
            <Lock size={20} />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold text-xs uppercase tracking-widest">
              管理登入
            </span>
          </button>
        )}
      </div>

      {/* 登入彈窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-6 border border-gray-100">
            <div className="text-center">
              <div className="bg-yellow-400 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-100">
                <Lock className="text-black" size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900">身分驗證</h2>
              <p className="text-gray-400 text-sm mt-2 font-medium">請輸入您的專屬密碼以更改資料</p>
            </div>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:bg-white focus:outline-none transition-all text-center text-xl tracking-widest"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex gap-4 pt-2">
              <button onClick={() => setShowLoginModal(false)} className="flex-1 py-4 text-gray-500 font-black uppercase text-xs tracking-widest">取消</button>
              <button onClick={handleLogin} className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-colors">登入</button>
            </div>
          </div>
        </div>
      )}

      {isAdminMode && isLoggedIn && (
        <AdminPanel data={data} onSave={handleSaveData} onClose={() => setIsAdminMode(false)} onLogout={handleLogout} />
      )}

      {/* --- 前台展示 --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'glass py-4 shadow-sm border-b border-gray-100' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-black tracking-tighter text-gray-900">{data.personalInfo.englishName.toUpperCase()}</span>
          </div>
          <div className="hidden md:flex space-x-12 text-[10px] font-black tracking-[0.3em] uppercase text-gray-400">
            <a href="#home" className="hover:text-yellow-500 transition-colors">Home / 首頁</a>
            <a href="#about" className="hover:text-yellow-500 transition-colors">About / 關於</a>
            <a href="#experience" className="hover:text-yellow-500 transition-colors">Exp / 經歷</a>
            <a href="#portfolio" className="hover:text-yellow-500 transition-colors">Works / 作品</a>
            <a href="#contact" className="hover:text-yellow-500 transition-colors">Contact / 聯絡</a>
          </div>
          <button className="md:hidden text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28}/> : <Menu size={28}/>}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white md:hidden flex flex-col items-center justify-center space-y-8 transition-all duration-300">
          <button className="absolute top-8 right-8 text-gray-900" onClick={() => setIsMenuOpen(false)}>
            <X size={32} />
          </button>
          <div className="flex flex-col items-center space-y-8 text-2xl font-black tracking-[0.2em] uppercase text-gray-900">
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-500 transition-colors">Home / 首頁</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-500 transition-colors">About / 關於</a>
            <a href="#experience" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-500 transition-colors">Exp / 經歷</a>
            <a href="#portfolio" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-500 transition-colors">Works / 作品</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-yellow-500 transition-colors">Contact / 聯絡</a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center overflow-hidden bg-black scroll-mt-24">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1920" 
            className="w-full h-full object-cover opacity-20 scale-110"
            alt="Hero"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
          <div className="space-y-4 md:space-y-8">
            <h2 className="text-[10px] md:text-base font-black tracking-[0.3em] md:tracking-[0.5em] uppercase text-yellow-500">夢想實踐家 (Leader of Myself)</h2>
            <h1 className="text-4xl sm:text-7xl md:text-[10rem] font-black leading-tight md:leading-[0.85] tracking-tighter">
              {data.personalInfo.name}<br/>
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>{data.personalInfo.englishName.toUpperCase()}</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-2xl text-gray-400 font-medium leading-relaxed pt-1 md:pt-4">
              {data.personalInfo.title}
            </p>
            <div className="pt-6 md:pt-12 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                {data.personalInfo.pdfUrl ? (
                  <>
                    <button 
                      onClick={() => setShowPdfViewer(true)}
                      className="bg-yellow-400 text-black px-8 md:px-14 py-4 md:py-6 font-black text-[11px] md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase hover:bg-white transition-all flex items-center justify-center rounded-sm shadow-2xl shadow-yellow-400/20"
                    >
                      查看完整作品集 (Full PDF) <FileText className="ml-2 md:ml-3" size={16} md:size={18}/>
                    </button>
                    <a href="#contact" className="border-2 border-white/20 hover:border-white hover:text-white px-8 md:px-14 py-4 md:py-6 font-black text-[11px] md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all rounded-sm text-center text-gray-300">
                      聯絡我 (Connect)
                    </a>
                  </>
                ) : (
                  <>
                    <a href="#portfolio" className="bg-yellow-400 text-black px-8 md:px-14 py-4 md:py-6 font-black text-[11px] md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase hover:bg-white transition-all flex items-center justify-center rounded-sm shadow-2xl shadow-yellow-400/20">
                      看我的作品 (View Works) <ChevronRight className="ml-2 md:ml-3" size={16} md:size={18}/>
                    </a>
                    <a href="#contact" className="border-2 border-white/20 hover:border-white hover:text-white px-8 md:px-14 py-4 md:py-6 font-black text-[11px] md:text-sm tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all rounded-sm text-center text-gray-300">
                      聯絡我 (Connect)
                    </a>
                  </>
                )}
              </div>
              
              {data.personalInfo.pdfUrl && (
                <a href="#portfolio" className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-500 hover:text-yellow-400 transition-colors flex items-center gap-2 group w-fit">
                  <span className="w-8 h-[1px] bg-gray-800 group-hover:bg-yellow-400 transition-colors"></span>
                  或瀏覽網頁版精選案例 (Or browse web gallery)
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 md:py-32 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="relative group">
              <div className="aspect-[4/5] bg-gray-50 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative">
                <img 
                  src={data.personalInfo.profileImageUrl} 
                  alt="Portrait" 
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 bg-gray-900 text-white p-6 md:p-12 rounded-[1rem] md:rounded-[2rem] shadow-2xl">
                <span className="text-3xl md:text-6xl font-black block text-yellow-400">10+</span>
                <span className="text-[8px] md:text-[10px] font-black tracking-[0.3em] uppercase text-gray-400">職涯年資 (Exp)</span>
              </div>
            </div>
            <div className="space-y-6 md:space-y-10 mt-8 lg:mt-0">
              <SectionTitle title="關於我" subtitle="About My Vision" />
              <div className="space-y-5 md:space-y-8 text-gray-600 leading-[1.6] md:leading-[2] text-base md:text-xl font-medium">
                <p className="text-gray-900 border-l-4 border-yellow-400 pl-4 md:pl-6 italic whitespace-pre-line text-lg md:text-xl">
                  "{data.personalInfo.bio}"
                </p>
                <div className="grid sm:grid-cols-2 gap-6 md:gap-12 pt-2 md:pt-8">
                  <div className="space-y-3">
                    <h4 className="font-black text-gray-900 text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2">
                      <Globe size={16} md:size={18} className="text-yellow-500"/> 基本資料
                    </h4>
                    <ul className="text-[11px] md:text-sm space-y-2 text-gray-500 font-bold">
                      <li className="flex justify-between border-b pb-1.5"><span>姓名 (Name)</span> <span className="text-gray-900">{data.personalInfo.name}</span></li>
                      <li className="flex justify-between border-b pb-1.5"><span>地點 (Loc)</span> <span className="text-gray-900">{data.personalInfo.location}</span></li>
                      <li className="flex justify-between border-b pb-1.5"><span>學歷 (Edu)</span> <span className="text-gray-900">文化大學 經濟學系</span></li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-black text-gray-900 text-[10px] md:text-sm uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp size={16} md:size={18} className="text-yellow-500"/> 聯絡管道
                    </h4>
                    <ul className="text-[11px] md:text-sm space-y-2 text-gray-500 font-bold">
                      <li className="flex justify-between border-b pb-1.5"><span>Email</span> <span className="text-gray-900 underline break-all ml-4">{data.personalInfo.email}</span></li>
                      <li className="flex justify-between border-b pb-1.5"><span>地區</span> <span className="text-gray-900">{data.personalInfo.location}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills & Stats */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24">
            <div className="space-y-12">
              <SectionTitle title="專業技能" subtitle="Technical Mastery" />
              <div className="space-y-12">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center">
                      <Layers className="mr-3 text-yellow-500" size={20}/>
                      {skill.category}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {skill.items.map((item, i) => (
                        <span key={i} className="bg-white border-2 border-transparent px-7 py-3 rounded-full text-sm font-black text-gray-700 shadow-sm hover:border-yellow-400 hover:text-black transition-all cursor-default">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-12">
              <SectionTitle title="實戰績效" subtitle="Proven Results" />
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {data.performance.map((p) => (
                  <div key={p.id} className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 group hover:bg-gray-900 transition-all duration-500">
                    <span className="text-2xl sm:text-3xl md:text-5xl font-black text-gray-900 block mb-2 md:mb-3 group-hover:text-yellow-400 transition-colors">{p.value}</span>
                    <span className="text-[8px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] md:tracking-[0.2em] group-hover:text-white transition-colors">{p.label}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-900 p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={120} className="text-white"/></div>
                <p className="font-black text-yellow-400 uppercase tracking-[0.3em] text-[10px] mb-6">Core Focus / 核心優勢</p>
                <p className="text-white text-lg font-medium leading-[1.8] italic">
                  "擅長透過視覺敘事與數據分析，將品牌價值轉化為實際營收，具備完整的產品生命週期管理經驗。"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Timeline */}
      <section id="experience" className="py-16 md:py-32 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="工作經歷" subtitle="Career Journey" />
          <div className="relative border-l-2 md:border-l-8 border-gray-900 ml-1.5 md:ml-0 space-y-12 md:space-y-24 pt-6 md:pt-12">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="relative pl-6 md:pl-12 group">
                <div className="absolute -left-[7px] md:-left-[16px] top-0 w-3 h-3 md:w-8 md:h-8 rounded-full bg-yellow-400 border md:border-4 border-gray-900 group-hover:scale-125 transition-all"></div>
                <div className="grid lg:grid-cols-[180px_1fr] gap-3 md:gap-8">
                  <div className="space-y-1 md:space-y-2">
                    <span className="text-lg md:text-2xl font-black text-gray-300 tabular-nums block">{exp.period}</span>
                    <span className="text-[7px] md:text-[10px] font-black text-yellow-600 uppercase tracking-widest bg-yellow-50 px-2 md:px-3 py-0.5 md:py-1 rounded inline-block">Professional Role</span>
                  </div>
                  <div className="space-y-3 md:space-y-6">
                    <h3 className="text-xl md:text-3xl font-black text-gray-900 group-hover:text-yellow-600 transition-colors">{exp.company}</h3>
                    <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-gray-400">{exp.role}</p>
                    <ul className="space-y-2 md:space-y-4 pt-3 md:pt-4 border-t border-gray-50">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-gray-600 flex items-start text-sm md:text-lg font-medium leading-relaxed">
                          <span className="mr-2 md:mr-4 text-yellow-500 font-black">/</span>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-16 md:py-32 bg-gray-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="精選作品" subtitle="Creative Gallery" />
          <div className="flex flex-wrap gap-2 md:gap-4 mb-8 md:mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 md:px-10 py-2.5 md:py-4 text-[7px] md:text-[10px] font-black tracking-[0.15em] md:tracking-[0.3em] uppercase transition-all rounded-full border-2 ${activeCategory === cat ? 'bg-gray-900 border-gray-900 text-white shadow-2xl' : 'bg-white border-transparent text-gray-400 hover:border-yellow-400 hover:text-black shadow-sm'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {filteredPortfolio.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedPortfolioItem(item)}
                className="group bg-white rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col border border-gray-50 cursor-pointer"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-yellow-400 text-black font-black text-[7px] md:text-[10px] px-5 md:px-8 py-2.5 md:py-4 tracking-[0.2em] md:tracking-[0.3em] uppercase shadow-2xl">View Case / 查看詳情</div>
                  </div>
                  <div className="absolute top-3 left-3 md:top-6 md:left-6">
                    <span className="bg-gray-900 text-white text-[7px] md:text-[10px] font-black uppercase px-3 md:px-5 py-1.5 md:py-3 tracking-widest rounded-full shadow-2xl">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 md:p-10 flex-1 flex flex-col">
                  <h3 className="text-lg md:text-2xl font-black mb-2 md:mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-gray-400 text-[11px] md:text-sm leading-relaxed mb-6 md:mb-10 flex-1 font-medium italic">
                    "{item.description}"
                  </p>
                  <div className="pt-4 md:pt-6 border-t border-gray-50 flex justify-between items-center group/link">
                    <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-gray-300">Archive {item.id}</span>
                    <ChevronRight className="text-yellow-500 group-hover/link:translate-x-2 md:group-hover/link:translate-x-3 transition-transform" size={16} md:size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Detail Modal */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">
            <div className="lg:w-1/2 bg-gray-100 relative">
              <img 
                src={selectedPortfolioItem.imageUrl} 
                alt={selectedPortfolioItem.title} 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute top-6 left-6 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-4 rounded-full transition-all lg:hidden"
              >
                <X size={24} />
              </button>
            </div>
            <div className="lg:w-1/2 p-12 lg:p-20 overflow-y-auto space-y-10 relative">
              <button 
                onClick={() => setSelectedPortfolioItem(null)}
                className="absolute top-10 right-10 text-gray-300 hover:text-gray-900 transition-all hidden lg:block"
              >
                <X size={32} />
              </button>
              
              <div className="space-y-4">
                <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-6 py-2 tracking-widest rounded-full">
                  {selectedPortfolioItem.category}
                </span>
                <h2 className="text-5xl font-black text-gray-900 leading-tight">{selectedPortfolioItem.title}</h2>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Project Overview / 專案概覽</h4>
                <p className="text-xl text-gray-600 leading-relaxed font-medium">
                  {selectedPortfolioItem.description}
                </p>
              </div>

              {selectedPortfolioItem.longDescription && (
                <div className="space-y-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Details / 詳細內容</h4>
                  <p className="text-lg text-gray-500 leading-relaxed whitespace-pre-line">
                    {selectedPortfolioItem.longDescription}
                  </p>
                </div>
              )}

              {selectedPortfolioItem.externalLink && (
                <div className="pt-10">
                  <a 
                    href={selectedPortfolioItem.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-4 bg-gray-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200"
                  >
                    View Full Project / 查看完整內容 <ChevronRight size={18} className="text-yellow-400"/>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfViewer && data.personalInfo.pdfUrl && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-10">
          <div className="bg-white w-full h-full max-w-6xl rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 md:p-8 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-gray-900">詳細作品集 (Full Portfolio)</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Interactive PDF Viewer</p>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href={data.personalInfo.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-black transition-all"
                >
                  <ExternalLink size={14}/> 外部開啟
                </a>
                <button 
                  onClick={() => setShowPdfViewer(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 p-3 md:p-4 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-200 relative">
              <iframe 
                src={data.personalInfo.pdfUrl} 
                className="w-full h-full border-none"
                title="PDF Portfolio"
              />
            </div>
            <div className="p-4 md:hidden bg-gray-50 border-t">
              <a 
                href={data.personalInfo.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-xl font-black text-[10px] tracking-widest uppercase"
              >
                <ExternalLink size={14}/> 外部開啟 PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-32 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="聯絡我" subtitle="Get In Touch" />
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20">
            <div className="space-y-6 md:space-y-12">
              <h3 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">
                準備好開始您的<br/>
                <span className="text-yellow-500">下一個品牌旅程</span>了嗎？
              </h3>
              <p className="text-base md:text-xl text-gray-500 font-medium leading-relaxed max-w-md">
                無論是品牌設計、行銷策略或是攝影需求，歡迎隨時透過以下方式與我聯繫。
              </p>
              <div className="space-y-5 md:space-y-8 pt-2 md:pt-6">
                <div className="flex items-center gap-4 md:gap-6 group">
                  <div className="bg-gray-900 text-yellow-400 p-3.5 md:p-5 rounded-xl md:rounded-2xl group-hover:bg-yellow-400 group-hover:text-black transition-all">
                    <Mail size={18} md:size={24} />
                  </div>
                  <div>
                    <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                    <a href={`mailto:${data.personalInfo.email}`} className="text-base md:text-xl font-black text-gray-900 hover:text-yellow-600 transition-colors break-all ml-0">
                      {data.personalInfo.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4 md:gap-6 group">
                  <div className="bg-gray-900 text-yellow-400 p-3.5 md:p-5 rounded-xl md:rounded-2xl group-hover:bg-yellow-400 group-hover:text-black transition-all">
                    <MapPin size={18} md:size={24} />
                  </div>
                  <div>
                    <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-base md:text-xl font-black text-gray-900">{data.personalInfo.location}</p>
                  </div>
                </div>
                {data.personalInfo.instagramUrl && (
                  <div className="flex items-center gap-4 md:gap-6 group">
                    <div className="bg-gray-900 text-yellow-400 p-3.5 md:p-5 rounded-xl md:rounded-2xl group-hover:bg-yellow-400 group-hover:text-black transition-all">
                      <Instagram size={18} md:size={24} />
                    </div>
                    <div>
                      <p className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Instagram</p>
                      <a href={data.personalInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-base md:text-xl font-black text-gray-900 hover:text-yellow-600 transition-colors">
                        @{data.personalInfo.instagramUrl.split('/').filter(Boolean).pop()}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 md:p-12 lg:p-16 rounded-[1.5rem] md:rounded-[3rem] border border-gray-100 shadow-sm">
              <form className="space-y-5 md:space-y-8" onSubmit={(e) => { e.preventDefault(); alert('感謝您的訊息！我會盡快回覆您。'); }}>
                <div className="grid md:grid-cols-2 gap-5 md:gap-8">
                  <div className="space-y-2">
                    <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">您的姓名 (Name)</label>
                    <input type="text" required className="w-full bg-white border-2 border-transparent p-3.5 md:p-5 rounded-xl md:rounded-2xl focus:border-yellow-400 focus:outline-none font-bold shadow-sm text-sm" placeholder="David Xue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">電子郵件 (Email)</label>
                    <input type="email" required className="w-full bg-white border-2 border-transparent p-3.5 md:p-5 rounded-xl md:rounded-2xl focus:border-yellow-400 focus:outline-none font-bold shadow-sm text-sm" placeholder="hello@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">主旨 (Subject)</label>
                  <input type="text" required className="w-full bg-white border-2 border-transparent p-3.5 md:p-5 rounded-xl md:rounded-2xl focus:border-yellow-400 focus:outline-none font-bold shadow-sm text-sm" placeholder="品牌設計需求諮詢" />
                </div>
                <div className="space-y-2">
                  <label className="text-[7px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">訊息內容 (Message)</label>
                  <textarea rows={4} required className="w-full bg-white border-2 border-transparent p-4 md:p-6 rounded-xl md:rounded-3xl focus:border-yellow-400 focus:outline-none font-medium shadow-sm resize-none text-sm" placeholder="請描述您的需求..."></textarea>
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white py-4 md:py-6 rounded-xl md:rounded-2xl font-black text-[9px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3">
                  傳送訊息 (Send Message) <ChevronRight size={16} className="text-yellow-400"/>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
           <h2 className="text-3xl font-black tracking-tighter">{data.personalInfo.englishName.toUpperCase()}.</h2>
           <div className="flex justify-center space-x-8 text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase">
             <a href="#home" className="hover:text-yellow-400">Home</a>
             <a href="#about" className="hover:text-yellow-400">About</a>
             <a href="#experience" className="hover:text-yellow-400">Journey</a>
             <a href="#contact" className="hover:text-yellow-400">Contact</a>
           </div>
           <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">© {new Date().getFullYear()} David Xue. Crafted with Excellence.</p>
        </div>
      </footer>
    </div>
  );
};

// --- 後台編輯組件 (Admin Panel) ---
const AdminPanel: React.FC<{ data: ResumeData, onSave: (d: ResumeData) => void, onClose: () => void, onLogout: () => void }> = ({ data, onSave, onClose, onLogout }) => {
  const [localData, setLocalData] = useState<ResumeData>(JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState<'general' | 'experience' | 'skills' | 'portfolio' | 'performance'>('general');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const portfolioFileRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // 核心圖片讀取邏輯 (Core Image Reader)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | { portfolioId: string }) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newData = { ...localData };
        
        if (target === 'profile') {
          newData.personalInfo.profileImageUrl = base64String;
        } else {
          const idx = newData.portfolio.findIndex(item => item.id === target.portfolioId);
          if (idx !== -1) newData.portfolio[idx].imageUrl = base64String;
        }
        setLocalData(newData);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (type: 'experiences' | 'skills' | 'portfolio' | 'performance') => {
    const newData = { ...localData };
    if (type === 'experiences') {
      newData.experiences.unshift({ id: Date.now().toString(), period: '2024-現在', company: '新公司', role: '新職稱', description: ['職責一'] });
    } else if (type === 'skills') {
      newData.skills.push({ id: Date.now().toString(), category: '新領域', items: ['技能一', '技能二'] });
    } else if (type === 'performance') {
      newData.performance.push({ id: Date.now().toString(), label: '新數據標籤', value: '100%' });
    } else if (type === 'portfolio') {
      newData.portfolio.unshift({ id: Date.now().toString(), title: '新作品', category: '分類', description: '描述', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800' });
    }
    setLocalData(newData);
  };

  const removeItem = (type: 'experiences' | 'skills' | 'portfolio' | 'performance', id: string) => {
    const newData = { ...localData };
    newData[type] = newData[type].filter((item: any) => item.id !== id);
    setLocalData(newData);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-gray-50 flex flex-col font-sans">
      <div className="bg-white border-b px-8 py-6 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-6">
          <div className="bg-gray-900 p-3 rounded-2xl text-yellow-400 shadow-lg shadow-gray-200"><Settings size={24} /></div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">履歷系統後台控制中心</h2>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">Admin Dashboard / Professional Management</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={onLogout} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all">登出系統 (Logout)</button>
          <button onClick={onClose} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900">取消變更</button>
          <button onClick={() => { onSave(localData); onClose(); }} className="bg-gray-900 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl hover:bg-black transition-all">
            <Save size={18} className="text-yellow-400"/> 儲存並發布
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 bg-white border-r p-10 space-y-4">
          {[
            { id: 'general', label: '基本資訊 (General)', icon: <User size={20}/> },
            { id: 'experience', label: '工作經歷 (Career)', icon: <Briefcase size={20}/> },
            { id: 'skills', label: '專業技能 (Skills)', icon: <Layers size={20}/> },
            { id: 'portfolio', label: '作品藝廊 (Works)', icon: <ImageIcon size={20}/> },
            { id: 'performance', label: '績效數據 (Results)', icon: <BarChart3 size={20}/> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-yellow-400 text-gray-900 shadow-xl shadow-yellow-100' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-16 bg-gray-50/50">
          <div className="max-w-4xl mx-auto pb-24">
            
            {/* 1. General Info */}
            {activeTab === 'general' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-10">
                   <div className="relative group">
                     <div className="w-48 h-48 bg-gray-200 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                        <img src={localData.personalInfo.profileImageUrl} className="w-full h-full object-cover" />
                     </div>
                     <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2rem] text-white"
                     >
                        <Upload size={32} className="mb-2 text-yellow-400"/>
                        <span className="text-[10px] font-black uppercase tracking-widest">更換頭像</span>
                     </button>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'profile')} />
                   </div>
                   <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-gray-900">個人形象設定</h3>
                        <p className="text-gray-400 text-sm font-medium italic">"頭像將會同步更新於前台關於我區塊"</p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">頭像圖片連結 (可貼上網址)</label>
                        <input 
                          className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-yellow-400 focus:outline-none font-medium bg-white shadow-sm text-sm" 
                          value={localData.personalInfo.profileImageUrl} 
                          onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, profileImageUrl: e.target.value}})} 
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">姓名 (Chinese Name)</label>
                    <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.name} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, name: e.target.value}})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">英文名 (English Name)</label>
                    <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.englishName} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, englishName: e.target.value}})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">專業宣言 (Professional Title)</label>
                  <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.title} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, title: e.target.value}})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">自我介紹 (Detailed Bio)</label>
                  <textarea rows={6} className="w-full border-2 border-gray-100 p-6 rounded-3xl focus:border-yellow-400 focus:outline-none font-medium bg-white shadow-sm resize-none leading-relaxed" value={localData.personalInfo.bio} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, bio: e.target.value}})} />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">電子郵件 (Email Address)</label>
                    <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.email} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, email: e.target.value}})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">目前地點 (Current Location)</label>
                    <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.location} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, location: e.target.value}})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Instagram 網址 (Instagram URL)</label>
                    <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.instagramUrl || ''} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, instagramUrl: e.target.value}})} placeholder="https://www.instagram.com/username" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">PDF 作品集連結 (PDF Portfolio URL)</label>
                    <input className="w-full border-2 border-gray-100 p-5 rounded-2xl focus:border-yellow-400 focus:outline-none font-bold bg-white shadow-sm" value={localData.personalInfo.pdfUrl || ''} onChange={e => setLocalData({...localData, personalInfo: {...localData.personalInfo, pdfUrl: e.target.value}})} placeholder="https://example.com/portfolio.pdf" />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-gray-900">工作經歷管理</h3>
                  <button onClick={() => addItem('experiences')} className="bg-yellow-400 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-100">
                    <Plus size={16}/> 新增經歷項目
                  </button>
                </div>
                <div className="space-y-8">
                  {localData.experiences.map((exp, idx) => (
                    <div key={exp.id} className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-100 shadow-sm relative group hover:border-yellow-200 transition-all">
                      <button onClick={() => removeItem('experiences', exp.id)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={24}/></button>
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">期間</label>
                           <input className="w-full border-b-2 border-gray-50 p-2 font-black text-gray-900 focus:border-yellow-400 outline-none" value={exp.period} onChange={e => {
                              const next = [...localData.experiences];
                              next[idx].period = e.target.value;
                              setLocalData({...localData, experiences: next});
                           }} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">公司</label>
                           <input className="w-full border-b-2 border-gray-50 p-2 font-black text-gray-900 focus:border-yellow-400 outline-none" value={exp.company} onChange={e => {
                              const next = [...localData.experiences];
                              next[idx].company = e.target.value;
                              setLocalData({...localData, experiences: next});
                           }} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">職稱</label>
                           <input className="w-full border-b-2 border-gray-50 p-2 font-black text-gray-900 focus:border-yellow-400 outline-none" value={exp.role} onChange={e => {
                              const next = [...localData.experiences];
                              next[idx].role = e.target.value;
                              setLocalData({...localData, experiences: next});
                           }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">工作內容描述 (一條一行)</label>
                        <textarea className="w-full p-6 bg-gray-50 rounded-2xl text-sm font-medium leading-relaxed resize-none focus:bg-white border-2 border-transparent focus:border-yellow-400 outline-none" rows={5} value={exp.description.join('\n')} onChange={e => {
                          const next = [...localData.experiences];
                          next[idx].description = e.target.value.split('\n');
                          setLocalData({...localData, experiences: next});
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Portfolio - With Image Upload */}
            {activeTab === 'portfolio' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-gray-900">作品藝廊管理</h3>
                  <button onClick={() => addItem('portfolio')} className="bg-yellow-400 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-100">
                    <Plus size={16}/> 新增作品
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  {localData.portfolio.map((item, idx) => (
                    <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border-2 border-gray-100 group shadow-sm hover:border-yellow-200 transition-all flex flex-col">
                      <div className="aspect-video relative bg-gray-100 group/img">
                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all p-8">
                           <Upload className="text-yellow-400 mb-2" size={32}/>
                           <button 
                             onClick={() => portfolioFileRefs.current[item.id]?.click()}
                             className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-yellow-400 transition-all"
                           >
                              上傳新照片
                           </button>
                           <input 
                             type="file" 
                             ref={el => portfolioFileRefs.current[item.id] = el}
                             className="hidden" 
                             accept="image/*" 
                             onChange={(e) => handleImageUpload(e, { portfolioId: item.id })} 
                           />
                           <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mt-4">或直接修改下方 URL</p>
                        </div>
                      </div>
                      <div className="p-10 space-y-6 flex-1">
                        <div className="flex justify-between items-start gap-4">
                           <input className="font-black text-xl border-b-2 border-transparent focus:border-yellow-400 outline-none w-full" value={item.title} onChange={e => {
                             const next = [...localData.portfolio];
                             next[idx].title = e.target.value;
                             setLocalData({...localData, portfolio: next});
                           }} />
                           <button onClick={() => removeItem('portfolio', item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={20}/></button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">分類</label>
                            <input className="text-[10px] font-black uppercase tracking-widest text-yellow-600 bg-yellow-50 px-3 py-2 rounded w-full outline-none" value={item.category} onChange={e => {
                              const next = [...localData.portfolio];
                              next[idx].category = e.target.value;
                              setLocalData({...localData, portfolio: next});
                            }} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">圖片連結 (可貼上網址)</label>
                             <input 
                               className="text-[10px] font-medium text-gray-900 border rounded px-3 py-2 w-full outline-none focus:border-yellow-400 bg-white" 
                               value={item.imageUrl} 
                               onChange={e => {
                                 const next = [...localData.portfolio];
                                 next[idx].imageUrl = e.target.value;
                                 setLocalData({...localData, portfolio: next});
                               }}
                               placeholder="https://example.com/image.jpg"
                             />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">作品簡述</label>
                          <textarea className="w-full text-sm text-gray-600 bg-gray-50 border-2 border-transparent focus:border-yellow-200 rounded-2xl p-5 h-20 resize-none font-medium outline-none" value={item.description} onChange={e => {
                            const next = [...localData.portfolio];
                            next[idx].description = e.target.value;
                            setLocalData({...localData, portfolio: next});
                          }} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">詳細內容 (可換行)</label>
                          <textarea className="w-full text-sm text-gray-600 bg-gray-50 border-2 border-transparent focus:border-yellow-200 rounded-2xl p-5 h-32 resize-none font-medium outline-none" value={item.longDescription || ''} onChange={e => {
                            const next = [...localData.portfolio];
                            next[idx].longDescription = e.target.value;
                            setLocalData({...localData, portfolio: next});
                          }} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest">外部連結 (例如 Flickr 相簿網址)</label>
                          <input 
                            className="text-[10px] font-medium text-gray-900 border rounded px-3 py-2 w-full outline-none focus:border-yellow-400 bg-white" 
                            value={item.externalLink || ''} 
                            onChange={e => {
                              const next = [...localData.portfolio];
                              next[idx].externalLink = e.target.value;
                              setLocalData({...localData, portfolio: next});
                            }}
                            placeholder="https://flickr.com/photos/..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-gray-900">專業技能管理</h3>
                  <button onClick={() => addItem('skills')} className="bg-yellow-400 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-100">
                    <Plus size={16}/> 新增技能類別
                  </button>
                </div>
                <div className="space-y-8">
                  {localData.skills.map((skill, idx) => (
                    <div key={skill.id} className="bg-white p-10 rounded-[2.5rem] border-2 border-gray-100 shadow-sm relative group hover:border-yellow-200 transition-all">
                      <button onClick={() => removeItem('skills', skill.id)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={24}/></button>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">技能類別名稱 (Category Name)</label>
                          <input 
                            className="w-full border-b-2 border-gray-50 p-2 font-black text-gray-900 focus:border-yellow-400 outline-none text-xl" 
                            value={skill.category} 
                            onChange={e => {
                              const next = [...localData.skills];
                              next[idx].category = e.target.value;
                              setLocalData({...localData, skills: next});
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">技能項目 (以逗號分隔)</label>
                          <textarea 
                            className="w-full p-6 bg-gray-50 rounded-2xl text-sm font-medium leading-relaxed resize-none focus:bg-white border-2 border-transparent focus:border-yellow-400 outline-none" 
                            rows={3} 
                            value={skill.items.join(', ')} 
                            onChange={e => {
                              const next = [...localData.skills];
                              next[idx].items = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
                              setLocalData({...localData, skills: next});
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Performance */}
            {activeTab === 'performance' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-3xl font-black text-gray-900">績效數據管理</h3>
                  <button onClick={() => addItem('performance')} className="bg-yellow-400 px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-yellow-300 transition-all shadow-xl shadow-yellow-100">
                    <Plus size={16}/> 新增數據項目
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {localData.performance.map((p, idx) => (
                    <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-sm relative group hover:border-yellow-200 transition-all">
                      <button onClick={() => removeItem('performance', p.id)} className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">數據標籤 (Label)</label>
                          <input 
                            className="w-full border-b-2 border-gray-50 p-2 font-black text-gray-900 focus:border-yellow-400 outline-none" 
                            value={p.label} 
                            onChange={e => {
                              const next = [...localData.performance];
                              next[idx].label = e.target.value;
                              setLocalData({...localData, performance: next});
                            }} 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">數據數值 (Value)</label>
                          <input 
                            className="w-full border-b-2 border-gray-50 p-2 font-black text-gray-900 focus:border-yellow-400 outline-none text-2xl" 
                            value={p.value} 
                            onChange={e => {
                              const next = [...localData.performance];
                              next[idx].value = e.target.value;
                              setLocalData({...localData, performance: next});
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
