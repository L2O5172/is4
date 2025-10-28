import { useState, useEffect, useCallback } from 'react';
import { LIFF_ID } from '../constants';
import type { LiffProfile } from '../types';

// Minimal LIFF interface to satisfy TypeScript
declare global {
  interface Window {
    liff: any;
  }
}

export const useLiff = () => {
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [liffStatus, setLiffStatus] = useState('🔄 初始化 LINE 功能中...');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeLiff = async () => {
            try {
                if (!window.liff) {
                    throw new Error("LIFF SDK not found");
                }
                await window.liff.init({ liffId: LIFF_ID });
                if (window.liff.isLoggedIn()) {
                    setIsLoggedIn(true);
                    const [userProfile, token] = await Promise.all([
                        window.liff.getProfile(),
                        window.liff.getIDToken()
                    ]);
                    setProfile(userProfile);
                    setIdToken(token);
                    setLiffStatus(`👋 歡迎，${userProfile.displayName}！`);
                    setStatusType('success');
                } else {
                    setIsLoggedIn(false);
                    if (window.liff.isInClient()) {
                        setLiffStatus('您尚未登入，將為您導向登入頁面...');
                        window.liff.login();
                    } else {
                        setLiffStatus('請登入 LINE 以繼續訂餐。');
                        setStatusType('warning');
                    }
                }
            } catch (error) {
                console.warn('LINE 初始化失敗:', error);
                setLiffStatus('⚠️ LINE 功能載入失敗，請重新整理頁面。');
                setStatusType('error');
            } finally {
                setIsLoading(false);
            }
        };

        // Delay initialization slightly to ensure LIFF SDK is loaded
        setTimeout(() => initializeLiff(), 0);
        
    }, []);

    const login = useCallback(() => {
        if (!window.liff || isLoading) return;
        setIsLoading(true);
        setLiffStatus('🔄 正在導向 LINE 登入頁面...');
        try {
            window.liff.login();
        } catch (error) {
            console.error('LIFF login failed:', error);
            setLiffStatus('⚠️ 登入失敗，請稍後再試。');
            setStatusType('error');
            setIsLoading(false);
        }
    }, [isLoading]);

    return { profile, idToken, isLoggedIn, liffStatus, statusType, isLoading, login };
};
