# 🎬 NileMovieAdmin - Frontend

A modern React-based streaming platform with Netflix-like UI and advanced social features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🔧 Environment Setup

Create `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## ✨ Features

- 🎥 Movie streaming with custom video player
- 👥 Watch parties with real-time sync
- 📥 Download manager for offline viewing
- 🎯 Smart recommendations & AI summaries
- 👫 Social features (friends, sharing, reviews)
- 📋 Playlists & watchlists
- 🌙 Dark mode interface
- 📱 Fully responsive design
- ♿ Accessibility options

## 🛠️ Tech Stack

- React 18+
- Context API (State Management)
- Socket.IO Client (Real-time)
- Lucide React (Icons)
- CSS3 (Styling)

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/           # Login & Registration
│   ├── Home/           # Home page
│   ├── WatchParty/     # Watch party features
│   ├── AI/             # AI-powered features
│   └── Common/         # Reusable components
├── context/            # React Context
├── hooks/              # Custom hooks
├── api/                # API services
└── NileMovie.js        # Main App
```

## 🌐 API Integration

The app connects to the NileMovie backend API. Make sure the backend server is running on the configured `REACT_APP_API_URL`.

## 📦 Dependencies

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "lucide-react": "latest",
  "socket.io-client": "^4.0.0"
}
```

## 🔗 Backend Repository

[NileMovie Backend](https://github.com/leopoldbonfils/Nile-Movie-Backend.git)

## 📝 License

MIT
