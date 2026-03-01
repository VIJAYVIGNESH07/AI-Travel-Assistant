# WanderMate

WanderMate is a premium, AI assisted travel companion app built with React Native and Expo. The implementation follows the UI and UX specification in `UI_UX_Design.md` and includes the complete screen set, navigation, theming system, and mock data needed to iterate quickly.

**What is included**
- Full screen set from the design document.
- Bottom tab navigation with a center Add action modal.
- Theme system with colors, typography, spacing, radius, and shadows.
- Redux Toolkit state for auth, onboarding, and preferences.
- Component library organized into atoms, molecules, and organisms.
- Mock data for feeds, places, communities, guides, and chat.

**Screens**
- Splash
- Onboarding
- Authentication
- Home Feed
- Explore Map
- Add Action Modal
- Chat
- Profile
- Community Directory
- Hidden Spot Submission
- Local Guide Directory
- Settings
- Trip Planner
- Create Post
- Upload Story
- Place Details

**Tech Stack**
- React Native with Expo
- React Navigation
- Redux Toolkit
- React Native Paper
- Reanimated
- Expo Image, Blur, Linear Gradient
- React Native Maps

**Project Structure**
- `App.tsx`
- `src/theme`
- `src/redux`
- `src/navigation`
- `src/components/atoms`
- `src/components/molecules`
- `src/components/organisms`
- `src/screens`
- `src/data`
- `src/utils`
- `docs`
- `assets`

**Quick Start**
1. Install dependencies: `npm install`
2. Start the app: `npm run start`
3. Run on device or simulator: `npm run android` or `npm run ios`

**Configuration Notes**
- Maps: configure Google Maps keys if you target native builds with custom map styles.
- Assets: placeholder icons and splash images are included in `assets`. Replace with production assets.
- Lottie: the Splash screen uses Reanimated; replace the logo with Lottie if you want the exact motion spec.

**User Guide**
1. Launch the app and complete onboarding.
2. Log in or sign up on the Authentication screen.
3. Use the tab bar to access Home, Explore, Chat, and Profile.
4. Use the center Add button to create a post, add a hidden spot, plan a trip, or upload a story.
5. Explore Communities and Local Guides from Home or Profile and manage settings from Profile.

**Development Notes**
- Theme tokens live in `src/theme` and are used across the app.
- Component building blocks are in `src/components`.
- Mock data lives in `src/data/mock.ts`.
- All screens are in `src/screens` and wired in `src/navigation`.

**Docs**
- Component library: `docs/COMPONENT_LIBRARY.md`
- Navigation flow: `docs/NAVIGATION_FLOW.md`
- API integration guide: `docs/API_INTEGRATION.md`
- Responsive behavior: `docs/RESPONSIVE_GUIDE.md`
- Animation specs: `docs/ANIMATIONS.md`
- Asset checklist: `docs/ASSETS.md`

**Scripts**
- `npm run start`
- `npm run android`
- `npm run ios`
- `npm run web`

**License**
All rights reserved.
