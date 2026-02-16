# Style Guide - Visual Design Rules

This document defines the visual design system, UI styling, and UX patterns for the Learning Platform.

---

## Design System

### Color Palette

```css
/* Primary Colors */
--primary-blue: #2E75B6;
--primary-blue-light: #4A90D9;
--primary-blue-dark: #1B5A8E;

/* Accent Colors */
--accent-green: #28A745;
--accent-red: #DC3545;
--accent-yellow: #FFC107;
--accent-purple: #6F42C1;

/* Neutral Colors */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* Semantic Colors */
--success: #28A745;
--error: #DC3545;
--warning: #FFC107;
--info: #17A2B8;

/* Background Colors */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;
--bg-overlay: rgba(0, 0, 0, 0.5);
```

### Typography

```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
--leading-loose: 2;
```

### Spacing Scale

```css
/* Spacing (8px base system) */
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-7: 1.75rem;  /* 28px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Border Radius

```css
--radius-none: 0;
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

### Shadows

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
```

### Transitions

```css
--transition-fast: 150ms ease-in-out;
--transition-normal: 200ms ease-in-out;
--transition-slow: 300ms ease-in-out;
--transition-slower: 500ms ease-in-out;
```

---

## Button Styles

### Primary Button
- Background: primary-blue, white text, padding space-3 space-6, radius-lg, font-semibold, shadow-sm
- Hover: primary-blue-dark, shadow-md, translateY(-1px)
- Active: translateY(0)
- Disabled: gray-300, no shadow

### Secondary Button
- Background gray-100, color gray-900, border gray-300
- Hover: gray-200, border gray-400

### Outline Button
- Transparent bg, color primary-blue, border 2px primary-blue
- Hover: bg primary-blue, color white

### Ghost Button
- Transparent, gray-700, no border
- Hover: gray-100

### Danger Button
- Background error, white text
- Hover: #c82333

### Button Sizes
- btn-sm: space-2 space-4, text-sm
- btn-md: space-3 space-6, text-base
- btn-lg: space-4 space-8, text-lg

---

## Input Styles

- Border 1px gray-300, radius-lg, padding space-3 space-4
- Focus: border primary-blue, box-shadow 0 0 0 3px rgba(46, 117, 182, 0.1)
- Error: border error, focus shadow error tint
- Label: text-sm, font-medium, gray-700, margin-bottom space-2
- Error text: text-sm, color error, margin-top space-2
- Textarea: min-height 120px, resize vertical

---

## Card Styles

- Base: white bg, radius-xl, padding space-6, shadow-sm
- Hoverable: hover shadow-lg, translateY(-2px)
- Elevated: shadow-md
- Flat: no shadow, border 1px gray-200
- Card header: flex, border-bottom gray-200
- Card title: text-xl, font-semibold, gray-900
- Card body: gray-700, leading-relaxed
- Card footer: flex end, gap space-3, border-top gray-200

---

## Badge, Modal, Toast, Loading, Navigation, Empty State, Table, Avatar

See full STYLE.md for complete CSS. Use variables and patterns above consistently.

---

## Responsive Breakpoints

- 640px, 768px, 1024px, 1280px (min-width, mobile first)

---

## Accessibility

- Focus: outline 2px primary-blue, offset 2px
- focus-ring: box-shadow 0 0 0 3px rgba(46, 117, 182, 0.4)
- sr-only: visually hidden, for screen readers

---

**Note**: Use these styles consistently. Prioritize clarity, accessibility, and UX.
