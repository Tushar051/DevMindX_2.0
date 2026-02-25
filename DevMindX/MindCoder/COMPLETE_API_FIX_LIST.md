# Complete API URL Fix List

## Files That Need apiUrl() Import and Fix

### ✅ Already Fixed
1. `client/src/pages/research-engine.tsx` - ✅ Fixed
2. `client/src/pages/architecture-generator.tsx` - ✅ Fixed  
3. `client/src/pages/learning-mode.tsx` - ✅ Fixed
4. `client/src/pages/account.tsx` - ✅ Already using apiUrl()

### 🔧 Need to Fix

#### High Priority (Main Features)
5. `client/src/pages/projects.tsx` - `/api/projects`
6. `client/src/pages/generator.tsx` - Multiple endpoints
7. `client/src/pages/generator-enhanced.tsx` - Multiple endpoints
8. `client/src/pages/cursor-ide.tsx` - Multiple endpoints

#### Medium Priority (Alternative/White versions)
9. `client/src/pages/projects-white.tsx` - `/api/projects`
10. `client/src/pages/generator-white.tsx` - `/api/projects/generate`, `/api/preview/create`
11. `client/src/pages/research-white.tsx` - `/api/research/analyze`
12. `client/src/pages/learning-mode-white.tsx` - `/api/learning/analyze`
13. `client/src/pages/architecture-white.tsx` - `/api/architecture/generate`

#### Lower Priority (Auth pages - may work with relative URLs)
14. `client/src/pages/login.tsx` - `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/resend-otp`
15. `client/src/pages/signup.tsx` - `/api/auth/signup`, `/api/auth/verify-otp`, `/api/auth/resend-otp`

#### Other Pages
16. `client/src/pages/generator-simple.tsx` - `/api/projects/generate`, `/api/collab/create`
17. `client/src/pages/generator-new.tsx` - `/api/projects/generate`
18. `client/src/pages/landing.tsx` - `/api/ai/purchase`
19. `client/src/pages/sandbox-test.tsx` - `/api/preview/create`

## Quick Fix Pattern

For each file:

### 1. Add import (if not present)
```typescript
import { apiUrl } from '@/config/api';
```

### 2. Replace fetch calls
```typescript
// Before
fetch('/api/endpoint', ...)

// After  
fetch(apiUrl('/api/endpoint'), ...)
```

## Automated Fix Script

You can use this bash script to fix all files at once:

```bash
#!/bin/bash

# List of files to fix
files=(
  "client/src/pages/projects.tsx"
  "client/src/pages/projects-white.tsx"
  "client/src/pages/generator.tsx"
  "client/src/pages/generator-enhanced.tsx"
  "client/src/pages/generator-white.tsx"
  "client/src/pages/generator-simple.tsx"
  "client/src/pages/generator-new.tsx"
  "client/src/pages/cursor-ide.tsx"
  "client/src/pages/research-white.tsx"
  "client/src/pages/learning-mode-white.tsx"
  "client/src/pages/architecture-white.tsx"
  "client/src/pages/login.tsx"
  "client/src/pages/signup.tsx"
  "client/src/pages/landing.tsx"
  "client/src/pages/sandbox-test.tsx"
)

for file in "${files[@]}"; do
  echo "Fixing $file..."
  
  # Check if apiUrl import exists
  if ! grep -q "import.*apiUrl.*from.*@/config/api" "$file"; then
    # Add import after the last import statement
    sed -i "/^import/a import { apiUrl } from '@/config/api';" "$file"
  fi
  
  # Replace fetch('/api/ with fetch(apiUrl('/api/
  sed -i "s/fetch('\/api\//fetch(apiUrl('\/api\//g" "$file"
  sed -i 's/fetch("\/api\//fetch(apiUrl("\/api\//g' "$file"
  
  echo "✓ Fixed $file"
done

echo "All files fixed!"
```

## Manual Fix Priority

If doing manually, fix in this order:

1. **Critical** (User-facing features):
   - projects.tsx
   - generator-enhanced.tsx
   - cursor-ide.tsx

2. **Important** (Alternative versions):
   - projects-white.tsx
   - generator-white.tsx
   - research-white.tsx
   - learning-mode-white.tsx
   - architecture-white.tsx

3. **Optional** (Auth - may work as-is):
   - login.tsx
   - signup.tsx

## Testing After Fix

Test each feature:
```bash
# Projects
curl -H "Authorization: Bearer TOKEN" https://devmindx.vercel.app/api/projects

# Generator
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","description":"test"}' \
  https://devmindx.vercel.app/api/projects/generate

# Research
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idea":"test"}' \
  https://devmindx.vercel.app/api/research/analyze
```

## Why This Matters

In development:
- `apiUrl('/api/projects')` returns `/api/projects` (relative URL works)

In production:
- `apiUrl('/api/projects')` returns full URL or uses Vercel rewrites
- Without `apiUrl()`, fetch goes to wrong domain → 404

## Verification

After fixing all files, search for remaining issues:
```bash
grep -r "fetch('/api/" client/src/pages/
grep -r 'fetch("/api/' client/src/pages/
```

Should return no results (or only in files that don't need fixing).
