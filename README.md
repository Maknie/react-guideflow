# React GuideFlow

A flexible, lightweight React library for creating interactive step-by-step guides and tours in your applications. Built with a Context-based API for seamless integration and dynamic step management.

## Features

- 🚀 **Lightweight** - Minimal dependencies (only framer-motion for animations)
- 🎨 **Customizable** - Flexible theming and styling options
- ⌨️ **Keyboard Navigation** - Optional keyboard support (Arrow keys, Space, Escape)
- 📱 **Responsive** - Automatically adjusts to screen boundaries
- 🔧 **TypeScript** - Full TypeScript support
- 🌐 **Context-based API** - Use `GuideProvider` and `useGuideContext` for global access
- 🎯 **Smart Positioning** - Auto-positioning with placement options
- 🔄 **Dynamic Steps** - Add or remove steps programmatically during the tour

## Installation

```bash
npm install react-guideflow
# or
yarn add react-guideflow
# or
pnpm add react-guideflow
```

## Quick Start

### Context-based API (Recommended)

Wrap your application with `GuideProvider` and use `useGuideContext` to control the guide from any component in the tree.

```tsx
import React from 'react';
import { GuideProvider, useGuideContext, GuideOverlay, GuideTooltip } from 'react-guideflow';

const steps = [
  {
    selector: '[data-tour="welcome"]',
    title: 'Welcome!',
    description: 'This is your dashboard where you can see all your data.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="settings"]',
    title: 'Settings',
    description: 'Click here to customize your preferences.',
    placement: 'left',
  },
];

const StepController = () => {
  const { startGuide, addStep } = useGuideContext();

  const handleAddStep = () => {
    addStep({
      selector: '[data-tour="dynamic"]',
      title: 'Dynamic Step',
      description: 'This step was added dynamically!',
      placement: 'right',
    });
    startGuide(); // Restart guide to include new step
  };

  return (
    <div>
      <button onClick={startGuide}>Start Tour</button>
      <button onClick={handleAddStep}>Add Dynamic Step</button>
    </div>
  );
};

const App = () => {
  const guideOptions = {
    steps,
    onStart: () => console.log('Tour started'),
    onComplete: () => console.log('Tour completed'),
    onStepChange: (step: number) => console.log(`Step changed to ${step + 1}`),
    onClose: () => console.log('Tour closed'),
    allowKeyboardNavigation: true,
    theme: 'light',
  };

  return (
    <GuideProvider options={guideOptions}>
      <div>
        <h1 data-tour="welcome">Welcome to Dashboard</h1>
        <button data-tour="settings">Settings</button>
        <div data-tour="dynamic">Dynamic Element</div>
        <StepController />
        <GuideOverlay
          isActive={useGuideContext().isActive}
          highlightedElement={useGuideContext().highlightedElement}
          theme="light"
        />
        <GuideTooltip
          isActive={useGuideContext().isActive}
          step={useGuideContext().currentStepData}
          currentStep={useGuideContext().currentStep}
          totalSteps={useGuideContext().totalSteps}
          position={useGuideContext().tooltipPosition}
          theme="light"
          showProgress={true}
          onNext={useGuideContext().nextStep}
          onPrev={useGuideContext().prevStep}
          onClose={useGuideContext().stopGuide}
        />
      </div>
    </GuideProvider>
  );
};

export default App;
```

## API Reference

### GuideStep

```typescript
interface GuideStep {
  selector: string; // CSS selector for target element
  title: string; // Step title
  description: string; // Step description
  content?: React.ReactNode; // Optional custom content
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'; // Tooltip placement
}
```

### GuideOptions

```typescript
interface GuideOptions {
  steps: GuideStep[]; // Initial steps for the guide
  onStart?: () => void; // Called when guide starts
  onComplete?: () => void; // Called when guide completes
  onStepChange?: (step: number) => void; // Called when step changes
  onClose?: () => void; // Called when guide is closed
  theme?: 'light' | 'dark'; // Theme for overlay and tooltip
  showProgress?: boolean; // Show progress indicator in tooltip
  allowKeyboardNavigation?: boolean; // Enable keyboard navigation
}
```

