# AGENTS.md - Penquin v2 Development Guide

## Project Overview

**Penquin** is a Next.js-based cybersecurity knowledge base and resource hub designed for bug bounty hunters, penetration testers, and information security professionals. The tagline is **"Hunt bugs, Not noise"** - a curated, field-tested collection of cybersecurity resources.

### Technology Stack
- **Framework**: Next.js 16.2.1 (App Router) with React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom CSS variables
- **Database**: Firebase Firestore (feedback system)
- **Animations**: Framer Motion
- **UI Components**: Base UI, shadcn, Lucide React icons
- **Content**: JSON-based documentation system
- **Markdown**: react-markdown with remark-gfm

## Architecture

### Core Systems

1. **Custom JSON Documentation Engine** (`lib/docs.ts`)
   - File-based routing from `src/data/**/*.json`
   - Automatic sidebar generation
   - Virtual page creation for navigation groups
   - Title-based URL aliasing and route resolution
   - Breadcrumb generation
   - Previous/Next navigation

2. **Search System** (`/api/search`, `SearchModal`)
   - Full-text search with fuzzy matching
   - Indexes titles, descriptions, headings, and content
   - Scoring: Exact match > Starts with > Contains > Fuzzy
   - Category grouping and keyboard navigation
   - Recent searches saved in localStorage

3. **Content Rendering** (`DocsContent`)
   - Multiple block types: paragraphs, code blocks, lists, videos, tables, hints
   - Syntax-highlighted code with copy functionality
   - External link cards with favicons
   - YouTube/video embeds
   - Markdown support with GFM

4. **Feedback System** (`SectionFeedback`)
   - Per-heading feedback widgets
   - 6 feedback types (submit/update/report links, suggest edits, love wiki, other)
   - Dual persistence: Firebase Firestore + Discord webhook
   - Animated forms with Framer Motion

5. **User Customization** (Navbar settings)
   - Theme: Dark/Light/Auto
   - Layout modes: Expand All, Original, Expand Sidebar, Expand All Adjustable
   - Adjustable content width (600-1200px)
   - Spotlight mode with cursor tracking
   - Takodachi follower animation

### Project Structure

```
src/
├── app/
│   ├── (content)/           # Content route group
│   │   ├── [...slug]/       # Dynamic catch-all for all content pages
│   │   ├── docs/[[...slug]]/# Optional catch-all for intro docs
│   │   └── layout.tsx       # Content layout wrapper
│   ├── api/
│   │   ├── feedback-notify/ # Discord webhook integration
│   │   └── search/          # Search index endpoint
│   ├── introduction/        # Redirects to /docs
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles + CSS variables
├── components/
│   ├── docs/                # Documentation-specific components
│   │   ├── DocsShell.tsx    # Main layout with sidebar + TOC
│   │   ├── HomeShell.tsx    # Homepage layout
│   │   ├── DocsSidebar.tsx  # Collapsible navigation tree
│   │   ├── DocsTOC.tsx      # Table of contents with intersection observer
│   │   ├── DocsContent.tsx  # Content renderer
│   │   ├── SectionFeedback.tsx # Feedback widget
│   │   └── ...              # Other doc components
│   └── ui/                  # Reusable UI components
│       ├── ElasticSlider.tsx # Animated width slider
│       ├── SearchModal.tsx  # Full-screen search
│       ├── SiteKeyModal.tsx # Domain reference modal
│       └── ...              # Other UI components
├── data/                    # JSON content database
│   ├── sidebar.json         # Primary navigation structure
│   ├── sidebar-2.json       # Secondary navigation (Main Course)
│   ├── site_domains.json    # External site icon mappings
│   ├── mains/               # Starter resources
│   ├── recon/               # Reconnaissance techniques
│   ├── enumeration/         # Enumeration methods
│   ├── exploitation/        # Exploitation guides
│   ├── post-exploitation/   # Post-exploitation techniques
│   ├── bug-bounty-*/        # Bug bounty platforms & reports
│   ├── learn-*/             # Learning resources
│   └── others/              # Miscellaneous topics
├── hooks/                   # Custom React hooks (currently empty)
└── lib/
    ├── docs.ts              # Core documentation engine
    ├── firebase.ts          # Firebase configuration
    └── utils.ts             # Utility functions (cn)
```

## Content Management

### Page Data Structure (`index.json`)

Each page is defined by an `index.json` file with this structure:

