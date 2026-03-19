# WanderMate Mobile App - UI/UX Design Document

## Design Philosophy
**Modern • Minimalist • Adventure-Driven • User-Centric**

This design reimagines WanderMate as a premium travel companion app with a fresh, contemporary aesthetic that prioritizes user experience, visual hierarchy, and seamless navigation.

---

## Color Palette

### Primary Colors
```
Primary Green:     #10B981 (emerald-500) - Trust, Adventure, Go
Accent Coral:      #F97316 (orange-500) - Energy, Excitement
Deep Blue:         #0EA5E9 (sky-500) - Calm, Reliability
```

### Secondary Colors
```
Dark Slate:        #1E293B (slate-800) - Primary Text
Medium Gray:       #64748B (slate-500) - Secondary Text
Light Gray:        #F1F5F9 (slate-100) - Backgrounds
Pure White:        #FFFFFF - Cards, Surfaces
```

### Gradient Accents
```
Sunrise:           Linear gradient(135deg, #F97316 0%, #FBBF24 100%)
Ocean:             Linear gradient(135deg, #0EA5E9 0%, #10B981 100%)
Twilight:          Linear gradient(135deg, #8B5CF6 0%, #EC4899 100%)
```

---

## Typography

### Font Family
- **Primary Font**: Inter (System Default: -apple-system, SF Pro Display)
- **Headings**: Bold 600-800 weights
- **Body**: Regular 400-500 weights
- **Accent**: Medium 500 weight

### Type Scale
```
Display Large:     32px / Bold 700
Heading 1:         24px / Bold 700
Heading 2:         20px / Semibold 600
Heading 3:         18px / Semibold 600
Body Large:        16px / Medium 500
Body Regular:      14px / Regular 400
Caption:           12px / Regular 400
Small:             11px / Regular 400
```

---

## Spacing System
Based on 4px grid system for consistency
```
XXS: 4px
XS:  8px
SM:  12px
MD:  16px
LG:  24px
XL:  32px
XXL: 48px
```

---

## Border Radius
```
Small:             8px  (buttons, tags)
Medium:            12px (cards, inputs)
Large:             16px (modals, sheets)
XLarge:            24px (hero cards)
Full:              9999px (avatars, pills)
```

---

## Shadows & Elevation
```
Level 1:           0 1px 2px rgba(0, 0, 0, 0.05)
Level 2:           0 4px 6px rgba(0, 0, 0, 0.07)
Level 3:           0 10px 15px rgba(0, 0, 0, 0.1)
Level 4:           0 20px 25px rgba(0, 0, 0, 0.15)
```

---

## Navigation Architecture

### Bottom Tab Navigation (Primary)
5-tab navigation with smooth transitions and haptic feedback

```
┌─────────────────────────────────────┐
│                                     │
│         Content Area                │
│                                     │
├─────────────────────────────────────┤
│  🏠    🗺️    ➕    💬    👤        │
│ Home  Explore Add  Chat Profile    │
└─────────────────────────────────────┘
```

**Tab Details:**
1. **Home** - Feed, Stories, Updates
2. **Explore** - AR/VR Places, Hidden Spots Discovery
3. **Add** (Center, elevated) - Quick actions menu
4. **Chat** - AI Travel Bot
5. **Profile** - User Profile & Settings

---

## Screen Designs

### 1. SPLASH SCREEN (Loading)
**Purpose:** Brand introduction with smooth animation

**Layout:**
- Full-screen gradient background (Ocean gradient)
- Animated WanderMate logo (pulse + fade in)
- Progress indicator at bottom
- Tagline: "Your Journey Begins"

**Animations:**
- Logo scales from 0.8 to 1.0 with spring animation
- Gradient shifts subtly
- Duration: 2-3 seconds

**Tech:** Lottie animation for logo

---

### 2. ONBOARDING SCREENS (3 Slides)
**Purpose:** Introduce key features with swipeable cards

**Slide 1: Discover**
- Hero illustration: 3D map with pins
- Headline: "Discover Hidden Gems"
- Subtitle: "Explore secret spots locals love"
- Image: Animated map markers dropping

