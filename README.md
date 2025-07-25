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
- 💾 **Persistence** - "Don't show anymore" functionality with localStorage/sessionStorage support
- ⚡ **Smart Dismissal** - Prevents guide from showing again when user dismisses permanently

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
  const { startGuide, addStep, isDismissed } = useGuideContext();

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
      <button onClick={startGuide} disabled={isDismissed}>
        {isDismissed ? 'Guide Dismissed' : 'Start Tour'}
      </button>
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
    onDismiss: () => console.log('Tour dismissed permanently'),
    allowKeyboardNavigation: true,
    theme: 'light',
  };

  return (
    <GuideProvider 
      options={guideOptions}
      persistenceKey="my-app-guide-dismissed"
      storageType="localStorage"
    >
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
          showDontShowAnymore={true}
          dontShowAnymoreText="Don't show this guide again"
          dontShowAnymorePosition="bottom"
          onNext={useGuideContext().nextStep}
          onPrev={useGuideContext().prevStep}
          onClose={useGuideContext().stopGuide}
          onDontShowAnymore={useGuideContext().dontShowAnymore}
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
  onDismiss?: () => void; // Called when user clicks "don't show anymore"
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
  persistenceKey?: string; // Unique key for localStorage (default: 'guide-dismissed')
  storageType?: 'localStorage' | 'sessionStorage' | 'memory'; // Storage method (default: 'localStorage')
}
```

### GuideTooltip

Enhanced tooltip component with dismissal functionality.

```typescript
interface GuideTooltipProps {
  // ... existing props
  onDontShowAnymore?: () => void; // Callback for "don't show anymore"
  showDontShowAnymore?: boolean; // Show the dismissal button (default: true)
  dontShowAnymoreText?: string | React.ReactNode; // Custom text/content for dismissal button
  dontShowAnymorePosition?: 'left' | 'center' | 'bottom'; // Position of dismissal button (default: 'left')
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
  isDismissed: boolean; // Whether the guide has been permanently dismissed

  // Actions
  startGuide: () => void; // Start the guide (won't start if dismissed)
  stopGuide: () => void; // Stop the guide
  addStep: (step: GuideStep) => void; // Add a new step dynamically
  removeStep: (selector: string) => void; // Remove a step by selector
  nextStep: () => void; // Go to the next step
  prevStep: () => void; // Go to the previous step
  goToStep: (stepIndex: number) => void; // Jump to a specific step
  dontShowAnymore: () => void; // Permanently dismiss the guide
}
```

## Persistence & Dismissal

### Don't Show Anymore Functionality

Users can permanently dismiss guides to improve user experience:

```tsx
const App = () => {
  const guideOptions = {
    steps: mySteps,
    onDismiss: () => {
      console.log('User chose not to see this guide again');
      // Optional: Send analytics or update user preferences
    },
  };

  return (
    <GuideProvider 
      options={guideOptions}
      persistenceKey="onboarding-guide" // Unique key for this guide
      storageType="localStorage" // Persists across sessions
    >
      <MyApp />
    </GuideProvider>
  );
};
```

### Storage Options

- **localStorage**: Persists across browser sessions (default)
- **sessionStorage**: Persists only for the current session
- **memory**: No persistence, resets on page reload

### Customizing Dismissal UI

```tsx
// Simple string - package handles the click
<GuideTooltip
  // ... other props
  showDontShowAnymore={true}
  dontShowAnymoreText="Skip future tutorials"
  dontShowAnymorePosition="bottom"
  onDontShowAnymore={dontShowAnymore}
/>

// Custom ReactNode with styled text - package handles the click
<GuideTooltip
  // ... other props
  showDontShowAnymore={true}
  dontShowAnymoreText={
    <span style={{ color: 'red', fontWeight: 'bold' }}>
      🚫 Never show again
    </span>
  }
  onDontShowAnymore={dontShowAnymore}
/>

