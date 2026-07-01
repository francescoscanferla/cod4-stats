'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../api/stats/stats-repository';

export default function AdminDashboard() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState<string>('');
    const [sessionDate, setSessionDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session || session.user?.user_metadata?.is_admin !== true) {
                router.replace('/login');
                return;
            }
            setAuthLoading(false);
        };

        checkAdmin();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const getFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Seleziona un file di log prima di inviare.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('session_date', sessionDate);

        try {
            const response = await fetch('/api/stats/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Errore durante il caricamento');
            }

            setMessage({ type: 'success', text: data.message });
            setFile(null);
            setDescription('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#11111b] flex items-center justify-center text-[#1fc75c] font-sans">
                Verifica permessi in corso...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#11111b] text-[#cdd6f4] p-4 font-sans flex flex-col items-center">
            <header className="w-full max-w-4xl bg-[#1e1e2e] p-4 mb-6 flex justify-between items-center rounded-lg border border-[#313244]">
                <h1 className="text-xl font-bold text-[#1fc75c]">Admin Dashboard</h1>
                <button
                    onClick={() => router.push('/')}
                    className="p-2 hover:bg-[#313244] rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-sm text-[#cdd6f4]"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                    </svg>
                    Torna alla Home
                </button>
            </header>

            <div className="w-full max-w-xl bg-[#181825] border border-[#313244] rounded-xl p-6 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#a6adc8] mb-1.5">
                            Data della Sessione
                        </label>
                        <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            required
                            className="w-full bg-[#11111b] border border-[#313244] rounded-lg p-2.5 text-sm text-[#cdd6f4] focus:outline-none focus:border-[#1fc75c]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#a6adc8] mb-1.5">
                            Descrizione Sessione
                        </label>
                        <input
                            type="text"
                            placeholder="Es: Clan War, Serata Pubblica..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#11111b] border border-[#313244] rounded-lg p-2.5 text-sm text-[#cdd6f4] focus:outline-none focus:border-[#1fc75c]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#a6adc8] mb-1.5">
                            File di Log Server
                        </label>
                        <div className="flex items-center gap-4 bg-[#11111b] p-3 rounded-lg border border-[#313244]">
                            <label className="flex items-center gap-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] text-xs font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                                </svg>
                                Scegli File
                                <input
                                    type="file"
                                    accept=".log,.txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {file ? (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-medium text-[#cdd6f4] truncate">{file.name}</span>
                                    <span className="text-[10px] text-[#5f6378]">{getFileSize(file.size)}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-[#5f6378]">Nessun file selezionato</span>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div
                            className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success'
                                    ? 'bg-[#1fc75c]/10 text-[#1fc75c] border border-[#1fc75c]/20'
                                    : 'bg-[#ff5d00]/10 text-[#ff5d00] border border-[#ff5d00]/20'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1fc75c] hover:bg-[#1fc75c]/80 text-[#11111b] font-bold p-3 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Elaborazione in corso...' : 'Elabora e Salva Sessione'}
                    </button>
                </form>
            </div>
        </div>
    );
}