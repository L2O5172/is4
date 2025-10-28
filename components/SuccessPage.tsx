
import React from 'react';
import type { SubmittedOrderData, NotificationType } from '../types';

interface SuccessPageProps {
    orderData: SubmittedOrderData;
    onNewOrder: () => void;
    showNotification: (message: string, type?: NotificationType) => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ orderData, onNewOrder, showNotification }) => {
    const formatDisplayTime = (timestamp: string) => new Date(timestamp).toLocaleString('zh-TW');

    const shareTextContent = `🍽️ 台灣小吃店 - 訂單確認\n\n📋 訂單編號：${orderData.orderId}\n👤 顧客姓名：${orderData.customerName}\n📞 聯絡電話：${orderData.customerPhone}\n\n💰 最終總金額：$${orderData.totalAmount}\n⏰ 取餐時間：${formatDisplayTime(orderData.pickupTime)}\n📍 ${orderData.deliveryAddress ? `外送地址：${orderData.deliveryAddress}` : '自取'}\n📝 備註：${orderData.notes || '無'}\n\n📍 取餐地址：台灣小吃店\n🕒 營業時間：10:00-21:00\n📞 聯絡電話：02-1234-5678`;

    const copyShareText = () => {
        navigator.clipboard.writeText(shareTextContent)
            .then(() => showNotification('訂單資訊已複製！', 'success'))
            .catch(() => showNotification('複製失敗', 'error'));
    };

    return (
        <div className="text-center p-5 animate-fade-in">
            <div className="text-6xl mb-5">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">訂單提交成功！</h3>
            <div className="bg-gray-50 p-4 rounded-lg my-5 text-left border">
                <p><strong>訂單編號：</strong><span className="font-mono">{orderData.orderId}</span></p>
                <p><strong>顧客姓名：</strong><span>{orderData.customerName}</span></p>
                <p><strong>聯絡電話：</strong><span>{orderData.customerPhone}</span></p>
                <p><strong>最終總金額：</strong>$<span className="text-green-600 font-bold">{orderData.totalAmount}</span></p>
                <p><strong>取餐時間：</strong><span>{formatDisplayTime(orderData.pickupTime)}</span></p>
                <p><strong>取餐方式：</strong><span>{orderData.deliveryAddress ? '外送' : '自取'}</span></p>
                {orderData.deliveryAddress && <p><strong>外送地址：</strong><span>{orderData.deliveryAddress}</span></p>}
                {orderData.notes && <p><strong>備註：</strong><span>{orderData.notes}</span></p>}
            </div>
            <div className="my-8">
                <p className="text-lg font-bold mb-4">📱 分享訂單資訊</p>
                <a href={`https://line.me/R/msg/text/?${encodeURIComponent(shareTextContent)}`} target="_blank" rel="noopener noreferrer" className="inline-block my-4 p-2.5 bg-[#06c755] rounded-lg clickable-btn">
                    <img src="https://scdn.line-apps.com/n/line_add_friends/btn/zh-Hant.png" alt="分享到 LINE" className="h-10" />
                </a>
                <div className="mt-6">
                    <button onClick={copyShareText} className="bg-blue-500 text-white border-none py-2 px-5 rounded-md cursor-pointer hover:bg-blue-600 clickable-btn">📋 複製訂單資訊</button>
                </div>
            </div>
            <button onClick={onNewOrder} className="bg-green-600 text-white border-none py-3 px-8 rounded-md cursor-pointer text-base mt-5 hover:bg-green-700 clickable-btn">📝 再訂一單</button>
        </div>
    );
};
