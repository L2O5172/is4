
import { API_ENDPOINT } from '../constants';
import type { HistoryOrder, MenuItem, OrderData, OrderItem } from '../types';

async function request<T,>(payload: object): Promise<T> {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        }

        const result = await response.json();
        return result as T;
    } catch (error) {
        console.error('API 請求失敗:', error);
        throw new Error('網路連線失敗，請檢查網路連線和伺服器狀態');
    }
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

export const getMenu = async (): Promise<MenuItem[]> => {
    try {
        const result = await request<ApiResponse<MenuItem[]>>({ action: 'getMenu' });
        if (result.success && Array.isArray(result.data)) {
            return result.data;
        }
        throw new Error('獲取菜單失敗');
    } catch (error) {
        console.warn('獲取菜單失敗:', error);
        throw error;
    }
};

export const submitOrder = async (orderData: OrderData, idToken: string | null): Promise<ApiResponse<{ orderId: string; totalAmount: number; }>> => {
    const orderDataForServer = {
        customerName: orderData.customerName.trim(),
        customerPhone: orderData.customerPhone.trim(),
        items: orderData.items.map((item): OrderItem => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        pickupTime: orderData.pickupTime,
        deliveryAddress: orderData.deliveryAddress.trim(),
        notes: orderData.notes.trim()
    };

    const result = await request<ApiResponse<{ orderId: string; totalAmount: number; }>>({
        action: 'createOrder',
        idToken: idToken,
        orderData: orderDataForServer
    });

    if (!result.success) {
        throw new Error(result.message || '訂單提交失敗');
    }

    return result;
};

interface GetOrdersParams {
    customerName: string;
    customerPhone?: string;
    idToken?: string | null;
    startDate: string;
    endDate: string;
}

export const getOrders = async (params: GetOrdersParams): Promise<HistoryOrder[]> => {
    const searchParams = {
        ...params,
        customerPhone: params.customerPhone ? params.customerPhone.trim() : '',
        exactMatch: true
    };

    const result = await request<ApiResponse<HistoryOrder[]>>({
        action: 'getOrders',
        ...searchParams
    });

    if (!result.success) {
        throw new Error(result.message || '查詢失敗');
    }

    return result.data || [];
};
