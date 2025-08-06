import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
    ReactNode,
} from 'react';
import { GuideStep, GuideOptions, GuideState } from '../types';

interface GuideContextType extends GuideState {
    startGuide: () => void;
    stopGuide: () => void;
    clearSteps: () => void;
    addStep: (step: GuideStep) => void;
    removeStep: (selector: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (stepIndex: number) => void;
    highlightedElement: DOMRect | null;
    tooltipPosition: { x: number; y: number };
    dontShowAnymore: () => void;
    cancelDontShowAnymore: () => void;
    restartGuide: () => void;
    isDismissed: boolean;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

export const useGuideContext = () => {
    const context = useContext(GuideContext);
    if (!context) {
        throw new Error('useGuideContext must be used within a GuideProvider');
    }
    return context;
};

interface GuideProviderProps {
    options: GuideOptions;
    children: ReactNode;
    // Optional props for "don't show anymore" functionality
    persistenceKey?: string; // Unique key for localStorage
    storageType?: 'localStorage' | 'sessionStorage' | 'memory'; // Storage method
}

export const GuideProvider = ({
    options,
    children,
    persistenceKey = 'guide-dismissed',
    storageType = 'localStorage'
}: GuideProviderProps) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<DOMRect | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isDismissed, setIsDismissed] = useState(false);
    // Add steps state
    const [steps, setSteps] = useState<GuideStep[]>(options.steps);
    const observerRef = useRef<MutationObserver | null>(null);

    // Use refs for non-rendering updates
    const optionsRef = useRef(options);
    const stepsRef = useRef(steps);

    // Storage helper functions
    const getStorageValue = useCallback((key: string): string | null => {
        try {
            switch (storageType) {
                case 'localStorage':
                    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
                case 'sessionStorage':
                    return typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
                case 'memory':
                default:
                    return null; // Memory storage would need to be implemented separately
            }
        } catch (error) {
            console.warn('Failed to read from storage:', error);
            return null;
        }
    }, [storageType]);