### GuideProvider

Wrap your application or a subtree with `GuideProvider` to provide guide functionality.

```typescript
interface GuideProviderProps {
  options: GuideOptions;
  children: React.ReactNode;
}
```

### useGuideContext Hook

The `useGuideContext` hook provides access to the guide's state and methods:

```typescript
{
  // State
  isActive: boolean; // Whether the guide is active
  currentStep: number; // Current step index
  totalSteps: number; // Total number of steps
  currentStepData?: GuideStep; // Data for the current step
  highlightedElement: DOMRect | null; // Bounding rect of the highlighted element
  tooltipPosition: { x: number; y: number }; // Position for the tooltip

  // Actions
  startGuide: () => void; // Start the guide
  stopGuide: () => void; // Stop the guide
  addStep: (step: GuideStep) => void; // Add a new step dynamically
  removeStep: (selector: string) => void; // Remove a step by selector
  nextStep: () => void; // Go to the next step
  prevStep: () => void; // Go to the previous step
  goToStep: (stepIndex: number) => void; // Jump to a specific step
}
```

## Keyboard Navigation

When `allowKeyboardNavigation` is enabled in `GuideOptions`:

- **→ (Right Arrow)** or **Space**: Go to the next step
- **← (Left Arrow)**: Go to the previous step
- **Escape**: Close the tour

## Styling

Customize the appearance of the guide:

1. **Using the theme prop**: `'light'` or `'dark'` for `GuideOverlay` and `GuideTooltip`.
2. **Custom components**: Replace `GuideTooltip` or `GuideOverlay` with your own components.
3. **Inline styles**: Pass custom styles to `GuideOverlay` or `GuideTooltip`.

### Custom Tooltip Example

```tsx
import { useGuideContext } from 'react-guideflow';

const CustomTooltip = () => {
  const { isActive, currentStepData, currentStep, totalSteps, tooltipPosition, nextStep, prevStep, stopGuide } =
    useGuideContext();

  if (!isActive || !currentStepData) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: tooltipPosition.y,
        left: tooltipPosition.x,
        background: 'white',
        border: '1px solid black',
        padding: '10px',
        zIndex: 1000,
      }}
    >
      <h3>{currentStepData.title}</h3>
      <p>{currentStepData.description}</p>
      <div>
        <button onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={nextStep}>Next</button>
        <button onClick={stopGuide}>Close</button>
        <p>
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <GuideProvider options={guideOptions}>
      <div>
        <h1 data-tour="welcome">Welcome</h1>
        <CustomTooltip />
      </div>
    </GuideProvider>
  );
};
```

## Advanced Usage

### Dynamic Step Management

Add or remove steps dynamically during the tour:

```tsx
import { GuideProvider, useGuideContext } from 'react-guideflow';

const StepController = () => {
  const { addStep, removeStep, startGuide } = useGuideContext();

  const handleAddStep = () => {
    addStep({
      selector: '[data-tour="new-step"]',
      title: 'New Feature',
      description: 'This step was added dynamically!',
      placement: 'top',
    });
    startGuide(); // Restart to reflect new steps
  };

  const handleRemoveStep = () => {
    removeStep('[data-tour="welcome"]');
    startGuide(); // Restart to reflect updated steps
  };

  return (
    <div>
      <button onClick={handleAddStep}>Add Step</button>
      <button onClick={handleRemoveStep}>Remove Welcome Step</button>
    </div>
  );
};

const App = () => {
  const guideOptions = {
    steps: [
      {
        selector: '[data-tour="welcome"]',
        title: 'Welcome',
        description: 'This is the welcome section.',
        placement: 'bottom',
      },
    ],
    allowKeyboardNavigation: true,
  };

  return (
    <GuideProvider options={guideOptions}>
      <div>
        <h1 data-tour="welcome">Welcome</h1>
        <div data-tour="new-step">New Feature</div>
        <StepController />
        <GuideTooltip
          isActive={useGuideContext().isActive}
          step={useGuideContext().currentStepData}
          currentStep={useGuideContext().currentStep}
          totalSteps={useGuideContext().totalSteps}
          position={useGuideContext().tooltipPosition}
          onNext={useGuideContext().nextStep}
          onPrev={useGuideContext().prevStep}
          onClose={useGuideContext().stopGuide}
        />
      </div>
    </GuideProvider>
  );
};
```

