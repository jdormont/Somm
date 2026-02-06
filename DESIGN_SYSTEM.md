# Somm Design System - Modern Lifestyle Concierge

## Overview
The Somm design system creates a sophisticated, high-end wine bar atmosphere with dark mode as the default. The interface recedes to let the content shine, using subtle glassmorphism and organic, fluid interactions.

## Color Palette

### Background Colors
```css
wine-slate-950: #0f1115  /* Deepest background - main app background */
wine-slate-900: #1a1d23  /* Card background - for elevated surfaces */
```

### Primary Brand Colors
```css
somm-red-900: #2D1B22  /* Deep Burgundy - active states, headers */
somm-red-500: #783543  /* Muted Pinot - primary buttons, desaturated */
```

### Accent Colors
```css
champagne-400: #D4C4A3  /* Gold/Beige - highlights, ratings, best matches */
champagne-100: #F5F0E6  /* Off-white - primary text color */
```

### Functional Colors
```css
vine-green: #4A5D44  /* Organic green - for "Value" badges */
```

### Legacy Colors (Still Available)
The original `wine` and `cream` color ramps remain available for backwards compatibility.

## Typography

### Font Families

#### Serif (Editorial)
- Font: Playfair Display
- Usage: Wine names, "The Verdict," section headers
- Weights: light (300), normal (400), medium (500), semibold (600)
- Implementation: `font-serif`
- Style: Large sizes, lighter weights for elegance

```tsx
<h1 className="font-serif font-light text-4xl text-champagne-100">
  Château Margaux
</h1>
```

#### Sans Serif (Technical)
- Font: Inter
- Usage: Prices, technical data, button text, metadata
- Weights: normal (400), medium (500), semibold (600), bold (700)
- Implementation: `font-sans`
- Style: Relaxed tracking for readability

```tsx
<p className="font-sans tracking-wide text-champagne-100/60">
  Margaux, Bordeaux
</p>
```

### Typography Scale
- **Large Headings**: `text-4xl` to `text-6xl` with `font-light`
- **Wine Names**: `text-3xl` to `text-4xl` with `font-light` or `font-normal`
- **Body Text**: `text-sm` to `text-base` with `tracking-wide`
- **Metadata**: `text-xs` with `tracking-wider` or `tracking-widest`

## UI Patterns

### Cards
Dark backgrounds with glassmorphism:
```tsx
<div className="bg-wine-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10">
  {/* Card content */}
</div>
```

Active/Hovered state:
```tsx
<div className="border-champagne-400/30 shadow-2xl shadow-champagne-400/5">
  {/* Card content */}
</div>
```

### Borders
Extremely thin, subtle borders:
```css
border border-white/10        /* Default state */
border-champagne-400/30       /* Active/hover state */
border-champagne-400/20       /* Accent elements */
```

### Border Radius
Standardize on soft, approachable corners:
```css
rounded-xl    /* Standard cards, buttons */
rounded-2xl   /* Large cards */
rounded-full  /* Pills, badges */
```

### Badges & Pills
```tsx
<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-champagne-400/10 border border-champagne-400/20">
  <Icon className="w-3.5 h-3.5 text-champagne-400" />
  <span className="text-xs font-sans font-medium text-champagne-400 uppercase tracking-wider">
    95% Match
  </span>
</div>
```

## Motion & Animation

### Principles
- Nothing "pops" - everything "flows"
- Use `duration-500` and `ease-out` for smoothness
- Staggered animations for lists (150ms delay per item)

### Hover Transitions
```tsx
<button className="transition-all duration-500 ease-out hover:bg-somm-red-500">
  Button Text
</button>
```

### Fade-In-Up Animation
For recommendations and card reveals:
```tsx
<div
  className="animate-fade-in-up"
  style={{
    animationDelay: `${index * 150}ms`,
    animationFillMode: 'both'
  }}
>
  {/* Content */}
</div>
```

## Components

### RecommendationCard
The flagship component showcasing the design system:

