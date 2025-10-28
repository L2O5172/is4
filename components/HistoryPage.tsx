import React, { useState } from 'react';
import { useLiff } from '../hooks/useLiff';
import { getOrders } from '../services/apiService';
import type { HistoryOrder, NotificationType } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface HistoryPageProps {
    onBack: () => void;
    showNotification: (message: string, type?: NotificationType) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onBack, showNotification }) => {
    const { idToken, profile } = useLiff();
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [orders, setOrders] = useState<HistoryOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!profile) {
            showNotification('無法獲取您的 LINE 資料，請稍後再試', 'error');
            return;
        }
        
        setIsLoading(true);
        setHasSearched(true);
        try {
            const params = {
                customerName: profile.displayName,
                idToken: idToken,
                startDate: startDate,
                endDate: endDate
            };

            const result = await getOrders(params);
            const sortedOrders = result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(sortedOrders);
            showNotification(`找到 ${result.length} 筆訂單`, 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知錯誤';
            showNotification(`查詢失敗：${errorMessage}`, 'error');
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: HistoryOrder['status']) => {
        const statusConfig = {
            'pending_customer': { color: 'status-pending', text: '待顧客確認' },
            'pending_store': { color: 'status-pending', text: '待店家確認' },
            'confirmed': { color: 'status-confirmed', text: '已確認' },
            'completed': { color: 'status-completed', text: '已完成' },
            'cancelled_by_customer': { color: 'status-cancelled', text: '顧客取消' },
            'cancelled_by_store': { color: 'status-cancelled', text: '店家取消' }
        };
        const config = statusConfig[status] || { color: 'status-pending', text: status };
        return <span className={`status-badge ${config.color}`}>{config.text}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">我的訂單紀錄</h2>
                <button onClick={onBack} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded-lg clickable-btn">返回訂餐</button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-4 p-4 bg-gray-50 rounded-lg border">
                 <p className="text-sm text-gray-600">您好, <strong>{profile?.displayName}</strong>！請選擇要查詢的日期範圍。</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">結束日期</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                </div>
                
                <div>
                    <button onClick={handleSearch} disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center justify-center clickable-btn">
                        {isLoading ? <><LoadingSpinner /><span>查詢中...</span></> : '🔍 查詢我的訂單'}
                    </button>
                </div>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
                {!isLoading && !hasSearched && (
                    <div className="text-center text-gray-500 py-10 italic">
                        <p>請選擇日期範圍後點擊查詢</p>
                    </div>
                )}
                {!isLoading && hasSearched && orders.length === 0 && (
                    <div className="text-center text-gray-500 py-10 italic">
                        <p>在此日期範圍內找不到您的訂單</p>
                    </div>
                )}
                {orders.map(order => (
                    <div key={order.orderId} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start border-b pb-2 mb-2">
                            <div>
                                <p className="text-xs text-gray-500">訂單編號</p>
                                <p className="font-bold text-gray-800 text-sm">{order.orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">訂單金額</p>
                                <p className="font-bold text-green-600 text-lg">${order.totalAmount}</p>
                            </div>
                        </div>
                        <div className="text-sm space-y-1 text-gray-600">
                            <p><strong>顧客姓名:</strong> {order.customerName}</p>
                            <p><strong>手機號碼:</strong> {order.customerPhone}</p>
                            <p><strong>下單時間:</strong> {new Date(order.createdAt).toLocaleString('zh-TW')}</p>
                            <p><strong>預計取餐:</strong> {new Date(order.pickupTime).toLocaleString('zh-TW')}</p>
                            <p><strong>訂單內容:</strong> {order.items}</p>
                            <p><strong>狀態:</strong> {getStatusBadge(order.status)}</p>
                            {order.deliveryAddress && <p><strong>外送地址:</strong> {order.deliveryAddress}</p>}
                            {order.notes && <p><strong>備註:</strong> {order.notes}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