```json
{
  "title": "Page Title",
  "description": "Page description for SEO",
  "subtitle": "Optional subtitle",
  "breadcrumb": [
    { "label": "Parent Category", "url": "/parent" }
  ],
  "sections": [
    {
      "heading": "Section Title",
      "type": "paragraph|code_block|list|video|heading|hint|table",
      "content": "Content text or code",
      "language": "javascript",  // For code blocks
      "subheadings": [
        {
          "subheading": "Subsection",
          "points": ["Point 1", "Point 2"]
        }
      ]
    }
  ],
  "Subtopics": [
    { "text": "Related Topic", "url": "/related", "emoji": "🔗" }
  ],
  "links": [
    { "text": "External Resource", "url": "https://...", "external": true }
  ],
  "tools": [
    {
      "category": "Tool Category",
      "tool": "Tool Name",
      "purpose": "What it does"
    }
  ],
  "metadata": {
    "last_updated": "2024-01-01",
    "edit_url": "https://github.com/...",
    "previous_page": { "title": "Previous", "url": "/prev" },
    "next_page": { "title": "Next", "url": "/next" }
  }
}
```

### Sidebar Structure (`sidebar.json`)

Navigation is defined hierarchically:

```json
{
  "type": "page|group|divider",
  "title": "Navigation Label",
  "emoji": "🔥",
  "icon": "lucide-icon-name",
  "url": "/route",
  "external": false,
  "children": [
    // Nested items...
  ]
}
```

### Content Block Types

- **paragraph**: Plain text with optional markdown
- **code_block**: Syntax-highlighted code with copy button
- **list**: Bulleted/numbered lists with nested items
- **video**: Embedded YouTube/external videos
- **heading**: Section headers (H2/H3)
- **hint**: Callout boxes (success/info/warning)
- **table**: Responsive tables with sorting
- **links**: Link cards with favicons

## Development Guidelines

### Adding New Content

1. **Create directory** under `src/data/[category]/[topic]/`
2. **Add `index.json`** with page data
3. **Update sidebar** in `src/data/sidebar.json` or `sidebar-2.json`
4. **Test routing** - pages auto-generate from JSON structure
5. **Verify search** - content is auto-indexed

### Component Conventions

- **Layout components** use persistent state (sidebar scroll, TOC position)
- **Content components** are pure and render from props
- **UI components** are reusable and theme-aware
- **Animations** use Framer Motion's `AnimatePresence` for enter/exit
- **Styling** uses Tailwind with custom CSS variables (`--vp-c-*`)

### State Management

- **Theme**: localStorage (`theme-preference`)
- **Layout**: localStorage (`layout-mode`, `content-max-width-*`)
- **Sidebar scroll**: sessionStorage (`sidebar-scroll-position`)
- **Recent searches**: localStorage (`recent-searches`)
- **Spotlight**: localStorage (`spotlight-mode`, `spotlight-style`)
- **Takodachi**: localStorage (`takodachi-enabled`)

### Performance Considerations

- All routes use Static Site Generation (SSG)
- Search index pre-built at build time
- Images optimized with Next.js Image component
- Lazy loading for heavy components
- Intersection Observer for TOC active detection
- Memoized search results

### Styling System

**CSS Variables** (defined in `globals.css`):
```css
--vp-c-brand-1          /* Primary brand color */
--vp-c-brand-2          /* Secondary brand color */
--vp-c-bg               /* Background color */
--vp-c-bg-soft          /* Soft background */
--vp-c-bg-mute          /* Muted background */
--vp-c-divider          /* Divider color */
--vp-c-text-1           /* Primary text */
--vp-c-text-2           /* Secondary text */
--vp-c-text-3           /* Tertiary text */
--content-max-width     /* Dynamic content width */
--app-spotlight-x       /* Spotlight X position */
--app-spotlight-y       /* Spotlight Y position */
```

**Responsive Breakpoints**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### API Routes

#### `/api/search` (GET)
Returns full search index with all pages, sections, and headings:
```typescript
{
  id: string,              // "route#heading"
  title: string,
  description: string,
  url: string,
  emoji?: string,
  content?: string,
  category?: string,       // "Recon", "Enumeration", etc.
  priority: number,        // 1=page, 2=section, 3=heading
  type: "page"|"section"|"heading"
}[]
```

#### `/api/feedback-notify` (POST)
Sends Discord webhook notification:
```typescript
{
  type: string,            // Feedback type
  message: string,
  pageUrl: string,
  sectionTitle?: string,
  userAgent: string,
  timestamp: string
}
```