### Programmatic Control

Jump to specific steps or control the flow programmatically:

```tsx
const StepController = () => {
  const { goToStep, nextStep, stopGuide } = useGuideContext();

  const handleSpecialAction = () => {
    goToStep(2); // Jump to step 3
  };

  const handleConditionalNext = () => {
    if (someCondition) {
      nextStep();
    } else {
      alert('Please complete the current action first');
    }
  };

  return (
    <div>
      <button onClick={handleSpecialAction}>Jump to Step 3</button>
      <button onClick={handleConditionalNext}>Smart Next</button>
      <button onClick={stopGuide}>Stop Tour</button>
    </div>
  );
};
```

### Integration with Router

Navigate to different routes during the tour:

```tsx
import { useNavigate } from 'react-router-dom';
import { GuideProvider, useGuideContext } from 'react-guideflow';

const StepController = () => {
  const { startGuide } = useGuideContext();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate('/dashboard');
        setTimeout(() => startGuide(), 500); // Start guide after navigation
      }}
    >
      Go to Dashboard and Start Tour
    </button>
  );
};

const App = () => {
  const guideOptions = {
    steps: [
      {
        selector: '[data-tour="nav-home"]',
        title: 'Navigation',
        description: 'Use this to navigate to different pages',
      },
    ],
    onStepChange: (stepIndex) => {
      if (stepIndex === 1) {
        navigate('/dashboard');
      }
    },
  };

  return (
    <GuideProvider options={guideOptions}>
      <div>
        <nav data-tour="nav-home">Home</nav>
        <StepController />
      </div>
    </GuideProvider>
  );
};
```

## Examples

### E-commerce Onboarding

```tsx
const ecommerceSteps = [
  {
    selector: '[data-tour="search"]',
    title: 'Search Products',
    description: 'Find any product using our smart search feature.',
    placement: 'bottom',
  },
  {
    selector: '[data-tour="cart"]',
    title: 'Shopping Cart',
    description: 'Add items to your cart and checkout securely.',
    placement: 'left',
  },
  {
    selector: '[data-tour="profile"]',
    title: 'Your Profile',
    description: 'Manage your account and order history here.',
    placement: 'bottom',
  },
];

const App = () => (
  <GuideProvider options={{ steps: ecommerceSteps }}>
    <div>
      <input data-tour="search" type="text" placeholder="Search..." />
      <button data-tour="cart">Cart</button>
      <div data-tour="profile">Profile</div>
    </div>
  </GuideProvider>
);
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
    ),
  },
];

const App = () => (
  <GuideProvider options={{ steps: dashboardSteps }}>
    <div>
      <div data-tour="metrics">Metrics Dashboard</div>
    </div>
  </GuideProvider>
);
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

### v1.0.4
- **Breaking Change**: Replaced `useGuide` hook with `GuideProvider` and `useGuideContext` for a Context-based API
- Added `addStep` and `removeStep` for dynamic step management
- Improved step updates to ensure reactivity
- Maintained all existing features (keyboard navigation, responsive positioning, themes)

### v1.0.0
- Initial release
- Hook-based API
- Keyboard navigation support
- TypeScript support
- Responsive positioning
- Light/dark themes

---
