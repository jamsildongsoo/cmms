import React from 'react';
import { useUiStore } from '@/store/useUiStore';
import { Loader2 } from 'lucide-react';

export const GlobalLoading: React.FC = () => {
    const isLoading = useUiStore((state) => state.isLoading);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-slate-600">데이터를 처리 중입니다...</span>
            </div>
        </div>
    );
};