### Firebase Structure

**Collection**: `feedback`

**Document schema**:
```typescript
{
  type: string,
  message: string,
  pageUrl: string,
  sectionTitle?: string,
  userAgent: string,
  timestamp: Timestamp,
  category?: string
}
```

### Key Functions in `lib/docs.ts`

- **`loadDocs()`** - Scans `src/data/`, builds sidebar tree, creates route map
- **`getSidebarTree(sidebarName?)`** - Returns hierarchical navigation (sidebar-1 or sidebar-2)
- **`getDocPage(route)`** - Fetches page data with alias resolution
- **`getNeighbors(route)`** - Returns previous/next navigation pages
- **`getAllDocRoutes()`** - Lists all routes for `generateStaticParams`
- **`resolveRouteByTitle(title)`** - Finds route by page title
- **`getVirtualPage(route)`** - Creates virtual page for navigation groups

## Testing & Quality

### Manual Testing Checklist

- [ ] Search functionality (exact match, fuzzy, keyboard navigation)
- [ ] Sidebar collapse/expand on all breakpoints
- [ ] TOC active section tracking
- [ ] Theme switching (dark/light/auto)
- [ ] Layout mode changes
- [ ] Content width slider
- [ ] Spotlight mode and Takodachi follower
- [ ] Code block copy functionality
- [ ] Link cards render with correct favicons
- [ ] Video embeds work correctly
- [ ] Feedback submission (Firebase + Discord)
- [ ] Previous/Next navigation
- [ ] Breadcrumb navigation
- [ ] Mobile responsive design
- [ ] Keyboard accessibility (Tab, Enter, Esc, Arrow keys)

### Build Commands

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
```

## Common Tasks

### Adding a New Category

1. Create `src/data/[category]/` directory
2. Add `index.json` for category landing page
3. Update `sidebar.json` with new group:
   ```json
   {
     "type": "group",
     "title": "New Category",
     "emoji": "🆕",
     "children": []
   }
   ```

### Adding External Link Icons

Update `src/data/site_domains.json`:
```json
{
  "domain.com": {
    "name": "Service Name",
    "icon": "/icons/service.svg"
  }
}
```

### Customizing Theme Colors

Edit CSS variables in `src/app/globals.css`:
```css
:root {
  --vp-c-brand-1: #your-color;
}

.dark {
  --vp-c-brand-1: #your-dark-color;
}
```

### Adding New Block Type

1. Update TypeScript type in `lib/docs.ts`:
   ```typescript
   type DocBlock = {
     // ... existing types
     type: "paragraph" | "code_block" | "your_new_type";
   }
   ```

2. Add renderer in `DocsContent.tsx`:
   ```typescript
   if (block.type === 'your_new_type') {
     return <YourNewComponent {...block} />;
   }
   ```

## Deployment

The application uses Next.js static export:

1. Build: `npm run build`
2. Output: `.next/` directory
3. Deploy to any static hosting (Vercel, Netlify, Cloudflare Pages)

**Environment Variables Required**:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
DISCORD_WEBHOOK_URL=
```

## Troubleshooting

### Search Not Working
- Check if `/api/search` returns valid JSON
- Verify `src/data/` structure is correct
- Clear browser cache and localStorage

### Sidebar Not Updating
- Verify `sidebar.json` is valid JSON
- Check route URLs match actual file paths
- Restart dev server to reload sidebar cache

### Firebase Errors
- Verify environment variables are set
- Check Firebase project permissions
- Ensure Firestore rules allow writes

### Styling Issues
- Check if Tailwind CSS variables are defined
- Verify `globals.css` is imported in root layout
- Use browser DevTools to inspect CSS custom properties

## Future Enhancements

Potential areas for expansion:

- [ ] User authentication and personalized bookmarks
- [ ] Community contributions and voting
- [ ] AI-powered search and recommendations
- [ ] PDF export for offline reading
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics and usage tracking
- [ ] Integration with external APIs (CVE database, exploit-db)
- [ ] Real-time collaboration features
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick reference

## Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion
- **Firebase**: https://firebase.google.com/docs
- **React Markdown**: https://github.com/remarkjs/react-markdown

---

**Last Updated**: 2026-05-04

**Maintainers**: Contact via GitHub issues or feedback system

**License**: Check package.json and repository for license information
