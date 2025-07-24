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
    const highlightPadding = 8;

    const maskId = `guide-mask-${Date.now()}`;

    const cutoutArea = {
        x: highlightedElement.left - highlightPadding,
        y: highlightedElement.top - highlightPadding,
        width: highlightedElement.width + (highlightPadding * 2),
        height: highlightedElement.height + (highlightPadding * 2),
        rx: 8
    };

    return (
        <AnimatePresence>
            {isActive && highlightedElement && (
                <React.Fragment key="guide-overlay">
                    {/* SVG Mask Overlay */}
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
                            zIndex: 9998,
                            pointerEvents: 'none'
                        }}
                    >
                        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                            <defs>
                                <mask id={maskId}>
                                    <rect width="100%" height="100%" fill="white" />
                                    <rect
                                        x={cutoutArea.x}
                                        y={cutoutArea.y}
                                        width={cutoutArea.width}
                                        height={cutoutArea.height}
                                        rx={cutoutArea.rx}
                                        fill="black"
                                    />
                                </mask>
                            </defs>
                            <rect
                                width="100%"
                                height="100%"
                                fill={overlayColor}
                                mask={`url(#${maskId})`}
                            />
                        </svg>
                    </motion.div>

                    {/* Highlight border */}
                    <motion.div
                        key="overlay-highlight-border"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{
                            position: 'fixed',
                            left: cutoutArea.x - 2,
                            top: cutoutArea.y - 2,
                            width: cutoutArea.width + 4,
                            height: cutoutArea.height + 4,
                            border: '1px solid #1976d2',
                            borderRadius: `${cutoutArea.rx + 2}px`,
                            boxShadow: `
                                0 0 0 1px rgba(255, 255, 255, 0.8),
                                0 0 30px rgba(25, 118, 210, 0.5),
                                0 4px 20px rgba(0, 0, 0, 0.2)
                            `,
                            pointerEvents: 'none',
                            background: 'transparent',
                            zIndex: 9999
                        }}
                    />

                    {/* Animated highlight glow */}
                    <motion.div
                        key="overlay-glow"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0.4, 0.8, 0.4],
                            scale: [1, 1.01, 1]
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            position: 'fixed',
                            left: cutoutArea.x - 6,
                            top: cutoutArea.y - 6,
                            width: cutoutArea.width + 12,
                            height: cutoutArea.height + 12,
                            borderRadius: `${cutoutArea.rx + 6}px`,
                            background: 'transparent',
                            border: '1px solid rgba(25, 118, 210, 0.6)',
                            pointerEvents: 'none',
                            zIndex: 9997
                        }}
                    />

                    {/* Click-through area */}
                    <div
                        key="overlay-clickthrough"
                        style={{
                            position: 'fixed',
                            // left: highlightedElement.left,
                            // top: highlightedElement.top,
                            // width: highlightedElement.width,
                            // height: highlightedElement.height,
                            zIndex: 10000,
                            pointerEvents: 'auto',
                            background: 'transparent'
                        }}
                    />
                </React.Fragment>
            )}
        </AnimatePresence>
    );
};