# 🧭 Budget Compass Brand Guide

## Brand Identity

**Brand Name:** Budget Compass  
**Tagline:** Navigate Your Family's Finances

## Logo Concept
The logo combines a stylized compass rose with a house silhouette, symbolizing direction ("compass") and the family ("house"). The needle points upwards, representing progress in managing finances. A small family icon is subtly integrated into the house element, with a heart accent on top representing love and care for family finances.

## Color Palette

### Primary Colors
- **Teal (Compass):** `oklch(0.55 0.15 180)` - A color that evokes a sense of calm, trust, and stability
- **Light Blue (Compass):** `oklch(0.85 0.08 220)` - Represents clarity and logic  
- **Muted Orange/Yellow (House & Accents):** `oklch(0.75 0.12 60)` - A warm and friendly color that signifies the home and family

### Dark Mode Colors
- **Teal (Primary):** `oklch(0.65 0.15 180)` - Brighter teal for dark mode
- **Light Blue (Secondary):** `oklch(0.3 0.08 220)` - Darker blue for contrast
- **Orange/Yellow (Accent):** `oklch(0.7 0.12 50)` - Warmer orange for dark mode

### Chart Colors
- **Chart 1:** Teal `oklch(0.55 0.15 180)`
- **Chart 2:** Light blue `oklch(0.65 0.12 220)` 
- **Chart 3:** Muted orange `oklch(0.75 0.12 60)`
- **Chart 4:** Darker teal `oklch(0.45 0.18 180)`
- **Chart 5:** Light orange `oklch(0.8 0.08 45)`

## Typography

**Primary Font:** A clean, modern sans-serif font should be used for all branding, including the logo, website, and app. This font is easy to read and conveys a sense of professionalism and simplicity. The project uses Geist Sans as the implementation.

**Tagline Font:** A lighter, smaller version of the primary font is used for the tagline, ensuring it complements the main brand name.

**Logo Typography:** 
- "BUDGET" is slightly bolder than "COMPASS" to emphasize the primary function of the tool
- "BUDGET" is styled with `font-extrabold`
- "COMPASS" is styled with `font-normal`
- Tagline uses smaller text with uppercase tracking

## Brand Voice and Tone

### Voice
Budget Compass should sound like a trusted, friendly, and knowledgeable guide. The language should be clear, simple, and free of financial jargon.

### Tone
The tone should be encouraging and supportive, not judgmental. It should make the user feel empowered and in control of their finances. The brand should be approachable and human, recognizing the unique challenges and goals of families.

## Key Messaging

### Primary Message
"Navigate Your Family's Finances with Confidence"

### Supporting Messages
- "Your trusted financial guide"
- "Clear direction for your financial journey"
- "Simple, friendly guidance that makes budgeting feel empowering"
- "Every dollar counts when you're building your future"

## Implementation Notes

### CSS Variables
The brand colors are implemented as CSS custom properties in `globals.css`:
- `--primary`: Teal compass colors
- `--secondary`: Light blue accents  
- `--accent`: Warm orange/yellow house and family elements

### Logo Component
The `BudgetCompassLogo` component (`/src/components/ui/compass-logo.tsx`) provides:
- Scalable compass logo with house and family elements
- Text logo with proper typography
- Configurable sizes: sm, md, lg, xl
- Optional text display

### Usage Guidelines
- Use the full logo with text for main branding
- Use the compass icon alone for smaller spaces
- Maintain proper contrast ratios for accessibility
- Apply brand voice consistently across all user-facing text
- Use navigation and journey metaphors in messaging