    const setStorageValue = useCallback((key: string, value: string) => {
        try {
            switch (storageType) {
                case 'localStorage':
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(key, value);
                    }
                    break;
                case 'sessionStorage':
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem(key, value);
                    }
                    break;
                case 'memory':
                default:
                    // Memory storage would need to be implemented separately
                    break;
            }
        } catch (error) {
            console.warn('Failed to write to storage:', error);
        }
    }, [storageType]);

    // Check if guide has been dismissed on mount
    useEffect(() => {
        const dismissed = getStorageValue(persistenceKey);
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, [getStorageValue, persistenceKey]);

    // Sync refs with state and props
    useEffect(() => {
        optionsRef.current = options;
        // Initialize steps state if options.steps changes
        setSteps(options.steps);
    }, [options]);

    useEffect(() => {
        stepsRef.current = steps;
    }, [steps]);

    const startGuide = useCallback(() => {
        if (isDismissed) {
            console.log('Guide has been dismissed by user');
            return;
        }

        if (stepsRef.current.length === 0) return;
        setCurrentStep(0);
        setIsActive(true);
        optionsRef.current.onStart?.();
    }, [isDismissed]);

    const stopGuide = useCallback(() => {
        setIsActive(false);
        setCurrentStep(0);
        setHighlightedElement(null);
        optionsRef.current.onClose?.();
    }, []);

    const clearSteps = useCallback(() => {
        setSteps([]);
        setCurrentStep(0);
        setIsActive(false);
        setHighlightedElement(null);
        optionsRef.current.onClose?.();
    }, []);

    // New function to handle "don't show anymore"
    const dontShowAnymore = useCallback(() => {
        setIsDismissed(true);
        setStorageValue(persistenceKey, 'true');
        stopGuide();
        optionsRef.current.onDismiss?.(); // Optional callback for when user dismisses
    }, [setStorageValue, persistenceKey, stopGuide]);

    const cancelDontShowAnymore = useCallback(() => {
        setIsDismissed(false);
        setStorageValue(persistenceKey, 'false');
        setCurrentStep(0);
        setIsActive(true);
    }, [setStorageValue, persistenceKey, setCurrentStep, setIsActive]);

    const restartGuide = useCallback(() => {
        setIsDismissed(false);
        setStorageValue(persistenceKey, 'false');
        setCurrentStep(0);
        setIsActive(true);
    }, []);

    // Fixed addStep to update state immutably
    const addStep = useCallback((step: GuideStep) => {
        if (steps.find(actualStep => actualStep.selector === step.selector)) return;
        setSteps((prevSteps) => [...prevSteps, step]);
    }, []);

    // Fixed removeStep to update state immutably
    const removeStep = useCallback((selector: string) => {
        setSteps((prevSteps) => prevSteps.filter((step) => step.selector !== selector));
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep((prevStep) => {
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
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep((prevStep) => {
            if (prevStep > 0) {
                const newStep = prevStep - 1;
                optionsRef.current.onStepChange?.(newStep);
                return newStep;
            }
            return prevStep;
        });
    }, []);

    const goToStep = useCallback((stepIndex: number) => {
        if (stepIndex >= 0 && stepIndex < stepsRef.current.length) {
            setCurrentStep(stepIndex);
            optionsRef.current.onStepChange?.(stepIndex);
        }
    }, []);

    const calculateTooltipPosition = useCallback(
        (elementRect: DOMRect, placement: GuideStep['placement'] = 'auto') => {
            const margin = 16;
            const tooltipSize = { width: 300, height: 150 };
            const viewport = { width: window.innerWidth, height: window.innerHeight };

            let x = elementRect.left + elementRect.width / 2 - tooltipSize.width / 2;
            let y = elementRect.bottom + margin;

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
                default:
                    if (y + tooltipSize.height > viewport.height) {
                        y = elementRect.top - tooltipSize.height - margin;
                    }
            }

            if (x < margin) x = margin;
            if (x + tooltipSize.width > viewport.width - margin) {
                x = viewport.width - tooltipSize.width - margin;
            }
            if (y < margin) y = margin;
            if (y + tooltipSize.height > viewport.height - margin) {
                y = viewport.height - tooltipSize.height - margin;
            }

            return { x, y };
        },
        []
    );

    const updateHighlight = useCallback(() => {
        if (!isActive) return;

        const currentStepData = stepsRef.current[currentStep];
        if (!currentStepData) return;

        const element = document.querySelector(currentStepData.selector);
        if (!element) {
            console.warn(`Element not found for selector: ${currentStepData.selector}`);
            removeStep(currentStepData.selector);
            return;
        }

        const rect = element.getBoundingClientRect();
        setHighlightedElement(rect);
        const position = calculateTooltipPosition(rect, currentStepData.placement);
        setTooltipPosition(position);

        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
        });
    }, [isActive, currentStep, calculateTooltipPosition, removeStep]);

    useEffect(() => {
        if (!isActive) return;

        updateHighlight();

        const observer = new MutationObserver(updateHighlight);
        observerRef.current = observer;
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });

        const handleResize = () => updateHighlight();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleResize);

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

    useEffect(() => {
        if (isActive) {
            updateHighlight();
        }
    }, [currentStep, isActive, updateHighlight]);

    const state: GuideState = {
        isActive,
        currentStep,
        totalSteps: steps.length, // Use state-based steps
        currentStepData: steps[currentStep], // Use state-based steps
    };

    const value: GuideContextType = {
        ...state,
        startGuide,
        stopGuide,
        clearSteps,
        addStep,
        removeStep,
        nextStep,
        prevStep,
        goToStep,
        highlightedElement,
        tooltipPosition,
        dontShowAnymore,
        cancelDontShowAnymore,
        isDismissed,
        restartGuide,
    };

    return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
};