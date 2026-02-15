# 🍿 Snackky

**Quick Bollywood fun!**

A snackable, social Bollywood movie guessing game for friend groups.

![Version](https://img.shields.io/badge/version-2.0-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🎯 What is Snackky?

Snackky is a Bollywood-themed word guessing game (like Hangman) designed for quick, casual gameplay with friends. Create groups, challenge friends, climb leaderboards, and test your Bollywood knowledge!

### Features

- 🎬 **100+ Bollywood Movies** - Curated catalog from 1995-2025
- 👥 **Group Play** - Create groups, challenge friends
- 🏆 **Leaderboards** - Compete and track stats
- 🎯 **Smart Difficulty** - Movies rated by difficulty
- 📱 **Mobile-First** - Optimized for phones
- 🎨 **Beautiful UI** - Warm, peachy theme

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (or MongoDB Atlas account)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/snackky.git
   cd snackky
   ```

2. **Set up backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   python server.py
   ```

3. **Set up frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Open http://localhost:3000**

---

## 📁 Project Structure

```
snackky/
├── frontend/              # React app
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── App.css       # Styles
│   │   └── index.js      # Entry point
│   ├── public/
│   └── package.json
│
├── backend/              # FastAPI server
│   ├── server.py         # Main server
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Environment template
│
└── README.md
```

---

## 🌐 Deployment

### Deploy to Vercel (Frontend)

1. Import your GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL
4. Deploy!

### Deploy to Railway (Backend)

1. Import your GitHub repo to Railway
2. Set root directory to `backend`
3. Add environment variables:
   - `MONGODB_URL`: Your MongoDB connection string
   - `PORT`: 8000
4. Deploy!

---

## 🎮 How to Play

1. **Create/Join a Group** - Start or join a friend group
2. **Create Challenge** - Pick a movie, challenge friends
3. **Guess the Movie** - Use the alphabet keyboard
4. **Track Progress** - See leaderboard and stats

### Game Rules

- Guess letters to reveal the movie title
- Maximum 3 vowels in first 5 tries
- 10 wrong guesses = game over
- Compete for best win rate!

---

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Framer Motion (animations)
- Axios (API calls)
- Tailwind CSS + Custom CSS

**Backend:**
- FastAPI (Python)
- MongoDB (Motor async driver)
- Pydantic (data validation)

**Deployment:**
- Vercel (Frontend)
- Railway (Backend)
- MongoDB Atlas (Database)

---

## 📊 Database Schema

### Collections

**users:**
```javascript
{
  id: string,
  name: string,
  created_at: datetime,
  stats: {
    total_games: int,
    wins: int,
    win_streak: int,
    best_streak: int
  }
}
```

**groups:**
```javascript
{
  id: string,
  name: string,
  created_at: datetime,
  members: [{
    user_id: string,
    name: string,
    wins: int,
    games_played: int,
    win_streak: int
  }]
}
```

**challenges:**
```javascript
{
  id: string,
  group_id: string,
  creator_id: string,
  movie_id: string,
  vowel_limit: int,
  results: [{
    player_id: string,
    status: "pending" | "won" | "lost",
    tries: int
  }]
}
```

---

## 🎨 Theme

Snackky uses a warm, peachy color palette:

- **Primary:** `#D88A5C` (Burnt Orange)
- **Secondary:** `#8BC4A8` (Mint Green)
- **Background:** `#F5D5B8` → `#D88A5C` (Gradient)
- **Text:** `#6B4423` (Dark Brown)
- **Cards:** `#FFFEF9` (Cream)

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Movie data curated from Bollywood cinema (1995-2025)
- Icons and emojis from system defaults
- Inspiration from classic word games

---

## 📧 Contact

**Creator:** Your Name  
**Project Link:** https://github.com/YOUR-USERNAME/snackky

---

Made with 🍿 and ❤️ for Bollywood fans!