**Slide 2: Plan**
- Hero illustration: AI chatbot on phone
- Headline: "AI-Powered Itineraries"
- Subtitle: "Get personalized travel plans instantly"
- Image: Chat bubbles animating

**Slide 3: Connect**
- Hero illustration: Community circle
- Headline: "Join Travel Communities"
- Subtitle: "Share experiences, make friends"
- Image: Avatar grid with connections

**Navigation:**
- Dot indicators at bottom
- "Skip" button (top-right)
- "Next" / "Get Started" button (bottom)
- Swipe gestures enabled

---

### 3. AUTHENTICATION SCREEN
**Purpose:** Unified login/signup with modern UI

**Layout:**

```
┌─────────────────────────────────────┐
│                                     │
│     [Animated Gradient Header]      │
│           ✈️ WanderMate             │
│      "Adventure Awaits"             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│   [Segmented Control]               │
│   [ Login  |  Sign Up ]             │
│                                     │
│   📧 Email Input                    │
│   ┌───────────────────────────┐    │
│   │ email@example.com         │    │
│   └───────────────────────────┘    │
│                                     │
│   🔒 Password Input                 │
│   ┌───────────────────────────┐    │
│   │ ••••••••••                │ 👁  │
│   └───────────────────────────┘    │
│                                     │
│   [Remember Me] [Forgot Password?]  │
│                                     │
│   ┌───────────────────────────┐    │
│   │      Continue  →           │    │
│   │   (Gradient Button)        │    │
│   └───────────────────────────┘    │
│                                     │
│   ──────────  OR  ──────────       │
│                                     │
│   [ 🔵 Continue with Google   ]    │
│   [ 📘 Continue with Facebook ]    │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Smooth segmented control toggle
- Real-time validation with inline errors
- Password strength indicator (signup)
- Biometric login option (Face ID/Fingerprint)
- Social login buttons with brand colors

**Animations:**
- Input fields slide up when focused
- Error shake animation
- Success checkmark animation

---

### 4. HOME SCREEN (Feed)
**Purpose:** Social feed + Stories + Quick actions

**Layout:**

```
┌─────────────────────────────────────┐
│  ✈️ WanderMate        🔔  ⚙️       │ ← Header
├─────────────────────────────────────┤
│  [ Story Circles - Horizontal ]     │ ← Stories
│  (Your Story) (Travel) (Friends)    │
├─────────────────────────────────────┤
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║ 🖼️ [Large Post Image]         ║ │ ← Post Card
│  ║                               ║ │
│  ╠═══════════════════════════════╣ │
│  ║ 👤 Sarah Thompson             ║ │
│  ║    📍 Santorini, Greece       ║ │
│  ║                               ║ │
│  ║ "Watching the sunset over..." ║ │
│  ║                               ║ │
│  ║ ❤️ 234  💬 45  📤 Share       ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║ [Next Post]                   ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
└─────────────────────────────────────┘
```

**Components:**

**Story Bar:**
- Horizontal scrollable circles
- Gradient ring for unseen stories
- Gray ring for seen stories
- "+" button for adding your story
- Animated ring on tap

**Post Card:**
- Borderless card with subtle shadow
- High-res image (16:9 ratio)
- User avatar overlapping image (32dp)
- Location tag with pin icon
- Caption with "Read more" expansion
- Action buttons: Like, Comment, Share, Bookmark
- Double-tap to like animation (heart burst)

**Quick Action FAB (Floating):**
- Orange gradient circle button
- Positioned bottom-right
- Expands to show: Create Post, Add Spot, Plan Trip

---

### 5. EXPLORE SCREEN (AR/VR + Discovery)
**Purpose:** Interactive map with 3D places and hidden spots

**Layout:**

```
┌─────────────────────────────────────┐
│  🔍 Search destinations...    🎚️   │ ← Search bar
├─────────────────────────────────────┤
│  [ All  Categories  Nearby  Saved ] │ ← Filter chips
├─────────────────────────────────────┤
│                                     │
│        [3D Map View]                │ ← Interactive Map
│     📍  📍  📍  📍                  │
│   🗺️  Famous    Hidden             │
│       Spots     Gems                │
│                                     │
├─────────────────────────────────────┤
│  ╔════════════════════════╗         │ ← Bottom Sheet
│  ║ 🏛️ Taj Mahal           ║ (Draggable)
│  ║ ⭐⭐⭐⭐⭐ 4.8 (12k)      ║
│  ║ 📍 Agra, India         ║
│  ║                        ║
│  ║ [View in AR] [Details] ║
│  ╚════════════════════════╝
└─────────────────────────────────────┘
```

**Features:**

**Map View:**
- Google Maps 3D integration
- Animated markers with custom icons
- Cluster markers for multiple spots
- Tilt & rotate gestures enabled
- Night mode map style

**Marker Types:**
- 🏛️ Famous Landmarks (Blue markers)
- 💎 Hidden Gems (Orange markers)
- 👥 Community Spots (Green markers)
- ⭐ Saved Places (Star badge)

**Bottom Sheet:**
- Draggable with spring animation
- Carousel of place images
- Quick stats: Rating, Reviews, Distance
- Action buttons: AR View, Navigation, Save
- "View Details" expands to full screen

**AR Button:**
- Opens camera overlay
- Places 3D model of landmark
- Info cards float in AR space
- Distance and direction indicators

---

### 6. ADD SCREEN (Center Action Hub)
**Purpose:** Quick access to creation actions

**Layout:** Modal with blur background

```
┌─────────────────────────────────────┐
│        [Blur Background]            │
│                                     │
│     ╔═══════════════════════╗      │
│     ║                       ║      │
│     ║  📸 Create Post       ║  ←   │
│     ║  ───────────────────  ║      │
│     ║  💎 Add Hidden Spot   ║  ←   │
│     ║  ───────────────────  ║      │
│     ║  🗺️ Plan New Trip     ║  ←   │
│     ║  ───────────────────  ║      │
│     ║  📷 Upload Story      ║  ←   │
│     ║                       ║      │
│     ║     [Cancel]          ║      │
│     ╚═══════════════════════╝      │
│                                     │
└─────────────────────────────────────┘
```

**Interactions:**
- Slides up from bottom with spring
- Blur background (iOS style)
- Each option has icon + label
- Haptic feedback on tap
- Dismisses on cancel or selection

---

### 7. CHAT SCREEN (AI Travel Bot)
**Purpose:** Conversational trip planning with AI

**Layout:**

```
┌─────────────────────────────────────┐
│  ← TravelBot AI           📋  ⚙️   │ ← Header
├─────────────────────────────────────┤
│                                     │
│  ╭─────────────────────────╮       │ ← Bot Message
│  │ 👋 Hi! Where would you  │       │ (White bubble)
│  │ like to travel?         │       │
│  ╰─────────────────────────╯       │
│                                     │
│         ╭─────────────────────────╮ │ ← User Message
│         │ I want to visit Bali    │ │ (Green bubble)
│         │ for 5 days              │ │
│         ╰─────────────────────────╯ │
│                                     │
│  ╭─────────────────────────╮       │
│  │ 🎉 Great choice! Let me │       │
│  │ create an itinerary...  │       │
│  ╰─────────────────────────╯       │
│                                     │
│  ╔═══════════════════════════════╗ │ ← Itinerary Card
│  ║ 📅 5-Day Bali Itinerary       ║ │
│  ║ ───────────────────────────   ║ │
│  ║ Day 1: Ubud Rice Terraces     ║ │
│  ║ Day 2: Temple Tour...         ║ │
│  ║                               ║ │
│  ║ [View Full Plan] [Save]       ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────┐  [Send]  │ ← Input
│  │ Ask me anything...  │   🎤     │
│  └─────────────────────┘           │
└─────────────────────────────────────┘
```

**Features:**

**Message Bubbles:**
- Bot: Light gray, left-aligned, profile avatar
- User: Green gradient, right-aligned
- Timestamp below (subtle)
- Typing indicator (3 animated dots)

**Rich Cards:**
- Itinerary cards with expandable sections
- Weather cards (icons + forecast)
- Place cards (images + quick info)
- Price comparison cards (flights/hotels)
- Swipeable carousel for multiple options

**Smart Suggestions:**
- Quick reply chips above input
- "Popular destinations"
- "Plan weekend trip"
- "Find cheap flights"

**Input Features:**
- Voice input button
- Image upload (for visual search)
- Auto-suggestions as you type

**Animations:**
- Messages slide in with fade
- Cards expand smoothly
- Typing indicator pulses

---

### 8. PROFILE SCREEN
**Purpose:** User identity, stats, settings, and content

**Layout:**

```
┌─────────────────────────────────────┐
│              [Cover Photo]          │ ← Cover Image
│           (Gradient Overlay)        │
│                                     │
│         👤 (Profile Avatar)         │ ← Overlapping
│            Sarah Thompson           │
│         @sarahwanders ✓             │
│       📍 New York, USA              │
├─────────────────────────────────────┤
│  "Exploring the world one city at"  │ ← Bio
│  "a time 🌍✈️"                      │
├─────────────────────────────────────┤
│  ╔════╗  ╔════╗  ╔════╗  ╔════╗   │ ← Stats
│  ║ 42 ║  ║ 156║  ║ 23 ║  ║ 8  ║   │
│  ║Trip║  ║Post║  ║Spot║  ║Bdg ║   │
│  ╚════╝  ╚════╝  ╚════╝  ╚════╝   │
├─────────────────────────────────────┤
│  [ Edit Profile ] [ Share Profile ] │ ← Actions
├─────────────────────────────────────┤
│  [ 📷 Posts  |  💎 Spots  | ⭐ Saved ] │ ← Tabs
├─────────────────────────────────────┤
│  ╔═══╗  ╔═══╗  ╔═══╗              │ ← Grid View
│  ║ 🖼️ ║  ║ 🖼️ ║  ║ 🖼️ ║              │
│  ╚═══╝  ╚═══╝  ╚═══╝              │
│  ╔═══╗  ╔═══╗  ╔═══╗              │
│  ║ 🖼️ ║  ║ 🖼️ ║  ║ 🖼️ ║              │
│  ╚═══╝  ╚═══╝  ╚═══╝              │
└─────────────────────────────────────┘
```

**Components:**

**Header Section:**
- Cover photo (16:9, customizable)
- Avatar (120dp, centered, white border)
- Name (bold, 20px)
- Username (gray, @handle)
- Verification badge for guides
- Location with pin icon
- Edit cover button (top-right)

**Bio:**
- 2-line bio with emoji support
- "Read more" for longer bios

**Stats Grid:**
- 4 cards: Trips, Posts, Spots, Badges
- Tap to view details
- Animated counters on load

**Action Buttons:**
- Edit Profile (own profile)
- Share Profile (QR code + link)
- Follow/Message (others' profiles)

**Content Tabs:**
- Posts: Instagram-style grid
- Spots: Map + list view toggle
- Saved: Collections with covers

**Settings Access:**
- Gear icon in header
- Slide-in menu with options

---

### 9. COMMUNITY SCREEN
**Purpose:** Discover and join travel communities

**Layout:**

```
┌─────────────────────────────────────┐
│  Communities           🔍  ➕       │ ← Header
├─────────────────────────────────────┤
│  [ Joined  |  Suggested  |  All ]   │ ← Tabs
├─────────────────────────────────────┤
│  ╔═══════════════════════════════╗ │
│  ║ 🏔️ [Cover Image]              ║ │ ← Community
│  ║                               ║ │   Card
│  ║ Mountain Hikers               ║ │
│  ║ 12.5k members • 45 online     ║ │
│  ║                               ║ │
│  ║ "For those who love peaks..." ║ │
│  ║                               ║ │
│  ║ [👥👥👥] [Join Community →]   ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║ 🏖️ Beach Lovers                ║ │
│  ║ 8.2k members • 32 online      ║ │
│  ║ [Joined ✓] [View Posts]      ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
└─────────────────────────────────────┘
```

**Features:**

**Community Card:**
- Cover image (hero shot of theme)
- Community icon/logo overlay
- Name (bold)
- Member count + online status
- Short description
- Preview of 3 member avatars
- Join/Joined button (green/gray)

**Joined Communities:**
- Quick access to posts
- Notification badges
- Pin favorites to top

**Suggested:**
- Algorithm-based on interests
- "Dismiss" option on cards

**Search:**
- Filter by category
- Search by name/location
- Popular tags

---

### 10. HIDDEN SPOT SUBMISSION SCREEN
**Purpose:** Multi-step form to submit new hidden spots

**Layout:** (Step indicator at top)

```
┌─────────────────────────────────────┐
│  ← Add Hidden Spot          [1/4]   │
├─────────────────────────────────────┤
│                                     │
│  Step 1: Location                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│                                     │
│  📍 Pin Location on Map             │
│  ┌───────────────────────────────┐ │
│  │      [Interactive Map]        │ │
│  │          📍 (Draggable)       │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  OR                                 │
│                                     │
│  📌 Use Current Location            │
│  ┌───────────────────────────────┐ │
│  │  Lat: 12.9716                 │ │
│  │  Lng: 77.5946                 │ │
│  └───────────────────────────────┘ │
│                                     │
│                                     │
│         [Next: Details →]           │
│                                     │
└─────────────────────────────────────┘
```

**Step Flow:**

**Step 1: Location**
- Interactive map with draggable pin
- "Use Current Location" button
- Auto-detect address from coordinates
- Validation for valid coordinates

**Step 2: Details**
- Spot name (required)
- Category picker (Nature, Food, Culture, etc.)
- Description (multiline, 500 char)
- Accessibility info (wheelchair, trail difficulty)
- Best time to visit

**Step 3: Media**
- Photo upload (up to 5 images)
- Drag to reorder
- Set cover photo
- Optional video upload

**Step 4: Review & Submit**
- Preview card of submission
- Edit any section
- Terms checkbox
- Submit button (with loading state)

**Design Elements:**
- Progress indicator: 4 dots at top
- Clean, spacious forms
- Inline validation
- Smooth page transitions (slide left/right)
- Draft auto-save

---

### 11. LOCAL GUIDE DIRECTORY
**Purpose:** Find and contact local travel guides

**Layout:**

```
┌─────────────────────────────────────┐
│  Local Guides        📍 Bangalore   │
├─────────────────────────────────────┤
│  🔍 Search guides, languages...     │
├─────────────────────────────────────┤
│  [ All  |  Top Rated  |  Nearby ]   │
├─────────────────────────────────────┤
│  Filter: Languages • Specialties    │
├─────────────────────────────────────┤
│  ╔═══════════════════════════════╗ │
│  ║ 👤   Rajesh Kumar         📱  ║ │ ← Guide Card
│  ║                               ║ │
│  ║ ⭐⭐⭐⭐⭐ 4.9 (127 reviews)    ║ │
│  ║ 📍 Bangalore | 🗣️ EN, HI, KA  ║ │
│  ║ 💼 8 years experience         ║ │
│  ║                               ║ │
│  ║ Specialties:                  ║ │
│  ║ [Heritage] [Food Tours]       ║ │
│  ║                               ║ │
│  ║ ₹1,500/day                    ║ │
│  ║                               ║ │
│  ║ [📞 Call] [💬 Message] [View] ║ │
│  ╚═══════════════════════════════╝ │
│                                     │
└─────────────────────────────────────┘
```

**Guide Card Features:**
- Profile photo (verified badge)
- Name + rating
- Location + languages (flags)
- Experience years
- Specialty tags (chips)
- Pricing (per day/trip)
- Quick action buttons
- "View Profile" for full details

**Filter Options:**
- Language selection
- Price range slider
- Specialty categories
- Availability calendar

**Detail Screen:**
- Full bio
- Portfolio photos
- Review section
- Booking calendar
- Direct contact options

---

### 12. SETTINGS SCREEN
**Purpose:** App configuration and account management

**Layout:**

```
┌─────────────────────────────────────┐
│  ← Settings                         │
├─────────────────────────────────────┤
│                                     │
│  Account                            │
│  ────────────────────────────      │
│  👤 Edit Profile              →    │
│  🔒 Privacy & Security        →    │
│  🔔 Notifications             →    │
│  💳 Payment Methods           →    │
│                                     │
│  Preferences                        │
│  ────────────────────────────      │
│  🌍 Language             English →  │
│  🌙 Dark Mode              [Toggle]│
│  📏 Units                  Metric → │
│  🗺️ Default Map Style      Dark →  │
│                                     │
│  About                              │
│  ────────────────────────────      │
│  ℹ️ Help & Support            →    │
│  📄 Terms of Service          →    │
│  🔐 Privacy Policy            →    │
│  ℹ️ App Version          v2.1.0    │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      🚪 Logout                │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Sections:**
- Account management
- Preferences (with live preview)
- About & legal
- Logout (confirmation dialog)

