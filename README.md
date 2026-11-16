# Liner Notes

<img width="1800" height="1042" alt="Screenshot 2026-02-17 at 15 57 27" src="https://github.com/user-attachments/assets/99edcb9a-e64c-427d-bee6-48043ece9339" />

A powerful web application that enhances your music listening experience by providing deep musicological and cultural context for your currently playing Spotify tracks, powered by Google's Gemini AI.

## 🚀 Features

- **Real-time Spotify Integration**: Connects to the users Spotify account to analyse their library.
- **AI-Powered Deep Research**: Uses Google Gemini and AI-integrated Google Search to analyse:
  - **Album Context**: Critical reception, production style, and release history.
  - **Personnel & Places**: Details on producers, musicians, and studios.
  - **Artist Biography**: Focused on the artist's career during the specific era of the song.
  - **Cultural Context**: Explores the musical scene, genre movements, and cultural climate.
- **Curated Recommendations**: Get actionable suggestions for related albums, tracks, books, films, and TV shows.
- **Track History**: Keeps a record of previously analysed songs for easy reference.
- **Graph View**: Graph representation of realted tracks via intersection of tags.
- **Real-time Updates**: Uses Server-Sent Events (SSE) to stream analysis results as they are generated.

## 🛠 Tech Stack

### Backend
- **Core**: Node.js, Express, TypeScript
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Caching/Storage**: MongoDB
- **Auth**: Spotify OAuth 2.0 & JWT sessions

### Frontend
- **Framework**: React, Vite
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following:
- Node.js (v18+)
- MongoDB instance running Locally or via Cloud
- [Spotify Developer](https://developer.spotify.com/) App (Client ID and Secret)
- [Google AI Studio](https://aistudio.google.com/) API Key

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd liner-notes
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies (Backend)
   npm install

   # Install UI dependencies
   npm install --prefix ui
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   SPOTIFY_CLIENT_ID=your_spotify_client_id
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
   DOMAIN={ngrok https tunnel domain}
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=liner-notes
   JWT_SECRET=your_random_jwt_secret
   ```

4. **Running the Application**:
   ```bash
   # Starts both backend and frontend in development mode
   npm run dev
   ```
   The application will be available at `http://localhost:8080`.

## 🐳 Docker

The project includes a `Dockerfile` and `docker-compose.yml` with three services:

- `app` — the Node.js server and built UI, available at `http://localhost:8080`.
- `mongodb` — MongoDB, available at `mongodb://localhost:27017`.
- `mongodb-express` — Mongo Express UI, available at `http://localhost:8081`.

1. **Configure environment variables**:
   Ensure your `.env` contains the variables from `.env.example`, including a `JWT_SECRET`. Optionally set `MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`, `ME_CONFIG_BASICAUTH_USERNAME`, and `ME_CONFIG_BASICAUTH_PASSWORD` to override the local development defaults.

2. **Start the stack**:
   ```bash
   docker compose up --build
   ```

   The app is served at `http://localhost:8080` and Mongo Express at `http://localhost:8081`.

3. **Stop the stack**:
   ```bash
   docker compose down
   ```

   Add `-v` to also remove the MongoDB data volume.

> **Note:** Spotify OAuth still requires an HTTPS redirect, so `DOMAIN` must be an HTTPS tunnel domain (e.g. ngrok) even when running locally via Docker.

## 🚢 Deployment

The project includes a `deploy.sh` script for deploying to Google Cloud Platform (GCP). It handles building the UI, the backend, and pushing the final bundle.

```bash
./deploy.sh
```

## 📄 License

This project is licensed under the ISC License.
