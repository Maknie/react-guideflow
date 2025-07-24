import { useState, useCallback, useRef, useEffect } from 'react';
import { GuideStep, GuideOptions, GuideState } from '../types';

export const useGuide = (options: GuideOptions) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const observerRef = useRef<MutationObserver | null>(null);

    const { steps, onStart, onComplete, onStepChange, onClose } = options;

    // Start guide
    const startGuide = useCallback(() => {
        if (steps.length === 0) return;
        setCurrentStep(0);
        setIsActive(true);
        onStart?.();
    }, [steps, onStart]);

    // Stop guide
    const stopGuide = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        setHighlightedElement(null);
        onClose?.();
    }, [onClose]);

    // Next step
    const nextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            const newStep = currentStep + 1;
            setCurrentStep(newStep);
            onStepChange?.(newStep);
        } else {
            setIsActive(false);
            onComplete?.();
        }
    }, [currentStep, steps.length, onStepChange, onComplete]);

    // Previous step
    const prevStep = useCallback(() => {
        if (currentStep > 0) {
            const newStep = currentStep - 1;
            setCurrentStep(newStep);
            onStepChange?.(newStep);
        }
    }, [currentStep, onStepChange]);

    // Go to specific step
    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < steps.length) {
            setCurrentStep(stepIndex);
            onStepChange?.(stepIndex);
        }
    }, [steps.length, onStepChange]);

    // Calculate tooltip position
    const calculateTooltipPosition = useCallback((
        elementRect: DOMRect,
        placement: GuideStep['placement'] = 'auto'
    ) => {
        const margin = 16;
        const tooltipSize = { width: 300, height: 150 };
        const viewport = { width: window.innerWidth, height: window.innerHeight };

        let x = elementRect.left + elementRect.width / 2 - tooltipSize.width / 2;
        let y = elementRect.bottom + margin;

        // Handle placement
        switch (placement) {
            case 'top':
                y = elementRect.top - tooltipSize.height - margin;
                break;
            case 'bottom':
                y = elementRect.bottom + margin;
                break;
            case 'left':
                x = elementRect.left - tooltipSize.width - margin;
                y = elementRect.top + elementRect.height / 2 - tooltipSize.height / 2;
                break;
            case 'right':
                x = elementRect.right + margin;
                y = elementRect.top + elementRect.height / 2 - tooltipSize.height / 2;
                break;
            default: // auto
                if (y + tooltipSize.height > viewport.height) {
                    y = elementRect.top - tooltipSize.height - margin;
                }
        }

        // Adjust for viewport boundaries
        if (x < margin) x = margin;
        if (x + tooltipSize.width > viewport.width - margin) {
            x = viewport.width - tooltipSize.width - margin;
        }
        if (y < margin) y = margin;
        if (y + tooltipSize.height > viewport.height - margin) {
            y = viewport.height - tooltipSize.height - margin;
        }

        return { x, y };
    }, []);

    // Update highlight
    const updateHighlight = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;

        const step = steps[currentStep];
        const element = document.querySelector(step.selector);

        if (element) {
            const rect = element.getBoundingClientRect();
            setHighlightedElement(rect);

            const position = calculateTooltipPosition(rect, step.placement);
            setTooltipPosition(position);

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }, [isActive, currentStep, steps, calculateTooltipPosition]);

    // Effects
    useEffect(() => {
        if (isActive) {
            updateHighlight();

            const observer = new MutationObserver(updateHighlight);
            observerRef.current = observer;
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });

            const handleResize = () => updateHighlight();
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleResize);

            // Keyboard navigation
            const handleKeyDown = (e: KeyboardEvent) => {
                if (!options.allowKeyboardNavigation) return;

                switch (e.key) {
                    case 'ArrowRight':
                    case ' ':
                        e.preventDefault();
                        nextStep();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        prevStep();
                        break;
                    case 'Escape':
                        e.preventDefault();
                        stopGuide();
                        break;
                }
            };

            if (options.allowKeyboardNavigation) {
                window.addEventListener('keydown', handleKeyDown);
            }

            return () => {
                if (observerRef.current) {
                    observerRef.current.disconnect();
                    observerRef.current = null;
                }
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleResize);
                if (options.allowKeyboardNavigation) {
                    window.removeEventListener('keydown', handleKeyDown);
                }
            };
        }
    }, [isActive, updateHighlight, options.allowKeyboardNavigation, nextStep, prevStep, stopGuide]);

    useEffect(() => {
        if (isActive) {
            updateHighlight();
        }
    }, [currentStep, isActive, updateHighlight]);

    const state: GuideState = {
        isActive,
        currentStep,
        totalSteps: steps.length,
        currentStepData: steps[currentStep]
    };

    return {
        ...state,
        startGuide,
        stopGuide,
        nextStep,
        prevStep,
        goToStep,
        highlightedElement,
        tooltipPosition
    };
};