---

## Component Library

### Buttons

**Primary Button:**
```
Background: Linear gradient (Green to Teal)
Height: 48dp
Radius: 12dp
Text: White, 16px, Semibold
Shadow: Level 2
States: Default, Pressed (scale 0.95), Disabled (opacity 0.5)
```

**Secondary Button:**
```
Background: Transparent
Border: 2px solid Primary Green
Height: 48dp
Radius: 12dp
Text: Primary Green, 16px, Semibold
States: Default, Pressed (bg: light green)
```

**Icon Button:**
```
Size: 40dp circle
Background: White
Icon: 20dp, Slate-600
Shadow: Level 1
Ripple: Circular
```

### Input Fields

**Text Input:**
```
Height: 56dp
Background: Slate-100
Border: None (focus: 2px Primary Green)
Radius: 12dp
Padding: 16dp horizontal
Label: Floating (12px above when focused)
Error: Red text below + red border
```

**Search Bar:**
```
Height: 48dp
Background: White
Icon: Search (left), Clear (right)
Radius: 24dp (full pill)
Shadow: Level 1
Placeholder: "Search..."
```

### Cards

**Standard Card:**
```
Background: White
Radius: 12dp
Shadow: Level 2
Padding: 16dp
Hover: Lift (translateY: -2dp, shadow: Level 3)
```

