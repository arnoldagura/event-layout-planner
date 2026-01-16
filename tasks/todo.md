# Event Layout Planner - New Features

## Task: Add Event Details Editing + Element Properties Panel

### Problem Analysis
1. **Event Details Editing**: Currently, event details (title, date, venue, capacity, type) are displayed in the header but cannot be modified from the editor. The AI assistant needs these details to generate better layouts.
2. **Element Properties Panel**: When clicking elements, users can delete via X button but cannot view/edit properties (name, dimensions, etc.).

### Brainstorming - Options

#### Feature 1: Event Details Editing

**Option A: Modal/Dialog Approach**
- Add "Edit" button next to event title in header
- Opens dialog with form fields for all event details
- Simple, minimal code changes
- Keeps header clean

**Option B: Expandable Panel in Sidebar**
- Add collapsible section in AI panel for editing event details
- Always visible context for AI
- More integrated experience

**Option C: Inline Edit in Header**
- Click on event details to edit inline
- More complex, requires handling multiple editable fields

**Recommendation**: Option A (Modal) - Simple, minimal code impact, clear UX

#### Feature 2: Element Properties Panel

**Option A: Right-side Panel (Replace/Alongside AI Panel)**
- When element selected, show properties in right panel
- Could toggle between AI and Properties
- More screen real estate

**Option B: Floating Panel near Element**
- Small floating panel appears near selected element
- Contextual, doesn't take permanent space
- May overlap with elements

**Option C: Bottom Drawer/Panel**
- Properties appear in bottom drawer when selected
- Non-intrusive
- Takes vertical space

**Recommendation**: Option A - Add properties section to right panel that shows when element is selected

---

## Todo List

### Feature 1: Event Details Editing
- [x] 1. Create EventDetailsDialog component for editing event details
- [x] 2. Add Edit button to header in EventEditorClient
- [x] 3. Test event details editing works correctly

### Feature 2: Element Properties Panel
- [x] 4. Create ElementPropertiesPanel component
- [x] 5. Integrate ElementPropertiesPanel into the right sidebar area
- [x] 6. Test element properties editing works correctly

---

## Review

### Feature 1: Event Details Editing - COMPLETED

**Changes Made:**
1. Created `components/EventDetailsDialog.tsx` - A modal dialog for editing event details
   - Form fields: title, description, date, venue, capacity, event type
   - Validation for required fields
   - PATCH request to `/api/events/[id]` on save
   - Real-time updates to the UI after saving

2. Modified `app/events/[id]/EventEditorClient.tsx`:
   - Added Pencil icon import
   - Added EventDetailsDialog import
   - Added `isEditDialogOpen` and `currentEvent` state
   - Added Edit button (pencil icon) next to event title in header
   - Updated header to display `currentEvent` data (reactive to edits)
   - Updated AISuggestionPanel to use `currentEvent` data
   - Added EventDetailsDialog at the bottom of the component

**Impact:** Minimal - only 2 files changed, simple state management, uses existing API endpoint

### Feature 2: Element Properties Panel - COMPLETED (Option B: Floating Panel)

**Changes Made:**
1. Created `components/canvas/ElementPropertiesPanel.tsx` - A floating properties panel
   - Appears near the selected element (to the right, or left if no space)
   - Auto-positions to stay within viewport bounds
   - Shows: element icon, type label
   - Editable fields: name, width, height
   - Read-only fields: x, y position
   - Close button (X) to deselect element
   - Delete button with red accent

2. Modified `app/events/[id]/EventEditorClient.tsx`:
   - Added ElementPropertiesPanel import
   - Added `panOffset` from useCanvasStore
   - Added floating panel inside canvas container with panOffset and scale props

**Impact:** Minimal - 2 files changed, floating panel follows element position
