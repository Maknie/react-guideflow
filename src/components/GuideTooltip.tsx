import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GuideStep } from '../types';

interface GuideTooltipProps {
    isActive: boolean;
    step?: GuideStep;
    currentStep: number;
    totalSteps: number;
    position: { x: number; y: number };
    theme?: 'light' | 'dark';
    showProgress?: boolean;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
}

export const GuideTooltip: React.FC<GuideTooltipProps> = ({
    isActive,
    step,
    currentStep,
    totalSteps,
    position,
    theme = 'light',
    showProgress = true,
    onNext,
    onPrev,
    onClose
}) => {
    if (!isActive || !step) return null;

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#333' : '#fff';
    const textColor = isDark ? '#fff' : '#000';
    const borderColor = isDark ? '#555' : '#ddd';

    return (
        <AnimatePresence>
            {isActive && step && (
                <motion.div
                    key="guide-tooltip"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'fixed',
                        left: position.x,
                        top: position.y,
                        maxWidth: 300,
                        padding: '16px',
                        background: bgColor,
                        color: textColor,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        zIndex: 10000
                    }}
                >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1976d2' }}>
                            {step.title}
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '4px',
                                color: textColor
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Description */}
                    <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.4', opacity: 0.8 }}>
                        {step.description}
                    </p>

                    {/* Content */}
                    {step.content && (
                        <div style={{ marginBottom: '16px' }}>
                            {step.content}
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {showProgress && (
                            <span style={{ fontSize: '12px', opacity: 0.6 }}>
                                Step {currentStep + 1} of {totalSteps}
                            </span>
                        )}

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={onPrev}
                                disabled={currentStep === 0}
                                style={{
                                    padding: '6px 12px',
                                    border: `1px solid ${borderColor}`,
                                    background: 'transparent',
                                    color: textColor,
                                    borderRadius: '4px',
                                    cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                    opacity: currentStep === 0 ? 0.5 : 1,
                                    fontSize: '12px'
                                }}
                            >
                                ← Back
                            </button>

                            {currentStep === totalSteps - 1 ? (
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: '#1976d2',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Finish
                                </button>
                            ) : (
                                <button
                                    onClick={onNext}
                                    style={{
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: '#1976d2',
                                        color: '#fff',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};