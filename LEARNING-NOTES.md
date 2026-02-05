# Learning Notes: Next.js API Routes & Data Fetching

## What We Built
- **API Route**: `app/api/practice/route.ts` - returns mock JSON data
- **Page**: `app/practice/page.tsx` - fetches and displays that data

---

## Part 1: API Routes (Backend)

### File Location = URL
```
app/api/practice/route.ts  →  /api/practice
app/api/dashboard/route.ts →  /api/dashboard
```

### Basic Structure
```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: "hello" })
}
```

### Key Concepts

**`export async function GET()`**
- Function name = HTTP method (GET, POST, PUT, DELETE)
- `async` allows using `await` inside (for database calls, etc.)
- `export` makes it visible to Next.js

**`NextResponse.json()`**
- Converts JavaScript object to JSON response
- Sets proper headers automatically

---

## Part 2: Client-Side Data Fetching (Frontend)

### The Pattern
```typescript
"use client"
import { useState, useEffect } from 'react'

export default function MyPage() {
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        async function fetchData() {
            const res = await fetch('/api/practice')
            const json = await res.json()
            setData(json)
        }
        fetchData()
    }, [])

    return <div>{data?.daily?.applicationsTaken}</div>
}
```

### Key Concepts

**`"use client"`**
- Goes at top of file
- Tells Next.js this runs in the browser (not server)
- Required for using hooks like useState, useEffect

**`useState`**
```typescript
const [data, setData] = useState(null)
```
- Creates a "box" to store data
- `data` = current value
- `setData` = function to update it
- When you call `setData(newValue)`, React re-renders the component

**`useEffect`**
```typescript
useEffect(() => {
    // code here runs after component loads
}, [])
```
- Runs code after component appears on screen
- The `[]` means "run once on first load"
- Without `[]` = runs on every render (infinite loop!)

**Why we need async function inside useEffect**
```typescript
useEffect(() => {
    async function fetchData() {  // async function INSIDE
        const res = await fetch(...)
    }
    fetchData()  // call it
}, [])
```
- Can't make useEffect callback itself async
- So we create an async function inside and call it

---

## Part 3: Async/Await Explained

### The Problem
```typescript
const response = fetch('/api/practice')  // starts request
const data = response.json()              // RUNS IMMEDIATELY - response not ready!
```
`fetch()` doesn't wait - it starts the request and moves on.

### The Solution: `await`
```typescript
const response = await fetch('/api/practice')  // WAITS for response
const data = await response.json()              // WAITS for parsing
```
`await` says "pause here until this finishes"

### Alternative: `.then()` chains
```typescript
fetch('/api/practice')
    .then(res => res.json())      // when fetch done, parse JSON
    .then(json => setData(json))  // when parsing done, save it
```
Same thing, different syntax.

---

## Part 4: Optional Chaining (`?.`)

### The Problem
```typescript
<p>{data.daily.applicationsTaken}</p>
```
If `data` is `null` (before fetch completes) → CRASH

### The Solution
```typescript
<p>{data?.daily?.applicationsTaken}</p>
```
- If `data` is null → returns `undefined` (no crash)
- If `data.daily` is null → returns `undefined` (no crash)
- If everything exists → returns the value

---

## Part 5: TypeScript Basics

### The Problem
```typescript
const [data, setData] = useState(null)
// TypeScript thinks data is ALWAYS null
// data.daily ← red underline error
```

### Quick Fix
```typescript
const [data, setData] = useState<any>(null)
```
`<any>` = "trust me, don't check types"

### Proper Fix
```typescript
interface PracticeData {
    daily: {
        applicationsTaken: number
        appraisalsOrdered: number
        submissions: number
    }
}

const [data, setData] = useState<PracticeData | null>(null)
```

---

## Quick Reference

### Create an API route
1. Create `app/api/[name]/route.ts`
2. Export async function with HTTP method name (GET, POST, etc.)
3. Return `NextResponse.json(yourData)`

### Fetch data in a page
1. Add `"use client"` at top
2. Import `useState` and `useEffect`
3. Create state: `const [data, setData] = useState<any>(null)`
4. Fetch in useEffect with async function
5. Display with optional chaining: `{data?.property}`

---

## Files Created
- `app/api/practice/route.ts` - Practice API
- `app/practice/page.tsx` - Practice page

## Files to Study
- `app/api/dashboard/route.ts` - Real API (calls Salesforce)
- `app/mobile/dashboard/page.tsx` - Real page (full example)
- `lib/salesforce.ts` - Service class pattern

### 02-04-2026 Day 1