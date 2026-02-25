# Account Page API Fix

## Problem
The account page was showing "Failed to fetch" error in production because the API configuration was not properly set up for Vercel deployment.

## Root Cause
- The `apiUrl()` function in `client/src/config/api.ts` was returning empty string when `VITE_API_URL` was not set
- This caused fetch calls like `fetch(apiUrl('/api/llm/models'))` to fail with "Failed to fetch"
- In Vercel, the API is served from the same domain via `/api` routes, so no separate API URL is needed

## Solution Applied
Updated `client/src/config/api.ts` to:
1. Properly handle path normalization (ensure paths start with `/`)
2. Work correctly when `API_BASE_URL` is empty (which is correct for Vercel)

## Vercel Environment Variables
For Vercel deployment, you do NOT need to set `VITE_API_URL` because:
- Frontend and API are on the same domain
- API routes are handled via `/api/*` paths
- The `vercel.json` configuration routes all `/api/*` requests to `api/index.ts`

## Testing
After deploying this fix:
1. Navigate to `/account` page
2. The page should load account data without errors
3. Check browser console - no "Failed to fetch" errors should appear

## Additional Notes
- The Socket.IO URL defaults to `window.location.origin` in production, which is correct for Vercel
- All API calls will be made to the same domain (e.g., `https://devmindx.vercel.app/api/llm/models`)