**Image Card:**
```
Image: Full-width, 16:9 ratio
Gradient Overlay: Bottom (for text)
Info: Absolute positioned over image
Radius: 16dp
```

### Chips (Tags)

**Filter Chip:**
```
Height: 32dp
Padding: 12dp horizontal
Radius: 16dp (pill)
Background: Slate-100 (active: Primary Green)
Text: Slate-700 (active: White)
Icon: Optional (leading)
```

### Avatars

**Sizes:**
```
Small: 32dp
Medium: 48dp
Large: 80dp
XLarge: 120dp
```

**Features:**
- Circular
- Border: 2dp white (on images)
- Placeholder: Initials on colored bg
- Online indicator: Green dot (bottom-right)

### Bottom Sheets

**Standard:**
```
Background: White
Radius: 24dp (top corners)
Handle: Gray pill (centered, 32×4dp)
Max Height: 85% viewport
Snap Points: [25%, 50%, 85%]
Backdrop: Black, 0.4 opacity
```

### Modals

**Center Modal:**
```
Background: White
Radius: 16dp
Padding: 24dp
Max Width: 90% viewport
Shadow: Level 4
Backdrop: Blur + dark overlay
```

---

## Animations & Interactions

### Page Transitions
- Stack Navigation: Slide from right (iOS-style)
- Tab Navigation: Fade + slight scale
- Modal: Slide up from bottom
- Duration: 300ms (easing: ease-out)

