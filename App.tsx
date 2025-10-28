import React, { useState, useCallback, useEffect } from 'react';
import { OrderPage } from './components/OrderPage';
import { HistoryPage } from './components/HistoryPage';
import { SuccessPage } from './components/SuccessPage';
import { Notification } from './components/Notification';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useLiff } from './hooks/useLiff';
import * as apiService from './services/apiService';
import { DELIVERY_FEE } from './constants';
import type { MenuItem, OrderData, SubmittedOrderData, NotificationType } from './types';

type View = 'order' | 'history' | 'success';

const App: React.FC = () => {
    const [view, setView] = useState<View>('order');
    const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrderData | null>(null);
    const [notification, setNotification] = useState({ message: '', type: 'success' as NotificationType, visible: false });
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isMenuLoading, setIsMenuLoading] = useState(true);
    const liff = useLiff();

    const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
        setNotification({ message, type, visible: true });
    }, []);

    useEffect(() => {
        if (!liff.isLoggedIn) return;

        const fetchMenu = async () => {
            setIsMenuLoading(true);
            try {
                const items = await apiService.getMenu();
                setMenuItems(items);
            } catch (error) {
                showNotification('菜單載入失敗，將使用預設菜單', 'warning');
                setMenuItems([
                    { name: '滷肉飯', price: 35, icon: '🍚', status: '供應中' },
                    { name: '雞肉飯', price: 40, icon: '🍗', status: '供應中' },
                    { name: '蚵仔煎', price: 65, icon: '🍳', status: '供應中' },
                    { name: '大腸麵線', price: 50, icon: '🍜', status: '供應中' },
                    { name: '珍珠奶茶', price: 45, icon: '🥤', status: '供應中' }
                ]);
            } finally {
                setIsMenuLoading(false);
            }
        };
        fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liff.isLoggedIn]);

    const handleSubmitOrder = async (orderData: OrderData, idToken: string | null) => {
        try {
            const result = await apiService.submitOrder(orderData, idToken);
            const totalAmount = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + (orderData.deliveryAddress ? DELIVERY_FEE : 0);
            const finalOrderData: SubmittedOrderData = {
                ...orderData,
                orderId: result.data?.orderId || 'TEST_' + Date.now(),
                totalAmount: result.data?.totalAmount || totalAmount
            };
            setSubmittedOrder(finalOrderData);
            setView('success');
            showNotification('訂單提交成功！');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知錯誤';
            showNotification(`訂單提交失敗：${errorMessage}`, 'error');
            throw error; // Re-throw to be caught by the caller if needed
        }
    };

    const handleNewOrder = () => {
        setSubmittedOrder(null);
        setView('order');
    };

    const renderContent = () => {
        if (liff.isLoading) {
            return (
                <div className="text-center py-20 flex flex-col items-center justify-center text-gray-600">
                    <LoadingSpinner />
                    <p className="mt-3 text-sm">{liff.liffStatus}</p>
                </div>
            );
        }

        if (!liff.isLoggedIn) {
            const statusClasses = {
                info: 'bg-blue-100 border-blue-400 text-blue-800',
                success: 'bg-green-100 border-green-400 text-green-800',
                warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
                error: 'bg-red-100 border-red-400 text-red-800'
            };
            return (
                <div className="text-center py-10 px-4">
                    <div className="text-6xl mb-5">🔐</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">需要 LINE 登入</h2>
                    <p className={`p-3 rounded-lg text-sm text-center border ${statusClasses[liff.statusType]} mb-6`}>
                        {liff.liffStatus}
                    </p>
                    { window.liff && !window.liff.isInClient() && (
                         <button onClick={liff.login} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg text-lg flex items-center justify-center clickable-btn">
                            使用 LINE 登入
                        </button>
                    )}
                </div>
            );
        }

        if (isMenuLoading) {
            return (
                <div className="text-center py-20 flex flex-col items-center justify-center text-gray-600">
                    <LoadingSpinner />
                    <p className="mt-3 text-sm">正在載入菜單...</p>
                </div>
            );
        }

        switch (view) {
            case 'history':
                return <HistoryPage onBack={() => setView('order')} showNotification={showNotification} />;
            case 'success':
                return submittedOrder && <SuccessPage orderData={submittedOrder} onNewOrder={handleNewOrder} showNotification={showNotification} />;
            default:
                return <OrderPage menuItems={menuItems} onSubmitOrder={handleSubmitOrder} showNotification={showNotification} onViewHistory={() => setView('history')} />;
        }
    };

    return (
        <div className="p-4 min-h-screen flex items-center justify-center">
            <div className="container max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-[#fff3cd] border border-[#ffeaa7] rounded-t-2xl p-2.5 text-xs text-center text-[#856404]">
                    <span role="img" aria-label="lock">🔒</span> 安全訂餐系統 - 24小時接受預訂
                </div>

                <header className="bg-green-500 text-white p-5 text-center relative">
                    <h1 className="text-2xl font-bold mb-1">🍜 台灣小吃店</h1>
                    <p className="text-sm opacity-90">LINE 快速訂餐 - 24小時服務</p>
                </header>

                <main className="p-5 space-y-4">
                    <Notification
                        message={notification.message}
                        type={notification.type}
                        visible={notification.visible}
                        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
                    />
                    {renderContent()}
                </main>

                <footer className="bg-gray-100 p-4 text-center text-xs text-gray-500 border-t border-gray-200">
                    <p>📍 營業時間: 10:00 - 21:00 | 📞 聯絡電話: 02-1234-5678</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
