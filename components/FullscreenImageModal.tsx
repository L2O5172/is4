
import React from 'react';

interface FullscreenImageModalProps {
    imageUrl: string;
    isOpen: boolean;
    onClose: () => void;
}

export const FullscreenImageModal: React.FC<FullscreenImageModalProps> = ({ imageUrl, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fullscreen-image-modal animate-fade-in" onClick={onClose}>
            <button onClick={onClose} className="clickable-btn">✕</button>
            <img src={imageUrl} alt="菜品圖片" className="rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};