### Micro-interactions
- Button Press: Scale to 0.95
- Like Animation: Heart burst particles
- Pull to Refresh: Custom lottie loader
- Skeleton Loading: Shimmer effect
- Success: Checkmark with scale bounce

### Gestures
- Swipe to Delete: Red background reveal
- Long Press: Context menu with haptic
- Pinch to Zoom: On images
- Pan to Dismiss: On modals

---

## Responsive Breakpoints

**Phone (Default):**
- Width: 320-428dp
- Single column layout
- Bottom navigation

**Tablet:**
- Width: 768dp+
- Two-column layout where applicable
- Side navigation drawer

**Landscape:**
- Adjust heights for horizontal space
- Side-by-side content

---

## Accessibility

### Standards
- WCAG 2.1 Level AA compliance
- Color contrast ratio: 4.5:1 minimum
- Touch targets: 44×44dp minimum
- Screen reader support (labels on all icons)
- Keyboard navigation support

### Features
- Font scaling support (up to 200%)
- High contrast mode
- Reduce motion setting
- Voice control compatible
- Alternative text for images

---

## Dark Mode Palette

**Background:**
```
Primary BG: #0F172A (slate-900)
Secondary BG: #1E293B (slate-800)
Card BG: #334155 (slate-700)
```

**Text:**
```
Primary: #F1F5F9 (slate-100)
Secondary: #94A3B8 (slate-400)
```

