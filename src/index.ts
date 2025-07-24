// src/index.ts
export { useGuide } from './hooks/useGuide';
export { GuideOverlay } from './components/GuideOverlay';
export { GuideTooltip } from './components/GuideTooltip';
export type { GuideStep, GuideOptions, GuideState } from './types';

// Example usage:
/*
// Hook-based approach (recommended for libraries)
import { useGuide, GuideOverlay, GuideTooltip } from 'react-guideflow';
 
const MyComponent = () => {
  const guide = useGuide({
    steps: [
      { selector: '[data-tour="button"]', title: 'Button', description: 'Click here' }
    ],
    onComplete: () => console.log('Tour completed!'),
    allowKeyboardNavigation: true
  });
 
  return (
    <div>
      <button data-tour="button" onClick={guide.startGuide}>Start Tour</button>
      
      <GuideOverlay 
        isActive={guide.isActive}
        highlightedElement={guide.highlightedElement}
      />
      <GuideTooltip
        isActive={guide.isActive}
        step={guide.currentStepData}
        currentStep={guide.currentStep}
        totalSteps={guide.totalSteps}
        position={guide.tooltipPosition}
        onNext={guide.nextStep}
        onPrev={guide.prevStep}
        onClose={guide.stopGuide}
      />
    </div>
  );
};
 
*/