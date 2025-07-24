import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideOverlayProps {
    isActive: boolean;
    highlightedElement: DOMRect | null;
    theme?: 'light' | 'dark';
}

export const GuideOverlay: React.FC<GuideOverlayProps> = ({
    isActive,
    highlightedElement,
    theme = 'light'
}) => {
    if (!isActive || !highlightedElement) return null;

    const overlayColor = theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';

    return (
        <AnimatePresence>
            {isActive && highlightedElement && (
                <React.Fragment key="guide-overlay">
                    <motion.div
                        key="overlay-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            background: overlayColor,
                            zIndex: 9998,
                            pointerEvents: 'none'
                        }}
                    />
                    <motion.div
                        key="overlay-highlight"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            left: highlightedElement.left - 4,
                            top: highlightedElement.top - 4,
                            width: highlightedElement.width + 8,
                            height: highlightedElement.height + 8,
                            border: '2px solid #1976d2',
                            borderRadius: '4px',
                            boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.2), 0 0 20px rgba(0, 0, 0, 0.3)',
                            pointerEvents: 'none',
                            background: 'transparent',
                            zIndex: 9999
                        }}
                    />
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};