**Accents:**
- Same green/orange/blue (adjusted brightness)
- Softer shadows (lower opacity)

---

## Performance Considerations

### Image Optimization
- WebP format preferred
- Lazy loading for feed images
- Thumbnail + full-size strategy
- Caching for frequently accessed images

### Network Efficiency
- Paginated lists (20 items per page)
- Debounced search (300ms delay)
- Offline-first approach (AsyncStorage)
- Background refresh for feed

### Animations
- Use native driver where possible
- 60fps target for all animations
- Reduce motion for accessibility

---

## Platform-Specific Considerations

### iOS
- Use SF Symbols where applicable
- Haptic feedback on key actions
- Pull-to-refresh native behavior
- Swipe back gesture on navigation

### Android
- Material Design ripple effects
- FloatingActionButton for primary actions
- System back button support
- Bottom sheet peek behaviors

---

## Implementation Notes

### Tech Stack (Aligned with Design.md)
- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **UI Components:** React Native Paper + Custom components
- **State:** Redux Toolkit
- **Styling:** Styled Components or StyleSheet
- **Animations:** React Native Reanimated 2
- **Icons:** React Native Vector Icons (Feather/Ionicons)
- **Maps:** react-native-maps
- **Images:** Expo Image (with caching)

### Development Approach
1. Start with `expo init` (managed workflow)
2. Set up navigation structure first
3. Build component library (atoms → molecules → organisms)
4. Implement screens progressively
5. Test responsiveness with Expo Go (no emulator needed)
6. Use expo start for web/mobile preview

