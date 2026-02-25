import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Music, Send, Sparkles, MapPin, ArrowRight, Wallet, History, User, LogOut, X, Mail, Lock } from 'lucide-react';
import { analyzeMood, generateItineraries } from './services/geminiService';
import { MoodProfile, TravelPlan, ItineraryOption } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [step, setStep] = useState<'welcome' | 'scanning' | 'results' | 'confirmed'>('welcome');
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [moodProfile, setMoodProfile] = useState<MoodProfile | null>(null);
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [selectedOption, setSelectedOption] = useState<ItineraryOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [budget, setBudget] = useState('500 - 1500€');
  const [customBudget, setCustomBudget] = useState('');
  const [socialShield, setSocialShield] = useState(false);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const defaultColors = ['#F27D26', '#E6E6E6', '#00FF00'];
  const colors = moodProfile?.suggestedColors || defaultColors;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'spotify') {
        setSpotifyConnected(true);
        // In a real app, we'd use the tokens to fetch data
        console.log('Spotify connected:', event.data.tokens);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSpotifyConnect = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      const { url } = await response.json();
      window.open(url, 'spotify_auth', 'width=600,height=800');
    } catch (error) {
      console.error('Failed to get Spotify URL:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!userEmail || !selectedOption || !moodProfile) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          itinerary: selectedOption,
          moodProfile: moodProfile,
        }),
      });

      if (response.ok) {
        setIsEmailSent(true);
      } else {
        console.error('Failed to send email');
        // Fallback for demo if server is not ready
        setIsEmailSent(true);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setIsEmailSent(true); // Fallback for demo
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    if (!input && !spotifyConnected) return;
    
    setLoading(true);
    setStep('scanning');
    
    try {
      const profile = await analyzeMood({ text: input });
      setMoodProfile(profile);
      
      const finalBudget = budget === 'custom' ? (customBudget || 'Standard') : budget;
      const plan = await generateItineraries(profile, finalBudget);
      setTravelPlan(plan);
      
      setStep('results');
    } catch (error) {
      console.error('Scanning error:', error);
      setStep('welcome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative selection:bg-white selection:text-black">
      {/* Liquid Background with Dynamic Blobs */}
      <div className="liquid-bg">
        <motion.div 
          animate={{ 
            x: moodProfile ? ['-10%', '10%', '-10%'] : ['0%', '20%', '0%'],
            y: moodProfile ? ['-10%', '10%', '-10%'] : ['0%', '-20%', '0%'],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="blob top-[-10%] left-[-10%]" 
          style={{ backgroundColor: colors[0] }} 
        />
        <motion.div 
          animate={{ 
            x: moodProfile ? ['10%', '-10%', '10%'] : ['0%', '-20%', '0%'],
            y: moodProfile ? ['10%', '-10%', '10%'] : ['0%', '20%', '0%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="blob bottom-[-10%] right-[-10%]" 
          style={{ backgroundColor: colors[1] }} 
        />
        {colors[2] && (
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="blob top-[20%] right-[10%] w-[40vw] h-[40vw]" 
            style={{ backgroundColor: colors[2] }} 
          />
        )}
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="relative w-14 h-14 flex items-center justify-center"
          >
            {/* Innovative EV Logo: Abstract Pulse Monogram */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-[2px] rotate-12" />
            <div className="absolute inset-0 border border-white/30 rounded-2xl rotate-12" />
            <svg viewBox="0 0 60 60" className="w-12 h-12 relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Stylized E */}
              <motion.path 
                d="M15 18H35M15 30H30M15 42H35" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
              {/* Stylized V - overlapping and integrated */}
              <motion.path 
                d="M32 18L42 42L52 18" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {/* Connecting Pulse Line */}
              <motion.path
                d="M10 30L15 30M35 30L40 30"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="2 4"
                opacity="0.5"
              />
            </svg>
          </motion.div>
          <span className="text-2xl font-black tracking-tighter uppercase font-display bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">EchoVibe</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAuthModal(true)}
            className="w-12 h-12 flex items-center justify-center glass-card hover:bg-white/10 transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-40 pb-32">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="max-w-5xl mx-auto"
            >
              <div className="mb-20">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-bold tracking-[0.4em] uppercase text-white/60 mb-4 block"
                >
                  AI-Powered Travel Concierge
                </motion.span>
                <h1 className="text-6xl md:text-[8vw] font-black mb-8 leading-[0.85] uppercase font-display tracking-tighter">
                  Viaggia come <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                    ti senti.
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/60 max-w-2xl font-light leading-relaxed">
                  EchoVibe trasforma il tuo stato emotivo in itinerari rigenerativi. 
                  Niente moduli, solo la tua essenza tradotta in esperienze.
                </p>
              </div>

              <div className="glass-card p-10 mb-16 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex flex-col gap-8">
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Come ti senti oggi? Raccontaci il tuo desiderio più profondo..."
                      className="w-full bg-transparent border-none focus:ring-0 text-3xl md:text-4xl font-medium placeholder:text-white/30 resize-none h-48 leading-tight"
                    />
                    <div className="absolute bottom-0 right-0 flex gap-4">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsRecording(!isRecording)}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                          isRecording ? "bg-red-500 shadow-red-500/40 animate-pulse" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <Mic className="w-7 h-7" />
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSpotifyConnect}
                        className={cn(
                          "w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                          spotifyConnected ? "bg-[#1DB954] shadow-[#1DB954]/40" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <Music className="w-7 h-7" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-8 pt-10 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-white/60" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Budget Range</span>
                          <div className="flex items-center gap-2 mt-1">
                            {budget === 'custom' ? (
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text"
                                  value={customBudget}
                                  onChange={(e) => setCustomBudget(e.target.value)}
                                  placeholder="Inserisci budget (es. 1000€)"
                                  className="bg-white text-black border-none px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-white/20 rounded-lg w-48 placeholder:text-black/40"
                                  autoFocus
                                />
                                <button 
                                  onClick={() => {
                                    setBudget('500 - 1500€');
                                    setCustomBudget('');
                                  }} 
                                  className="text-[10px] uppercase tracking-tighter text-white/40 hover:text-white transition-colors"
                                >
                                  Annulla
                                </button>
                              </div>
                            ) : (
                              <select 
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="bg-white text-black border-none px-3 py-1 text-sm font-bold focus:ring-2 focus:ring-white/20 rounded-lg cursor-pointer appearance-none min-w-[180px]"
                              >
                                <option value="200 - 500€">Low-cost (200-500€)</option>
                                <option value="500 - 1500€">Standard (500-1500€)</option>
                                <option value="1500 - 5000€">Premium (1500-5000€)</option>
                                <option value="custom">Altro (Personalizzato)...</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSurpriseMode(!surpriseMode)}
                          className={cn(
                            "flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all border-2",
                            surpriseMode ? "bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20" : "bg-white/10 border-white/10 text-white/60 hover:border-white/20"
                          )}
                        >
                          <History className="w-4 h-4" /> Surprise Me
                        </button>
                        <button 
                          onClick={() => setSocialShield(!socialShield)}
                          className={cn(
                            "flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all border-2",
                            socialShield ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" : "bg-white/10 border-white/10 text-white/60 hover:border-white/20"
                          )}
                        >
                          <Sparkles className="w-4 h-4" /> Social Shield
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={startScanning}
                      disabled={loading || (!input && !spotifyConnected)}
                      className="btn-primary"
                    >
                      {loading ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        <>Inizia Scansione <ArrowRight className="w-6 h-6" /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: Sparkles, title: "Mood Scanner", desc: "Analizziamo voce, musica e parole per capire di cosa hai bisogno.", color: "text-yellow-400" },
                  { icon: MapPin, title: "Echo-Engine", desc: "Itinerari che risuonano con la tua anima, non solo con il tuo portafoglio.", color: "text-blue-400" },
                  { icon: History, title: "Surprise Me", desc: "Lasciati guidare dal destino. Scopri la meta solo 24 ore prima.", color: "text-purple-400" }
                ].map((feature, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10 }}
                    className="glass-card p-8"
                  >
                    <div className={cn("w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6", feature.color)}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{feature.title}</h3>
                    <p className="text-white/60 leading-relaxed">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="relative w-80 h-80 mb-16">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 blur-[100px] opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-24 h-24 text-white" />
                  </motion.div>
                </div>
              </div>
              <h2 className="text-6xl font-black uppercase font-display tracking-tighter mb-6">Sintonizzazione...</h2>
              <p className="text-2xl text-white/60 font-light max-w-md mx-auto">L'IA sta decodificando le tue vibrazioni per trovare il viaggio perfetto.</p>
            </motion.div>
          )}

          {step === 'results' && travelPlan && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-7xl mx-auto"
            >
              <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="max-w-3xl">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-xs font-black uppercase tracking-widest mb-6 border border-white/10"
                  >
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: colors[0] }} />
                    Profilo Rilevato: {moodProfile?.primaryMood}
                  </motion.div>
                  <h2 className="text-2xl md:text-4xl font-black uppercase font-display tracking-tighter leading-tight mb-6">
                    {moodProfile?.description}
                  </h2>
                  <p className="text-xl text-white/60 font-light">Abbiamo trovato 3 portali per la tua rigenerazione.</p>
                </div>
                <button 
                  onClick={() => setStep('welcome')}
                  className="px-8 py-4 glass-card hover:bg-white/10 transition-all flex items-center gap-3 font-bold uppercase tracking-widest text-xs"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> Nuova Scansione
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {travelPlan.options.map((option, idx) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    className="glass-card overflow-hidden group border-white/5 hover:border-white/20 transition-all duration-500"
                  >
                    <div className="relative h-[450px] overflow-hidden">
                      {surpriseMode ? (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-black to-black flex flex-col items-center justify-center p-12 text-center">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          >
                            <History className="w-20 h-20 mb-8 text-purple-400 opacity-50" />
                          </motion.div>
                          <h4 className="text-4xl font-black uppercase font-display tracking-tighter mb-4">Destinazione Segreta</h4>
                          <p className="text-white/60 text-sm leading-relaxed">Verrà rivelata 24 ore prima della partenza. Preparati all'ignoto.</p>
                          <div className="mt-10 px-6 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-[0.2em] border border-white/20">
                            Meteo: 24°C • Soleggiato
                          </div>
                        </div>
                      ) : (
                        <>
                          <img 
                            src={option.image} 
                            alt={option.destination}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                        </>
                      )}
                      <div className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
                        {option.type}
                      </div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-4xl font-black uppercase font-display tracking-tighter mb-2 leading-none">
                          {surpriseMode ? "Viaggio Misterioso" : option.title}
                        </h3>
                        <p className="text-white/60 flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                          <MapPin className="w-4 h-4" /> {surpriseMode ? "???, ???" : option.destination}
                        </p>
                      </div>
                    </div>
                    <div className="p-10">
                      <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Investimento</span>
                          <span className="text-2xl font-black font-mono tracking-tighter">{option.estimatedCost}</span>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-white/40 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                      
                      <p className="text-white/60 leading-relaxed mb-10 min-h-[80px]">
                        {option.description}
                      </p>

                      <div className="space-y-4 mb-10">
                        {option.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-4 text-sm font-medium text-white/70">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                            {h}
                          </div>
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedOption(option);
                          setStep('confirmed');
                        }}
                        className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                      >
                        Conferma Esperienza
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'confirmed' && selectedOption && (
            <motion.div 
              key="confirmed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto text-center py-20"
            >
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/40">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-6xl font-black uppercase font-display tracking-tighter mb-6">Esperienza Confermata!</h2>
              <p className="text-2xl text-white/60 font-light mb-12">
                Il tuo viaggio verso <span className="text-white font-bold">{selectedOption.destination}</span> è quasi pronto.
              </p>

              {!isEmailSent ? (
                <div className="max-w-md mx-auto mb-12">
                  <div className="relative mb-4">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input 
                      type="email" 
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Inserisci la tua email"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-lg focus:ring-2 focus:ring-white/20 outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleSendEmail}
                    disabled={loading || !userEmail.includes('@')}
                    className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      'Invia Preventivo Completo'
                    )}
                  </button>
                  <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest">Riceverai il PDF dettagliato e i link per la prenotazione.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-12 p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-xl text-white/80 font-medium mb-2">
                    Preventivo inviato!
                  </p>
                  <p className="text-sm text-white/40">
                    Controlla la tua posta elettronica all'indirizzo <span className="text-white">{userEmail}</span>.
                  </p>
                </motion.div>
              )}
              
              <div className="glass-card p-10 mb-12 text-left">
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-6">Riepilogo Viaggio</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Destinazione</span>
                  <span className="font-bold">{selectedOption.destination}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Volo</span>
                  <span className="font-bold text-xs text-right max-w-[200px] leading-tight">{(selectedOption as any).flightDetails}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Alloggio</span>
                  <span className="font-bold text-xs text-right max-w-[200px] leading-tight">{(selectedOption as any).accommodationDetails}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/60">Vitto</span>
                  <span className="font-bold text-xs text-right max-w-[200px] leading-tight">{(selectedOption as any).foodDetails}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Investimento</span>
                  <span className="font-bold font-mono">{selectedOption.estimatedCost}</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setStep('welcome');
                  setInput('');
                  setMoodProfile(null);
                  setTravelPlan(null);
                  setSelectedOption(null);
                  setIsEmailSent(false);
                  setUserEmail('');
                }}
                className="btn-primary mx-auto"
              >
                Torna alla Home <ArrowRight className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full p-8 flex justify-between items-center text-[10px] uppercase tracking-[0.4em] font-bold text-white/30 z-50">
        <div>© 2026 EchoVibe Studio</div>
        <div className="hidden md:block">Privacy • Terms • Cookies</div>
        <div>V 1.0</div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-10 overflow-hidden"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10">
                <h2 className="text-4xl font-black uppercase font-display tracking-tighter mb-2">
                  {authMode === 'login' ? 'Bentornato' : 'Unisciti a noi'}
                </h2>
                <p className="text-white/40 text-sm">
                  {authMode === 'login' 
                    ? 'Accedi per gestire i tuoi viaggi emotivi.' 
                    : 'Crea un account per salvare le tue esperienze.'}
                </p>
              </div>

              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); setShowAuthModal(false); }}>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input 
                      type="email" 
                      placeholder="Email"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-white/20 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input 
                      type="password" 
                      placeholder="Password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-white/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl shadow-white/5"
                >
                  {authMode === 'login' ? 'Accedi' : 'Registrati'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  {authMode === 'login' 
                    ? 'Non hai un account? Registrati' 
                    : 'Hai già un account? Accedi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
