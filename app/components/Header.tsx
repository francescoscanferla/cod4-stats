'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/api/stats/stats-repository';

interface HeaderProps {
  isAdmin?: boolean;
  avatarUrl: string | null;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin, avatarUrl }) => {
  const router = useRouter();

  return (
    <header className="bg-ctp-overlay p-4 mb-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-ctp-brand">{`B.Y.O.B. Stats`}</h1>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <button
            onClick={() => router.push('/admin')}
            className="p-2 hover:bg-ctp-line rounded-lg transition-colors cursor-pointer"
            title="Pannello Amministratore"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#cdd6f4" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l.546.946a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.29.22-.443.585-.411.95.004.043.006.086.006.128a1 1 0 0 1-.006.128c-.032.365.12.73.411.95l1.003.767a1.125 1.125 0 0 1 .26 1.43l-.546.947a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-1.094c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-.546-.947a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.29-.22.443-.585.411-.95a1.15 1.15 0 0 0-.007-.128c0-.042.003-.085.007-.128.032-.365-.12-.73-.411-.95l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l.546-.946a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        )}

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          }}
          className="p-2 hover:bg-ctp-line rounded-lg transition-colors cursor-pointer"
          title="Disconnetti"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#cdd6f4" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
        </button>

        <div className="w-10 h-10 bg-ctp-line rounded-full border-2 border-ctp-brand overflow-hidden flex items-center justify-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-ctp-line" />
          )}
        </div>
      </div>
    </header>
  );
};