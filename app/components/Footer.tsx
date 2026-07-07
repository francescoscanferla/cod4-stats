import React from 'react';

export const Footer: React.FC = () => {
    const currentVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'Local';
    return (
        <footer className="bg-ctp-overlay p-4 mt-8 flex justify-between items-center text-sm">
            <p className="text-ctp-subtext">
                © {new Date().getFullYear()} B.Y.O.B. Stats
            </p>
            <div className="px-3 py-1.5 text-xs font-mono text-ctp-muted">
                Versione: {currentVersion}
            </div>
        </footer>
    );
};