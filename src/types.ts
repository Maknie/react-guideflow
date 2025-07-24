export interface GuideStep {
  selector: string;
  title: string;
  description: string;
  content?: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export interface GuideOptions {
  steps: GuideStep[] ;
  onStart?: () => void;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
  onClose?: () => void;
  theme?: 'light' | 'dark';
  showProgress?: boolean;
  allowKeyboardNavigation?: boolean;
}

export interface GuideState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData?: GuideStep;
}