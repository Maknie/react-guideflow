# React Guide Tour

A flexible, lightweight React library for creating interactive step-by-step guides and tours in your applications.

## Features

- 🚀 **Lightweight** - Minimal dependencies (only framer-motion for animations)
- 🎨 **Customizable** - Flexible theming and styling options
- ⌨️ **Keyboard Navigation** - Optional keyboard support (Arrow keys, Space, Escape)
- 📱 **Responsive** - Automatically adjusts to screen boundaries
- 🔧 **TypeScript** - Full TypeScript support
- 🎭 **Two APIs** - Hook-based usage
- 🎯 **Smart Positioning** - Auto-positioning with placement options

## Installation

```bash
npm install react-guideflow
# or
yarn add react-guideflow
# or
pnpm add react-guideflow
```

## Quick Start

### Hook-based API (Recommended)

```tsx
import React from 'react';
import { useGuide, GuideOverlay, GuideTooltip } from 'react-guideflow';

const MyComponent = () => {
  const guide = useGuide({
    steps: [
      {
        selector: '[data-tour="welcome"]',
        title: 'Welcome!',
        description: 'This is your dashboard where you can see all your data.',
        placement: 'bottom'
      },
      {
        selector: '[data-tour="settings"]',
        title: 'Settings',
        description: 'Click here to customize your preferences.',
        placement: 'left'
      }
    ],
    onComplete: () => console.log('Tour completed!'),
    allowKeyboardNavigation: true,
    theme: 'light'
  });

  return (
    <div>
      <h1 data-tour="welcome">Welcome to Dashboard</h1>
      <button data-tour="settings">Settings</button>
      
      <button onClick={guide.startGuide}>
        Start Tour
      </button>

      {/* Guide Components */}
      <GuideOverlay 
        isActive={guide.isActive}
        highlightedElement={guide.highlightedElement}
        theme="light"
      />
      <GuideTooltip
        isActive={guide.isActive}
        step={guide.currentStepData}
        currentStep={guide.currentStep}
        totalSteps={guide.totalSteps}
        position={guide.tooltipPosition}
        theme="light"
        showProgress={true}
        onNext={guide.nextStep}
        onPrev={guide.prevStep}
        onClose={guide.stopGuide}
      />
    </div>
  );
};
```

## API Reference

### GuideStep

```typescript
interface GuideStep {
  selector: string;              // CSS selector for target element
  title: string;                 // Step title
  description: string;           // Step description
  content?: React.ReactNode;     // Optional custom content
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'; // Tooltip placement
}
```

### GuideOptions

```typescript
interface GuideOptions {
  steps: GuideStep[];
  onStart?: () => void;
  onComplete?: () => void;
  onStepChange?: (step: number) => void;
  onClose?: () => void;
  theme?: 'light' | 'dark';
  showProgress?: boolean;
  allowKeyboardNavigation?: boolean;
}
```

### useGuide Hook

The `useGuide` hook returns:

```typescript
{
  // State
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData?: GuideStep;
  highlightedElement: DOMRect | null;
  tooltipPosition: { x: number; y: number };
  
  // Actions
  startGuide: () => void;
  stopGuide: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
}
```

## Keyboard Navigation

When `allowKeyboardNavigation` is enabled:

- **→ (Right Arrow)** or **Space**: Next step
- **← (Left Arrow)**: Previous step  
- **Escape**: Close tour

## Styling

The library provides minimal default styles. You can customize the appearance by:

1. **Using the theme prop**: `'light'` or `'dark'`
2. **Custom components**: Create your own overlay and tooltip components
3. **Inline styles**: Pass custom styles to components

### Custom Components Example

```tsx
import { useGuide } from 'react-guideflow';

const CustomTooltip = ({ step, onNext, onPrev, onClose }) => (
  <div className="my-custom-tooltip">
    <h3>{step.title}</h3>
    <p>{step.description}</p>
    <div>
      <button onClick={onPrev}>Previous</button>
      <button onClick={onNext}>Next</button>
      <button onClick={onClose}>Close</button>
    </div>
  </div>
);

const MyComponent = () => {
  const guide = useGuide({ steps });
  
  return (
    <div>
      {/* Your content */}
      <CustomTooltip
        step={guide.currentStepData}
        onNext={guide.nextStep}
        onPrev={guide.prevStep}
        onClose={guide.stopGuide}
      />
    </div>
  );
};
```

## Advanced Usage

### Programmatic Control

```tsx
const MyComponent = () => {
  const guide = useGuide({
    steps,
    onStepChange: (stepIndex) => {
      console.log(`Now on step ${stepIndex + 1}`);
    }
  });

  const handleSpecialAction = () => {
    // Jump to specific step
    guide.goToStep(2);
  };

  const handleConditionalNext = () => {
    // Custom logic before proceeding
    if (someCondition) {
      guide.nextStep();
    } else {
      alert('Please complete the current action first');
    }
  };

  return (
    <div>
      <button onClick={handleSpecialAction}>
        Jump to Step 3
      </button>
      <button onClick={handleConditionalNext}>
        Smart Next
      </button>
    </div>
  );
};
```

### Dynamic Steps

```tsx
const [steps, setSteps] = useState(initialSteps);

const guide = useGuide({
  steps,
  onStepChange: (stepIndex) => {
    // Add steps dynamically based on user actions
    if (stepIndex === 2 && userHasAdvancedFeatures) {
      setSteps(prev => [...prev, advancedStep]);
    }
  }
});
```

### Integration with Router

```tsx
import { useNavigate } from 'react-router-dom';

const guide = useGuide({
  steps: [
    {
      selector: '[data-tour="nav-home"]',
      title: 'Navigation',
      description: 'Use this to navigate to different pages'
    }
  ],
  onStepChange: (stepIndex) => {
    // Navigate to different routes during the tour
    if (stepIndex === 1) {
      navigate('/dashboard');
    }
  }
});
```

## Examples

### E-commerce Onboarding

```tsx
const ecommerceSteps = [
  {
    selector: '[data-tour="search"]',
    title: 'Search Products',
    description: 'Find any product using our smart search feature.',
    placement: 'bottom'
  },
  {
    selector: '[data-tour="cart"]',
    title: 'Shopping Cart',
    description: 'Add items to your cart and checkout securely.',
    placement: 'left'
  },
  {
    selector: '[data-tour="profile"]',
    title: 'Your Profile',
    description: 'Manage your account and order history here.',
    placement: 'bottom'
  }
];
```

### Dashboard Tour with Custom Content

```tsx
const dashboardSteps = [
  {
    selector: '[data-tour="metrics"]',
    title: 'Key Metrics',
    description: 'Monitor your important KPIs here.',
    content: (
      <div>
        <img src="/metrics-preview.png" alt="Metrics preview" />
        <p>You can customize these widgets by clicking the settings icon.</p>
      </div>
    )
  }
];
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## Development

```bash
# Clone the repository
git clone https://github.com/Maknie/react-guideflow.git

# Install dependencies
npm install

# Start development
npm run build:watch

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT © Akniyet Maratov

## Changelog

### v1.0.0
- Initial release
- Hook-based APIs
- Keyboard navigation support
- TypeScript support
- Responsive positioning
- Light/dark themes