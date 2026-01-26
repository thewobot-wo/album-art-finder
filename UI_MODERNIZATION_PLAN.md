# PlayArt UI/UX Modernization Plan

## Overview
Transform PlayArt from a dated 1990s aesthetic to a modern, polished application that authentically reflects Playbill branding with subtle animations and improved UX.

## User Requirements
1. ✅ Make banner look more like authentic Playbill logo
2. ✅ Add more Playbill yellow throughout UI (not just banner)
3. ✅ Modernize with subtle animations (avoid 1990s look)
4. ✅ Fix blurry iTunes images
5. ✅ Improve result cards (click to download, remove cluttered yellow buttons)

## Implementation Tasks

### Task 1: Fix Blurry iTunes Images (CRITICAL)
**File:** `shared/src/utils.ts`
**Change:** Line 21 - Update `getThumbnailUrl` to return 600x600 instead of 100x100
**Verification:** Search for an album and verify images are crisp, not blurry

### Task 2: Create Authentic Playbill Logo
**File:** `web/public/playart-logo.svg`
**Changes:**
- Remove border
- Update yellow: #FFFF00 → #fceb00
- Increase font size and letter-spacing
- Add tagline
**Verification:** View homepage, logo should have golden yellow, no border, with tagline

### Task 3: Add Playbill Color Palette to Tailwind
**File:** `web/tailwind.config.js`
**Changes:** Add custom Playbill colors (yellow, yellow-glow, yellow-dark)
**Verification:** Colors should be available for use in components

### Task 4: Add Modern Animation System
**File:** `web/app/globals.css`
**Changes:** Add fadeInUp animations, stagger delays, spinner, image optimization
**Verification:** Animations defined and ready for use

### Task 5: Redesign Result Cards with Click-to-Download UX
**File:** `web/app/page.tsx`
**Changes:**
- Remove download buttons
- Make entire card clickable
- Add hover overlay with download icon
- Add entrance animations
- Update to Playbill yellow colors
**Verification:** Cards should be clickable, show overlay on hover, animate in

### Task 6: Update Search UI Elements
**File:** `web/app/page.tsx`
**Changes:**
- Update search button styling
- Update helper buttons (Broadway/Musical)
- Update input focus states
- Improve error messages
**Verification:** All UI elements use Playbill yellow, smooth transitions

## Design Principles
- Authentic Playbill yellow: #fceb00
- Click-to-download UX pattern
- Smooth 300-500ms transitions
- Staggered entrance animations
- GPU-optimized transforms
