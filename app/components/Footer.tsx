import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-ctp-overlay p-4 mt-8 flex justify-between items-center text-sm">
            <p className="text-ctp-subtext">
                © {new Date().getFullYear()} B.Y.O.B. Stats
            </p>
            <div className="px-3 py-1.5 text-xs font-mono text-ctp-muted">
                Versione: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'Sviluppo Locale'}
            </div>
        </footer>
    );
};