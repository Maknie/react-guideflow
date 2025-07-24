import { useState, useCallback, useRef, useEffect } from 'react';
import { GuideStep, GuideOptions, GuideState } from '../types';

export const useGuide = (options: GuideOptions) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const observerRef = useRef<MutationObserver | null>(null);

    // Use refs to store the latest values without causing re-renders
    const optionsRef = useRef(options);
    const stepsRef = useRef(options.steps);

    // Update refs when options change
    useEffect(() => {
        optionsRef.current = options;
        stepsRef.current = options.steps;
    });

    const { steps, onStart, onComplete, onStepChange, onClose } = options;

    // Start guide - stable function
    const startGuide = useCallback(() => {
        if (stepsRef.current.length === 0) return;
        setCurrentStep(0);
        setIsActive(true);
        optionsRef.current.onStart?.();
    }, []); // No dependencies - uses refs

    // Stop guide - stable function
    const stopGuide = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        setHighlightedElement(null);
        optionsRef.current.onClose?.();
    }, []); // No dependencies - uses refs

    const addStep = useCallback((step: GuideStep) => {
        stepsRef.current.push(step);
    }, []);

    const removeStep = useCallback((selector: string) => {
        stepsRef.current = stepsRef.current.filter(step => step.selector !== selector);
    }, []);

    // Next step - stable function
    const nextStep = useCallback(() => {
        setCurrentStep(prevStep => {
            if (prevStep < stepsRef.current.length - 1) {
                const newStep = prevStep + 1;
                optionsRef.current.onStepChange?.(newStep);
                return newStep;
            } else {
                setIsActive(false);
                optionsRef.current.onComplete?.();
                return prevStep;
            }
        });
    }, []); // No dependencies - uses refs and functional updates

    // Previous step - stable function
    const prevStep = useCallback(() => {
        setCurrentStep(prevStep => {
            if (prevStep > 0) {
                const newStep = prevStep - 1;
                optionsRef.current.onStepChange?.(newStep);
                return newStep;
            }
            return prevStep;
        });
    }, []); // No dependencies - uses refs and functional updates

    // Go to specific step - stable function
    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < stepsRef.current.length) {
            setCurrentStep(stepIndex);
            optionsRef.current.onStepChange?.(stepIndex);
        }
    }, []); // No dependencies - uses refs

    // Calculate tooltip position - stable function
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
    }, []); // No dependencies - only uses constants and window

    // Update highlight - now with stable dependencies
    const updateHighlight = useCallback(() => {
        if (!isActive) return;

        const currentStepData = stepsRef.current[currentStep];
        if (!currentStepData) return;

        const element = document.querySelector(currentStepData.selector);

        if (element) {
            const rect = element.getBoundingClientRect();
            setHighlightedElement(rect);

            const position = calculateTooltipPosition(rect, currentStepData.placement);
            setTooltipPosition(position);

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }, [isActive, currentStep, calculateTooltipPosition]); // Minimal stable dependencies

    // Main effect - now with stable dependencies
    useEffect(() => {
        if (!isActive) return;

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
            if (!optionsRef.current.allowKeyboardNavigation) return;

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

        if (optionsRef.current.allowKeyboardNavigation) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleResize);
            if (optionsRef.current.allowKeyboardNavigation) {
                window.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [isActive, updateHighlight, nextStep, prevStep, stopGuide]);

    // Separate effect for current step changes
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
        addStep,
        removeStep,
        nextStep,
        prevStep,
        goToStep,
        highlightedElement,
        tooltipPosition
    };
};