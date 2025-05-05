High-Level Overview for Notion/OneNote Clone Development
Objective
Build a collaborative, web-based note-taking application similar to Notion or OneNote, using Convex for the backend (data storage, real-time sync, and authentication) and Tiptap for the rich text editor. The app will support hierarchical notes, real-time collaboration, and a clean, modular UI.
Tech Stack

Frontend: React (with TypeScript) for the UI, Tailwind CSS for styling, Tiptap for the rich text editor.
Backend: Convex for database, real-time sync, authentication, and serverless functions.
Deployment: Vercel for hosting the frontend and Convex for backend services.
Additional Tools: React Router for navigation, Zustand for state management, and ESLint/Prettier for code quality.

Architecture

Frontend:
Single-page React application with modular components (e.g., Editor, Sidebar, NoteList).
Tiptap editor for rich text editing with support for markdown, images, and collaborative cursors.
Zustand for managing UI state (e.g., active note, sidebar visibility).
React Router for client-side routing (e.g., /notes/:id for individual notes).


Backend:
Convex handles data storage (notes, users, folders) using a schema-driven database.
Real-time subscriptions for collaborative editing and live updates.
Authentication via Convex’s built-in auth with OAuth (Google, GitHub) or email/password.
Serverless functions for CRUD operations and business logic (e.g., note sharing, permissions).


Data Model:
Users: Store user info (ID, email, name, auth provider).
Notes: Store note content (title, body, created_at, updated_at, owner_id, parent_id for hierarchy).
Folders: Store folder metadata (name, owner_id, parent_id for nesting).
Collaborators: Store note-sharing permissions (user_id, note_id, role: editor/viewer).



Development Phases
The development is broken into manageable steps to ensure incremental progress and testing.
Phase 1: Project Setup and Authentication

Goals:
Set up the React project with TypeScript, Tailwind CSS, and Convex.
Implement user authentication using Convex Auth.


Tasks:
Initialize a React project with Vite (npm create vite@latest).
Install and configure Convex (npm install convex).
Set up Tailwind CSS and basic UI components (header, sidebar placeholder).
Configure Convex Auth with Google OAuth and email/password login.
Create a login/signup page and protect routes with auth checks.


Deliverables:
A running React app with a basic UI.
Users can sign up, log in, and log out.
Convex backend initialized with authentication.



Phase 2: Data Model and CRUD Operations

Goals:
Define the data schema in Convex.
Implement basic CRUD operations for notes and folders.


Tasks:
Define Convex schema for users, notes, and folders.
Write Convex mutations for creating, updating, and deleting notes/folders.
Write Convex queries for fetching user notes and folder hierarchies.
Build a Sidebar component to display folders and notes.
Create a NoteList component to show a list of notes.


Deliverables:
Users can create, view, update, and delete notes and folders.
Sidebar displays a hierarchical view of folders and notes.



Phase 3: Tiptap Editor Integration

Goals:
Integrate Tiptap for rich text editing.
Save note content to Convex.


Tasks:
Install Tiptap (npm install @tiptap/react @tiptap/starter-kit).
Create an Editor component with Tiptap, supporting basic formatting (bold, italic, headings, lists).
Add markdown support using Tiptap’s markdown extension.
Sync editor content to Convex using debounced updates (e.g., save every 1s).
Display note content in the editor when a note is selected.


Deliverables:
Users can edit notes with rich text formatting.
Note content is saved to Convex in real-time.



Phase 4: Real-Time Collaboration

Goals:
Enable real-time collaborative editing.
Show collaborator cursors and changes.


Tasks:
Use Convex’s real-time subscriptions to sync note changes across clients.
Integrate Tiptap’s collaboration extension (@tiptap/extension-collaboration).
Use Y.js (via y-websocket or Convex’s sync) for collaborative editing.
Display collaborator cursors and names in the editor.
Add a note-sharing feature (invite via email or link).


Deliverables:
Multiple users can edit the same note simultaneously.
Collaborator cursors and changes are visible in real-time.



Phase 5: Advanced Features

Goals:
Add hierarchical note/folder management.
Implement search and offline support.


Tasks:
Allow drag-and-drop to reorder notes/folders in the sidebar.
Add a search bar to query notes by title or content (use Convex queries).
Implement basic offline support using Convex’s optimistic updates.
Add note tagging (store tags in note metadata).


Deliverables:
Users can organize notes/folders hierarchically.
Search functionality for quick note access.
Basic offline editing with sync on reconnect.



Phase 6: Polish and Deployment

Goals:
Enhance UI/UX and ensure responsiveness.
Deploy the app to production.


Tasks:
Style the app with Tailwind CSS for a clean, Notion-like look.
Ensure mobile responsiveness (e.g., collapsible sidebar).
Add keyboard shortcuts (e.g., Ctrl+B for bold).
Set up Vercel for frontend deployment.
Configure Convex for production (environment variables, scaling).
Test end-to-end functionality (auth, CRUD, collaboration).


Deliverables:
A polished, responsive app deployed to Vercel.
Production-ready Convex backend.
Comprehensive test coverage.



Success Criteria

Users can sign up/log in securely.
Users can create, edit, and organize notes/folders hierarchically.
Real-time collaboration works seamlessly with no data loss.
The app is responsive and intuitive, with a Notion-like UX.
The app is deployed and accessible publicly.

Next Steps for Windsurf AI IDE

Start with Phase 1: Set up the project and authentication.
Generate boilerplate code for React, Convex, and Tailwind CSS.
Follow the phased tasks, testing each deliverable before proceeding.
Use modular components and keep code DRY (Don’t Repeat Yourself).
Regularly commit changes to a Git repository for version control.

This overview provides a clear roadmap for building the app incrementally. Each phase builds on the previous one, ensuring a stable and feature-rich final product.
