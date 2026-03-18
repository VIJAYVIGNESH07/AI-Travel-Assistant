# Budget Planner and Local Features Implementation Plan

## Goal
Ship a high-value, no-backend feature set for sale readiness:

1. Budget Planner (fully local)
2. Post/Story UX fixes (no crop flow)
3. Static Stories + Static Feed baseline
4. Local Like/Comment/Share counters (workable and persistent per device)
5. Hidden Spot public section using static bundled data
6. Hidden Spot submission flow kept local only

This plan explicitly avoids backend dependency.

---

## Scope and Constraints

### In Scope
- New Budget Planner screen and local persistence
- Feed/story presentation polish
- Local social interactions (like/comment/share counts)
- Hidden Spot discovery section for all app users (from bundled static JSON)
- Documentation of upgrade path to backend later

### Out of Scope
- Real-time sync across users
- Server-side auth
- Cloud database reads/writes
- Admin moderation backend workflows

### Key Constraint
Without backend, user-generated data cannot be shared to all devices in real time.
Solution for now: ship shared static datasets in app bundle and local device updates.

---

## Feature 1: Budget Planner

## UX Design

### Entry Points
- Home screen: `Budget Planner` quick action
- Trip Planner screen: `Open Budget Planner` action

### Screen Layout
1. Header
- Title: `Budget Planner`
- Subtitle: `Plan smarter before you travel`

2. Inputs Card
- Total Budget (INR)
- Number of Days
- Number of Travelers
- Destination (text)

3. Allocation Card
- Sliders or segmented percentages for:
  - Transport
  - Stay
  - Food
  - Activities
  - Misc
- Live `Total Allocation: 100%` indicator
- `Auto Balance` button

4. Summary Card
- Per-category amount in INR
- Per-day budget
- Per-person per-day budget
- Remaining/Over budget badge

5. Plan Mode
- Budget
- Balanced
- Comfort

6. Actions
- `Save Plan`
- `Reset`

### Visual Style
- Reuse existing card system and typography
- Compact metric tiles for numbers
- Use warning color only for invalid allocations/overspend

## Logic
- Recalculate instantly on every input change
- Validate numeric fields
- Enforce allocation sum = 100%
- Save plans in AsyncStorage

## Local Storage Schema
Key: `budget_plans_json`

```json
[
  {
    "id": "bp-1710000000000",
    "title": "Goa 3 Days",
    "destination": "Goa",
    "totalBudget": 15000,
    "days": 3,
    "travelers": 2,
    "mode": "balanced",
    "allocation": {
      "transport": 25,
      "stay": 35,
      "food": 20,
      "activities": 15,
      "misc": 5
    },
    "createdAt": 1710000000000
  }
]
```

## Files to Create/Update
- `src/screens/BudgetPlannerScreen.tsx` (new)
- `src/utils/budgetStorage.ts` (new)
- `src/navigation/RootNavigator.tsx` (add route)
- `src/navigation/types.ts` (add route type)
- `src/screens/HomeScreen.tsx` and/or `src/screens/TripPlannerScreen.tsx` (entry button)

---

## Feature 2: Post and Story UX Fixes

## Requirements
- Remove crop-style interruption from image selection
- Use clear CTA labels
- Keep local publishing flow smooth

## Behavior Changes
- Set picker to non-crop selection for post/story
- Immediate in-screen preview after selection
- Publish button remains visible and clear

## Files to Update
- `src/screens/CreatePostScreen.tsx`
- `src/screens/UploadStoryScreen.tsx`

---

## Feature 3: Static Story and Static Feed Baseline

## UX Outcome
- App always shows a curated static story strip and static feed posts
- User local posts/stories can appear above static content or in separate "Your uploads" segment

## Data Source
- Keep static baseline in `src/data/mock.ts`
- Merge with local storage content at runtime

## Rendering Rule
- `finalStories = staticStories + localStories`
- `finalPosts = staticPosts + localPosts`

## Files to Update
- `src/screens/HomeScreen.tsx`
- `src/data/mock.ts` (add/clean static entries)

---

## Feature 4: Local Like, Comment, and Share Counters

## UX Design
Each post card shows:
- Like icon + count
- Comment icon + count
- Share icon + count

## Interaction
- Like toggles and updates count
- Comment opens local modal sheet; submit increments count
- Share opens native share sheet and increments count

## Data Model Additions (local)
For each post:
- `likes`
- `comments`
- `shares`
- optional `commentsList: [{ id, text, user, createdAt }]`

## Storage
- Extend posts local schema in AsyncStorage
- Persist counts and comments locally

## Files to Update
- `src/components/organisms/PostCard.tsx`
- `src/screens/HomeScreen.tsx`
- `src/utils/socialStorage.ts`

---

## Feature 5: Hidden Spot Public Section (No Backend)

## UX Design
New section/tab: `Hidden Spots`

Card fields:
- Spot Name
- Location Label
- Applied By (name + handle)
- Category
- Short Description
- Status badge (e.g., Approved)

## Data Source Strategy
- Shared static dataset bundled in app (`mock.ts` or `hiddenSpotsStatic.ts`)
- This makes all users see the same hidden spot list without backend

## Local User Submission Strategy
- User submissions remain local only (their device)
- Show separately under `My Submissions`

## Files to Create/Update
- `src/screens/HiddenSpotListScreen.tsx` (new)
- `src/screens/HiddenSpotDetailsScreen.tsx` (new optional)
- `src/data/mock.ts` or `src/data/hiddenSpotsStatic.ts` (new static list)
- `src/navigation/*` (add route/tab)

---

## Hidden Spot Cross-User Plan (Future Upgrade)

## Current Limitation
No backend means no cross-device sharing of new submissions.

## Upgrade Path
1. Add cloud DB table (Supabase/Firebase)
2. Push submission on create
3. Fetch approved submissions on list screen
4. Add lightweight moderation flags

## Migration Compatibility
Keep UI and model names same now to reduce later migration effort.

---

## Suggested Delivery Sequence

1. Budget Planner screen + storage
2. Post/Story picker UX fix
3. Static feed/story merge
4. Post actions with local counts
5. Hidden Spot public section with static data
6. QA pass (navigation, persistence, edge cases)

---

## Acceptance Criteria

### Budget Planner
- User can input budget and see live per-category calculations
- User can save and reopen plans locally

### Post/Story UX
- No crop interruption
- Selected image appears before publish

### Feed and Stories
- Static stories/posts always visible
- Local posts also visible after publish

### Social Actions
- Like/comment/share counts update and persist locally

### Hidden Spots
- New section visible in app
- Cards show applicant and location from static data
- Works fully without backend

---

## Sale-Ready Demo Script

1. Open Budget Planner -> create and save one plan
2. Go Home -> show static stories + static feed
3. Like/comment/share one post -> close/reopen app -> counts persist
4. Upload one story/post -> appears in local feed
5. Open Hidden Spots -> show public list with applied-by and location

This gives a polished, reliable offline-first demo for project handover.
