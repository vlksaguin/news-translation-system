# News Translation System

![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Backend-Express-000000?logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=nodedotjs&logoColor=white)
![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=111111)

![Project](https://img.shields.io/badge/Project-Portfolio-0A66C2)
![Status](https://img.shields.io/badge/Status-Active-2EA043)
----
A full-stack news translation workflow app built with React + Vite on the frontend and Express on the backend.

The app lets an editor:
- Create an English article
- Translate it to Filipino
- Review and adjust the Filipino output
- Publish both EN and FIL versions
- Edit published articles later

It also tracks metadata per published article:
- Author
- Date published
- Date last edited

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Build](#build)
- [Deployment (Render)](#deployment-render)
- [Notes on Translation Provider](#notes-on-translation-provider)
- [Troubleshooting](#troubleshooting)
  
## Tech Stack

Frontend:
- React 18
- Vite
- React Router
- Tailwind CSS
- Axios

Backend:
- Node.js
- Express
- CORS
- MyMemory translation API (with chunking for long text)

## Project Structure

- client: React frontend
- server: Express API backend
- render.yaml: Render Blueprint config

## Prerequisites

- Node.js 18+
- npm

## Installation

From project root, install dependencies for root, client, and server.

1. Install root dependencies
```
	npm install
```
2. Install client dependencies
```
	npm install --prefix client
```
3. Install server dependencies
```
	npm install --prefix server
```
## Running Locally

Run both frontend and backend together from project root:
```
npm run dev
```
This starts:
- Frontend at ```http://localhost:5173```
- Backend at ```http://localhost:5000```

## Environment Variables

Frontend uses:
- VITE_API_URL

For production, set VITE_API_URL to your deployed backend URL.

## Build

Build frontend:
```
npm run build --prefix client
```
Run backend in production mode:
```
npm start --prefix server
```

## Deployment (Render)

This repository includes render.yaml for a two-service setup:

1. Web Service (backend)
- Root directory: server
- Build command: ```npm install```
- Start command: ```npm start```

2. Static Site (frontend)
- Root directory: client
- Build command: ```npm install && npm run build```
- Publish directory: ```dist```
- Required env var: ```VITE_API_URL```
- SPA rewrite: /* -> /index.html

If deploying manually in Render UI, use the same values above.

## Notes on Translation Provider

- Current provider is MyMemory.
- Long text is chunked server-side to avoid per-request limits.
- Free-tier providers may still enforce daily quotas/rate limits.

## Troubleshooting

If frontend loads but styles/scripts 404 in production:
- Ensure frontend deploy is from latest commit
- Clear build cache and redeploy
- Verify generated asset paths are rooted under /assets

If translations fail on long text:
- Confirm backend was redeployed after chunking changes

If API calls fail in production:
- Recheck VITE_API_URL on the static site
- Redeploy frontend after updating env vars