// Custom ReactNode with own click handler - you handle the click
<GuideTooltip
  // ... other props
  showDontShowAnymore={true}
  dontShowAnymoreText={
    <button 
      onClick={() => {
        // Your custom logic here
        console.log('Custom dismissal logic');
        dontShowAnymore(); // Call the package function
      }}
      style={{ 
        background: 'none',
        border: '1px solid #ccc',
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Custom Dismiss Button
    </button>
  }
  // onDontShowAnymore not needed when ReactNode handles its own click
/>

// Complex custom component with multiple interactions
<GuideTooltip
  // ... other props  
  showDontShowAnymore={true}
  dontShowAnymoreText={
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input 
        type="checkbox" 
        id="dont-show-checkbox"
        onChange={(e) => {
          if (e.target.checked) {
            dontShowAnymore();
          }
        }}
      />
      <label 
        htmlFor="dont-show-checkbox" 
        style={{ fontSize: '11px', cursor: 'pointer' }}
      >
        Don't show this again
      </label>
    </div>
  }
/>
```

### Checking Dismissal Status

```tsx
const MyComponent = () => {
  const { isDismissed, startGuide } = useGuideContext();

  useEffect(() => {
    // Only show guide for new users
    if (!isDismissed && isNewUser) {
      startGuide();
    }
  }, [isDismissed, isNewUser, startGuide]);

  return (
    <button onClick={startGuide} disabled={isDismissed}>
      {isDismissed ? 'Guide Disabled' : 'Show Tutorial'}
    </button>
  );
};
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
  const { 
    isActive, 
    currentStepData, 
    currentStep, 
    totalSteps, 
    tooltipPosition, 
    nextStep, 
    prevStep, 
    stopGuide,
    dontShowAnymore 
  } = useGuideContext();

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
        <button onClick={dontShowAnymore} style={{ fontSize: '12px', opacity: 0.7 }}>
          Don't show again
        </button>
        <p>
          Step {currentStep + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
};
```

## Advanced Usage

### Multiple Guides with Different Persistence

```tsx
const App = () => {
  return (
    <div>
      {/* Onboarding guide */}
      <GuideProvider 
        options={onboardingOptions}
        persistenceKey="onboarding-guide"
        storageType="localStorage"
      >
        <OnboardingFlow />
      </GuideProvider>

      {/* Feature tour guide */}
      <GuideProvider 
        options={featureTourOptions}
        persistenceKey="feature-tour-guide"
        storageType="sessionStorage"
      >
        <FeatureTour />
      </GuideProvider>
    </div>
  );
};
```

### Conditional Guide Display

```tsx
const SmartGuideController = () => {
  const { startGuide, isDismissed } = useGuideContext();
  const [userLevel, setUserLevel] = useState('beginner');

  useEffect(() => {
    // Only show guide for beginners who haven't dismissed it
    if (userLevel === 'beginner' && !isDismissed) {
      const timer = setTimeout(() => startGuide(), 2000);
      return () => clearTimeout(timer);
    }
  }, [userLevel, isDismissed, startGuide]);

  return (
    <div>
      <select value={userLevel} onChange={(e) => setUserLevel(e.target.value)}>
        <option value="beginner">Beginner</option>
        <option value="advanced">Advanced</option>
      </select>
      
      {!isDismissed && (
        <button onClick={startGuide}>Show Tutorial</button>
      )}
    </div>
  );
};
```

### Dynamic Step Management

Add or remove steps dynamically during the tour:

```tsx
import { GuideProvider, useGuideContext } from 'react-guideflow';

const StepController = () => {
  const { addStep, removeStep, startGuide, isDismissed } = useGuideContext();

  const handleAddStep = () => {
    if (isDismissed) {
      alert('Guide has been dismissed. Please refresh to reset.');
      return;
    }
    
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
      <button onClick={handleAddStep} disabled={isDismissed}>
        Add Step
      </button>
      <button onClick={handleRemoveStep} disabled={isDismissed}>
        Remove Welcome Step
      </button>
    </div>
  );
};
```

### Programmatic Control

Jump to specific steps or control the flow programmatically:

```tsx
const StepController = () => {
  const { goToStep, nextStep, stopGuide, isDismissed } = useGuideContext();

  const handleSpecialAction = () => {
    if (!isDismissed) {
      goToStep(2); // Jump to step 3
    }
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
      <button onClick={handleSpecialAction} disabled={isDismissed}>
        Jump to Step 3
      </button>
      <button onClick={handleConditionalNext}>Smart Next</button>
      <button onClick={stopGuide}>Stop Tour</button>
    </div>
  );
};
```

### Integration with User Preferences

```tsx
import { useUser } from './user-context';

const App = () => {
  const { user, updateUserPreferences } = useUser();
  
  const guideOptions = {
    steps: onboardingSteps,
    onDismiss: () => {
      // Update user preferences when guide is dismissed
      updateUserPreferences({
        ...user.preferences,
        showOnboardingGuide: false
      });
    },
  };

  return (
    <GuideProvider 
      options={guideOptions}
      persistenceKey={`guide-${user.id}`} // User-specific persistence
      storageType="localStorage"
    >
      <MyApp />
    </GuideProvider>
  );
};
```

## Examples

### E-commerce Onboarding with Dismissal

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

const EcommerceApp = () => {
  const guideOptions = {
    steps: ecommerceSteps,
    onDismiss: () => {
      // Track dismissal for analytics
      analytics.track('onboarding_dismissed');
    },
  };

  return (
    <GuideProvider 
      options={guideOptions}
      persistenceKey="ecommerce-onboarding"
      storageType="localStorage"
    >
      <div>
        <input data-tour="search" type="text" placeholder="Search..." />
        <button data-tour="cart">Cart</button>
        <div data-tour="profile">Profile</div>
        
        <GuideTooltip
          // ... standard props
          showDontShowAnymore={true}
          dontShowAnymoreText={
            <button 
              onClick={() => {
                // Custom analytics tracking
                analytics.track('onboarding_skipped');
                useGuideContext().dontShowAnymore();
              }}
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                color: 'white',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              ⏭️ Skip onboarding
            </button>
          }
          dontShowAnymorePosition="center"
        />
      </div>
    </GuideProvider>
  );
};
```

### Dashboard Tour with Custom Content and Dismissal

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

const DashboardApp = () => {
  const { isDismissed } = useGuideContext();
  
  return (
    <GuideProvider 
      options={{ steps: dashboardSteps }}
      persistenceKey="dashboard-tour"
      storageType="sessionStorage" // Only for current session
    >
      <div>
        <div data-tour="metrics">Metrics Dashboard</div>
        
        {!isDismissed && (
          <div className="tour-hint">
            💡 New to the dashboard? Take a quick tour!
          </div>
        )}
        
        <GuideTooltip
          // ... props
          showDontShowAnymore={true}
          dontShowAnymoreText={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    useGuideContext().dontShowAnymore();
                  }
                }}
                style={{ transform: 'scale(0.8)' }}
              />
              <span style={{ fontSize: '10px' }}>Hide for session</span>
            </div>
          }
        />
      </div>
    </GuideProvider>
  );
};
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

### v1.0.6
- **New Feature**: Added "Don't show anymore" functionality with persistent dismissal
- Added `isDismissed` state to track guide dismissal status
- Added `dontShowAnymore()` method to permanently dismiss guides
- Added `persistenceKey` and `storageType` props to `GuideProvider`
- Added dismissal-related props to `GuideTooltip` component
- Added `onDismiss` callback to `GuideOptions`
- Enhanced user experience with smart dismissal prevention
- Improved documentation with dismissal examples

### v1.0.5
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