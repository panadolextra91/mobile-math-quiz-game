# Frontend Project Structure

This document describes the project structure following React Native best practices.

## Directory Structure

```
frontend/
├── app/                      # Expo Router routes (file-based routing)
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Home screen
│
├── src/                      # Source code
│   ├── components/          # Reusable UI components
│   │   └── index.ts        # Component exports
│   │
│   ├── screens/            # Screen components (if needed)
│   │
│   ├── services/           # API services and external integrations
│   │   └── api.ts         # API configuration
│   │
│   ├── store/             # State management (Zustand)
│   │   └── index.ts       # Store exports
│   │
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Type exports
│   │
│   ├── utils/             # Utility functions and helpers
│   │   └── index.ts       # Utility exports
│   │
│   ├── constants/         # App constants
│   │   ├── fonts.ts       # Font definitions
│   │   └── theme.ts       # Theme constants
│   │
│   └── hooks/             # Custom React hooks
│       ├── use-color-scheme.ts
│       └── use-theme-color.ts
│
├── assets/                 # Static assets
│   ├── fonts/             # Custom fonts
│   ├── images/            # Images and sprites
│   └── sounds/            # Audio files
│
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
└── eas.json                # EAS build configuration
```

## Path Aliases

The following path aliases are configured in `tsconfig.json`:

- `@/*` - Root directory
- `@/src/*` - Source directory
- `@/components/*` - Components directory
- `@/services/*` - Services directory
- `@/store/*` - Store directory
- `@/types/*` - Types directory
- `@/utils/*` - Utils directory
- `@/constants/*` - Constants directory
- `@/hooks/*` - Hooks directory

## Usage Examples

### Importing Components
```typescript
import { Button } from '@/components';
// or
import { Button } from '@/components/Button';
```

### Importing Services
```typescript
import { api } from '@/services/api';
```

### Importing Types
```typescript
import { GameSession } from '@/types';
```

### Importing Constants
```typescript
import { Fonts } from '@/constants/fonts';
```

### Importing Utils
```typescript
import { formatScore } from '@/utils';
```

### Importing Hooks
```typescript
import { useGameState } from '@/hooks';
```

## Best Practices

1. **Components**: Keep components small, focused, and reusable
2. **Services**: Centralize API calls and external integrations
3. **Store**: Use Zustand for global state management
4. **Types**: Define all TypeScript types in `src/types/`
5. **Utils**: Keep utility functions pure and testable
6. **Constants**: Store all constants (fonts, colors, sizes) in `src/constants/`
7. **Hooks**: Create custom hooks for reusable logic

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `GameScreen.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useGameState.ts`)
- **Utils**: camelCase (e.g., `formatScore.ts`)
- **Types**: camelCase (e.g., `gameTypes.ts`)
- **Constants**: camelCase (e.g., `fonts.ts`, `theme.ts`)

## Expo Router Notes

- The `app/` directory must remain at the root level for Expo Router to work
- File-based routing: files in `app/` become routes
- Use `_layout.tsx` for nested layouts
- Use `(group)` for route groups without affecting URL structure

