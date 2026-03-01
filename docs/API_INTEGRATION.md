# API Integration Guide

This app ships with mock data in `src/data/mock.ts`. Replace those mocks by integrating real endpoints.

**Suggested Endpoints**
- Auth: login, signup, token refresh
- Feed: list posts, like, comment, share
- Stories: list stories, upload story
- Explore: list places, place details, save place
- Communities: list communities, join, leave, posts
- Guides: list guides, details, booking
- Chat: message history, AI responses, suggestions
- Profile: user profile, stats, saved places

Add API clients in `src/utils` and wire them into screens and Redux slices.
