---
name: The Sake of Sake
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#564242'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#897172'
  outline-variant: '#ddc0c0'
  surface-tint: '#a43946'
  primary: '#6c0c20'
  on-primary: '#ffffff'
  primary-container: '#8b2635'
  on-primary-container: '#ffa3a9'
  inverse-primary: '#ffb2b6'
  secondary: '#8d4f00'
  on-secondary: '#ffffff'
  secondary-container: '#fda141'
  on-secondary-container: '#6c3b00'
  tertiary: '#36352f'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d4b45'
  on-tertiary-container: '#bfbbb3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b6'
  on-primary-fixed: '#40000d'
  on-primary-fixed-variant: '#842131'
  secondary-fixed: '#ffdcc0'
  secondary-fixed-dim: '#ffb876'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6b3b00'
  tertiary-fixed: '#e7e2d9'
  tertiary-fixed-dim: '#cac6be'
  on-tertiary-fixed: '#1d1c16'
  on-tertiary-fixed-variant: '#494740'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  h1:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-page: 64px
  container-max: 1280px
  stack-xs: 4px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

This design system is built upon a philosophy of quiet luxury and artisanal precision. It evokes the atmosphere of a high-end, dimly lit tasting room where every detail is intentional. The brand personality is authoritative yet welcoming, catering to enthusiasts who value heritage, craftsmanship, and the tactile nature of a well-aged ledger.

The visual style is **Tactile Minimalism**. It combines the clean structure of modern editorial design with physical metaphors—parchment-like surfaces, leather-rich tones, and the subtle interplay of light on glass. The goal is to create an interface that feels less like a digital application and more like a curated companion to a premium spirits collection.

## Colors

The palette is rooted in organic, earthy tones that mirror the ingredients and environments of sake production.

*   **Parchment & Cream:** Used for primary backgrounds to provide a warm, non-glare surface that mimics high-quality paper.
*   **Rich Burgundy:** The primary brand color, used for high-importance interactions and call-to-actions, suggesting depth and premium quality.
*   **Deep Amber:** An accent color reflecting the liquid itself; used for highlights, ratings, and active states.
*   **Charcoal Grey:** The foundational neutral for typography and structural borders, ensuring high legibility without the harshness of pure black.

## Typography

The typography strategy balances traditional authority with modern utility. 

**Noto Serif** is utilized for all headlines to establish an editorial, "spirit-expert" voice. It should be typeset with slightly tighter letter-spacing for large titles to maintain a cohesive, high-end look.

**Work Sans** serves as the functional workhorse. Its neutral, well-spaced characters ensure that technical details—such as alcohol content, tasting notes, and brewing regions—remain legible even at small sizes. Small caps are used for labels and metadata to add a touch of administrative elegance reminiscent of vintage bottle labels.

## Layout & Spacing

This design system employs a **Fixed Grid** model to ensure the interface feels organized and deliberate. Layouts should center on a 12-column grid with generous 24px gutters, providing ample "breathing room" that reflects luxury.

Spacing is based on a strict 8px rhythmic scale. Use large vertical margins (`stack-lg`) between major sections to prevent the UI from feeling cluttered. Content blocks should be grouped with consistent padding to maintain a sense of order and hierarchy.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Subtle Shadows** rather than aggressive elevation. 

*   **Surfaces:** Use slight color shifts (from Cream to a slightly darker Parchment) to define nested content.
*   **Shadows:** Shadows should be long, soft, and extremely low-opacity (2-5%), tinted with the charcoal or burgundy tones to avoid a "dirty" grey look. They should feel like a physical object resting on a table under soft ambient light.
*   **Dividers:** Use thin, 1px lines in Charcoal at 10% opacity. For a more "bound" feel, use a double-line divider for major section breaks.

## Shapes

The shape language is conservative and architectural. A **Soft (0.25rem)** corner radius is the standard for cards and input fields, providing enough warmth to be approachable without losing the professional, "notebook" aesthetic. Buttons may occasionally use a 0px radius for a more "bespoke" or brutalist-luxury feel when paired with serif typography.

## Components

*   **Buttons:** Primary buttons use a Rich Burgundy fill with Cream text. Secondary buttons use a Charcoal border and no fill. Use a subtle "pressed" state that shifts the background color slightly darker.
*   **Cards:** Cards should have a subtle 1px border and the lightest possible shadow. Photography within cards should always use a slight desaturation or warm filter to match the parchment background.
*   **Input Fields:** Fields are underlined or use a very light Charcoal border. Typography inside inputs should be Work Sans for clarity. Use Deep Amber for the focus state.
*   **Chips/Tags:** Small caps Work Sans on a very light Parchment background. These should look like small, pinned labels or tabs in a notebook.
*   **Specialty Component - "The Ledger List":** For displaying bottle lists, use a high-contrast list style with a serif title on the left and a sans-serif price/metadata on the right, connected by a subtle dotted leader line.
*   **Imagery:** All photos should feature high-contrast lighting (chiaroscuro style), highlighting the textures of glass, wood grain, and liquid.
