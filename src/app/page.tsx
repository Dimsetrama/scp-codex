'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { LoadingBar } from '@/components/LoadingBar';
import { FormattedText } from '@/components/FormattedText';

// --- Interfaces & Components (no changes) ---
interface ScpData {
  title?: string; summary: string; metadata?: { id: string; object_class: string; };
}
const ContainmentStatusBar = ({ objectClass }: { objectClass: string | undefined }) => {
  // ... (ContainmentStatusBar code remains the same)
  const classStyles = {
    safe:        { text: 'CONTAINMENT STABLE',           color: '#22c55e', pulse: false, textColorHex: '#ffffff' },
    euclid:      { text: 'CONTAINMENT UNPREDICTABLE',    color: '#eab308', pulse: true,  textColorHex: '#ffffff' },
    keter:       { text: 'CONTAINMENT CRITICAL',         color: '#dc2626', pulse: true,  textColorHex: '#ffffff' },
    thaumiel:    { text: 'COVERT CLASS - THAUMIEL',      color: '#000000', pulse: false, textColorHex: '#e5e7eb' },
    apollyon:    { text: 'CONTAINMENT FAILURE IMMINENT', color: '#7f1d1d', pulse: true,  textColorHex: '#ffffff' },
    neutralised: { text: 'OBJECT NEUTRALISED',           color: '#e5e7eb', pulse: false, textColorHex: '#000000' },
    explained:   { text: 'ANOMALY EXPLAINED',            color: '#e5e7eb', pulse: false, textColorHex: '#000000' },
    unknown:     { text: 'STATUS UNKNOWN',               color: '#6b7280', pulse: false, textColorHex: '#ffffff' },
  };
  const currentClass = objectClass?.toLowerCase() || 'unknown';
  const status = classStyles[currentClass as keyof typeof classStyles] || classStyles.unknown;
  return (
    <div className="w-full bg-black p-1 border-y-2 border-[var(--border-color)]">
      <div
        className={`w-full h-6 flex items-center justify-center text-sm font-bold ${status.pulse ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: status.color, color: status.textColorHex }}
      >
        {status.text}
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function Home() {
  const [scpData, setScpData] = useState<ScpData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');
  const [command, setCommand] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading && progress < 90) {
      timer = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 90));
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isLoading, progress]);

  const handleSearch = async (query: string) => {
    // ... (handleSearch logic remains the same)
    if (!query) return;
    setProgress(0);
    setIsLoading(true);
    setScpData(null);
    setError(null);
    const finishLoading = (data: ScpData | null, err: Error | null) => {
        const finalAnimation = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(finalAnimation);
                    if (data) setScpData(data);
                    if (err) setError(err.message);
                    setIsLoading(false);
                    return 100;
                }
                return prev + 1;
            });
        }, 50);
    };
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }), });
      if (!response.ok) throw new Error('Failed to retrieve data from archives.');
      const data = await response.json();
      finishLoading(data, null);
    } catch (err) {
      finishLoading(null, err instanceof Error ? err : new Error('An unknown error occurred.'));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSearch(command);
      setCommand('');
  };

  return (
    // FIX #1: Removed min-h-screen again to prevent scrolling
    <main className="crt-effect flex flex-col font-mono text-[var(--text-color)]">

      {/* FIX #2: Removed all horizontal padding (px-) from header elements */}
      <header className="flex-shrink-0 flex justify-between items-center pb-4 pt-4 sm:pt-6 border-b-2 border-[var(--border-color)]">
        <div className="text-left text-[var(--header-text)] pl-4 sm:pl-6"> {/* Left padding ONLY */}
          <h1 className="text-xl sm:text-2xl font-bold">SCP FOUNDATION</h1>
          <h2 className="text-md sm:text-lg">SECURE, CONTAIN, PROTECT</h2>
          <p className="text-xs text-gray-500 max-w-lg mt-2">
            AI Archival System [v3.1] | Accessing database via secure terminal. Enter designation...
          </p>
        </div>
        <Image src="/scp-logo.png" alt="SCP Logo" width={80} height={80} className="w-16 h-16 sm:w-20 sm:h-20 mr-4 sm:mr-6" /> {/* Right margin */}
      </header>

      {/* FIX #3: Removed all horizontal padding (px-) from content wrapper */}
      <div className="flex-grow flex flex-col">
        {/* Padding moved inside the form, left padding removed */}
        <form onSubmit={handleSubmit} className="flex items-center w-full border-y-2 border-[var(--border-color)] p-2 pl-4 sm:pl-6"> {/* Left padding ONLY */}
            <span className="mr-2 font-bold text-[var(--header-text)]">SCP-</span>
            <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="bg-transparent border-none text-[var(--text-color)] focus:outline-none w-full"
                placeholder="Enter designation..."
                autoFocus
                disabled={isLoading}
            />
        </form>

        <div className="pt-4 flex-grow">
          {/* Padding removed */}
          {isLoading && <div className=""><LoadingBar progress={progress} /></div>}
          <AnimatePresence>
            {/* Padding removed */}
            {!isLoading && error && <p className="pl-4 sm:pl-6 text-[var(--accent-color)]" key="error">ERROR: {error}</p>} {/* Left padding ONLY */}
            {!isLoading && scpData && (
              <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <ContainmentStatusBar objectClass={scpData.metadata?.object_class} />
                {/* Padding removed */}
                <div className="bg-[var(--highlight-bg)] text-[var(--highlight-text)] p-2 pl-4 sm:pl-6 font-bold"> {/* Left padding ONLY */}
                  {`FILE: ${scpData.metadata?.id.toUpperCase()} // CLASS: ${scpData.metadata?.object_class}`}
                </div>
                {/* FormattedText handles its own padding, adjusted to remove left padding */}
                <FormattedText text={scpData.summary} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FIX #4: Removed all horizontal padding (px-) from footer elements */}
      <footer className="flex-shrink-0 flex justify-between items-center border-t-2 border-[var(--border-color)] pt-4 pb-4 sm:pb-6">
        <p className="pl-4 sm:pl-6 text-xs text-gray-500">PROPERTY OF THE SCP FOUNDATION // UNAUTHORIZED ACCESS PROHIBITED</p> {/* Left padding ONLY */}
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="px-2 py-1 border border-[var(--border-color)] bg-transparent text-[var(--text-color)] hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors mr-4 sm:mr-6"> {/* Right margin */}
          NIGHT MODE: {theme === 'dark' ? 'ON' : 'OFF'}
        </button>
      </footer>
    </main>
  );
}

// --- Make sure FormattedText component also removes left padding ---
// You will need to edit src/components/FormattedText.tsx as well:
// Change:
// return <p className="whitespace-pre-wrap px-4 sm:px-6 py-2">{parts}</p>;
// To:
// return <p className="whitespace-pre-wrap pl-4 sm:pl-6 py-2">{parts}</p>; // Use pl- (padding-left) ONLY