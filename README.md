i# PotionPocus: A Notion-Inspired Collaborative Note-Taking App

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/yourusername/potionpocus)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 🚀 Quick Overview

PotionPocus is a powerful, feature-rich note-taking application inspired by Notion, built with React, Tiptap, and Convex. It offers a seamless, collaborative writing experience with advanced multimedia capabilities.
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
  
This project is connected to the Convex deployment named [`gallant-mouse-210`](https://dashboard.convex.dev/d/gallant-mouse-210).
  
## 📝 Key Features

### 📝 Rich Text Editing

- Powered by Tiptap, offering advanced text formatting
- Slash commands for quick formatting and content creation
- Support for headings, bold, italic, underline, and text alignment

### 🎨 Drawing Canvas

- Integrated drawing tool for sketching and visual notes
- Customizable brush color and size
- Easy insertion of drawings directly into your notes

### 🎤 Voice Notes

- Record and embed audio directly into your documents
- Seamless integration with the text editor
- Quick capture of ideas and thoughts

### 👥 Collaborative Editing

- Real-time updates using Convex backend
- Shareable pages and collaborative workspaces

## 🛠️ Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.

- If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
- Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
- Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
