# Bottom Content Feature - Advertisement & Sponsor Logos

## Overview
This feature allows you to display either an advertisement banner OR a scrolling sponsor logo carousel at the bottom of the main landing page.

## Features Implemented

### 1. Database Models
Added three new models to the database:
- **BottomContent**: Stores the display type setting (NONE, ADVERTISEMENT, or SPONSOR_LOGOS)
- **Advertisement**: Stores advertisement banners with optional clickable links
- **SponsorLogo**: Stores sponsor logos with optional links and ordering

### 2. Admin Interface
Access the management page at: `/admin/bottom-content`

**Display Type Toggle:**
- **None**: No content displayed at bottom
- **Advertisement**: Shows a single banner image (full width)
- **Sponsor Logos**: Shows scrolling carousel of sponsor logos

### 3. Advertisement Management
**Upload Advertisement:**
- Accepted formats: JPG, PNG, WebP
- Optional: Add clickable URL
- Only one advertisement can be active at a time
- Recommended size: 1200x150px (will auto-scale)

**Features:**
- Upload new banner images
- Add optional click-through URL
- Delete advertisements
- Automatic activation (deactivates previous ads)

### 4. Sponsor Logo Management
**Upload Sponsor Logos:**
- Accepted formats: JPG, PNG, WebP, SVG
- Required: Sponsor name
- Optional: Clickable URL
- Logos are displayed in circular containers
- Automatic ordering (newest at end)

**Features:**
- Upload multiple sponsor logos
- Add company name and optional website link
- Toggle individual logos active/inactive
- Delete logos
- Automatic scaling to fit circular container (120x120px)

### 5. Frontend Display

**Advertisement Mode:**
- Full-width banner below the code entry section
- Clickable (opens in new tab if URL provided)
- Responsive design with border styling

**Sponsor Logos Mode:**
- Infinite horizontal scrolling carousel
- Multiple logos visible at once (4-6 depending on screen size)
- Smooth CSS animation
- Pauses on hover
- Logos displayed in circular white backgrounds
- Clickable if URL provided

## Usage Instructions

### For Admins:

1. **Access Admin Panel**
   - Navigate to `/admin` 
   - Click on "📢 Bottom Content"

2. **Choose Display Type**
   - Click one of three buttons: None, Advertisement, or Sponsor Logos

3. **Upload Advertisement (if selected)**
   - Choose image file
   - Optionally add a URL
   - Click "Upload Advertisement"
   - Previous ad will be automatically deactivated

4. **Upload Sponsor Logos (if selected)**
   - Enter sponsor name
   - Choose logo file
   - Optionally add a URL
   - Click "Upload Sponsor Logo"
   - Repeat for multiple sponsors

5. **Manage Content**
   - Toggle sponsors active/inactive
   - Delete unwanted content
   - Switch between ad and logos anytime

## File Storage
- Advertisements saved to: `/public/advertisements/`
- Sponsor logos saved to: `/public/sponsors/`

## API Endpoints

### Public Endpoints:
- `GET /api/bottom-content` - Get current display settings and content

### Admin Endpoints (requires authentication):
- `GET/PUT /api/admin/bottom-content/settings` - Manage display type
- `GET/POST /api/admin/advertisements` - Manage advertisements
- `PUT/DELETE /api/admin/advertisements/[id]` - Update/delete specific ad
- `GET/POST /api/admin/sponsors` - Manage sponsor logos
- `PUT/DELETE /api/admin/sponsors/[id]` - Update/delete specific sponsor

## Components
- `BottomContent.tsx` - Main component that decides what to display
- `Advertisement.tsx` - Displays advertisement banner
- `SponsorCarousel.tsx` - Animated scrolling carousel for logos

## Technical Details

**Animation:**
- CSS keyframe animation for smooth infinite scroll
- Animation speed scales with number of sponsors
- Pauses on hover for better UX

**Image Handling:**
- Automatic file upload and storage
- Unique filenames using timestamps
- Cleanup on deletion (removes files from disk)
- Next.js Image component for optimization

**Responsive Design:**
- Mobile-friendly layouts
- Circular logo containers (112px diameter)
- Full-width banners on all screen sizes

## Notes
- Only one type of content can be displayed at a time
- All uploads are stored locally in the public directory
- Images are automatically optimized by Next.js
- Logos are displayed in the order they were uploaded
- The carousel requires at least 1 active sponsor logo to display
