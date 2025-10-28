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
                // liff.init() must be called before any other LIFF API.
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
                    // Note: The 'X-Frame-Options' error may appear in an iframe-based development environment
                    // when liff.login() is called. This is a security measure from LINE and is expected behavior.
                    // The login flow should work correctly in a standalone browser tab or within the LINE app itself.
                    if (window.liff.isInClient()) {
                        setLiffStatus('您尚未登入，將為您導向登入頁面...');
                        // Automatic login for users inside the LINE app
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

        // Check if the LIFF SDK has loaded before trying to initialize it.
        if (window.liff) {
            initializeLiff();
        } else {
            // This may happen if the LIFF SDK script fails to load from the CDN.
            console.error('LIFF SDK not found.');
            setLiffStatus('⚠️ LINE SDK 載入失敗，請檢查網路連線並重新整理。');
            setStatusType('error');
            setIsLoading(false);
        }
    }, []);

    const login = useCallback(() => {
        if (!window.liff || isLoading) return;
        setIsLoading(true);
        setLiffStatus('🔄 正在導向 LINE 登入頁面...');
        try {
            // This will redirect the user to the LINE login page.
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