```tsx
import { RecommendationCard } from '@/components/RecommendationCard';

<RecommendationCard
  wine={{
    id: '1',
    name: 'Château Margaux',
    producer: 'Château Margaux',
    region: 'Margaux, Bordeaux',
    vintage: 2015,
    price: 450,
    match_score: 95,
    type: 'Red',
    reasoning: 'This elegant Bordeaux showcases...'
  }}
  index={0}
  onSelect={(wineId) => console.log(wineId)}
/>
```

### Button Styles

#### Primary Button (Elegant)
```tsx
<button className="
  px-6 py-3 rounded-xl
  font-sans text-sm font-medium tracking-wide
  bg-somm-red-900 text-champagne-100
  border border-somm-red-500/30
  hover:bg-somm-red-500 hover:border-champagne-400/50
  transition-all duration-500 ease-out
">
  Select This Wine
</button>
```

#### Secondary Button (Subtle)
```tsx
<button className="
  px-4 py-2 rounded-xl
  font-sans text-sm
  text-champagne-100/60
  border border-white/10
  hover:border-champagne-400/30 hover:text-champagne-100
  transition-all duration-500 ease-out
">
  View Details
</button>
```

## Layout Patterns

### Page Background
```tsx
<div className="min-h-screen bg-wine-slate-950">
  {/* Page content */}
</div>
```

### Section Headers
```tsx
<header className="mb-12 text-center">
  <h1 className="font-serif font-light text-5xl sm:text-6xl text-champagne-100 mb-4">
    Curated for You
  </h1>
  <p className="font-sans text-champagne-100/60 tracking-wide text-lg">
    Hand-selected wines that match your refined palate
  </p>
</header>
```

### Content Containers
```tsx
<div className="max-w-4xl mx-auto px-6 sm:px-8">
  {/* Content */}
</div>
```

## Opacity Scale for Text

- Primary text: `text-champagne-100` (100%)
- Secondary text: `text-champagne-100/80` (80%)
- Tertiary text: `text-champagne-100/60` (60%)
- Muted text: `text-champagne-100/50` (50%)
- Disabled text: `text-champagne-100/40` (40%)

## Glassmorphism Effects

### Light Glass
```css
bg-wine-slate-900/60 backdrop-blur-sm
```

### Medium Glass (Recommended)
```css
bg-wine-slate-900/80 backdrop-blur-md
```

### Heavy Glass
```css
bg-wine-slate-900/90 backdrop-blur-lg
```

## Gradients

### Subtle Accent Overlay
```css
bg-gradient-to-br from-champagne-400/0 via-champagne-400/0 to-champagne-400/5
```

### Button Shimmer Effect
```css
bg-gradient-to-r from-champagne-400/0 via-champagne-400/10 to-champagne-400/0
```

## Accessibility

- Maintain 4.5:1 contrast ratio minimum
- Champagne-100 on wine-slate-950 = 11.2:1 ✓
- Champagne-100/60 on wine-slate-950 = 4.6:1 ✓
- Touch targets minimum 44px height
- Focus states use champagne-400 outline

## Demo & Examples

Visit `/demo` to see the RecommendationCard component in action with sample data.

## Migration Notes

When updating existing components:
1. Replace light backgrounds with `bg-wine-slate-950` or `bg-wine-slate-900/80`
2. Update text colors from stone to champagne variants
3. Replace wine-800 brand colors with somm-red palette
4. Add backdrop-blur to cards for glassmorphism
5. Change font-family to font-serif for headings
6. Update animations to use duration-500 ease-out
7. Soften borders to border-white/10 and border-champagne-400/30

## Best Practices

1. **Let content breathe**: Use generous padding (p-6 to p-8)
2. **Hierarchy through scale**: Use font size differences, not weight
3. **Subtle is sophisticated**: Prefer low opacity over vibrant colors
4. **Fluid over snappy**: Always use ease-out and longer durations
5. **Organic shapes**: No sharp corners, prefer rounded-xl or greater
6. **Dark first**: Design for wine-slate-950 background as default