### Folder Structure
```
src/
├── components/
│   ├── atoms/        (Button, Input, Avatar)
│   ├── molecules/    (Card, SearchBar)
│   └── organisms/    (PostCard, CommunityCard)
├── screens/
│   ├── auth/
│   ├── home/
│   ├── explore/
│   └── profile/
├── navigation/
├── redux/
├── utils/
├── assets/
└── theme/
    ├── colors.js
    ├── typography.js
    └── spacing.js
```

---

## Next Steps

1. **Review & Approve Design:** Ensure alignment with vision
2. **Create Component Library:** Build reusable UI components
3. **Implement Navigation:** Set up React Navigation structure
4. **Develop Screens:** One screen at a time, starting with Auth
5. **Integrate APIs:** Connect backend endpoints
6. **Test Responsiveness:** Use Expo Go on multiple devices
7. **Polish & Animate:** Add micro-interactions
8. **Accessibility Audit:** Ensure inclusive design
9. **Performance Optimization:** Measure and improve
10. **Launch:** Deploy to TestFlight/Play Store Beta

---

## Design Deliverables

When implementing, create:
1. Theme configuration file (colors, spacing, typography)
2. Component library (Storybook-style documentation)
3. Navigation flow diagram
4. API integration documentation
5. Responsive behavior guide
6. Animation specifications
7. Asset export (icons, images, logos)

---

**End of Design Document**

*This design prioritizes modern aesthetics, intuitive UX, and seamless performance for a mobile-first travel companion experience.*
