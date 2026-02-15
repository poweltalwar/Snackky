import { useState, useEffect, useCallback } from "react";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/varela-round";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Copy, Share2, Plus, Check, X } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Vowels for game logic
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

// Page transition animation
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// ==================== WELCOME SCREEN ====================
const WelcomeScreen = ({ onSubmit }) => {
  const [name, setName] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };
  
  return (
    <motion.div 
      className="mobile-container justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🎬</div>
        <h1 className="game-title">Bollywood Hangman</h1>
        <p className="text-white/80 text-lg mt-2">Guess the movie, save the day!</p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-600 font-bold text-sm uppercase tracking-wide mb-2">
              What should we call you?
            </label>
            <input
              data-testid="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="input-field"
              maxLength={20}
              autoFocus
            />
          </div>
          <button 
            data-testid="start-playing-btn"
            type="submit" 
            className="btn-primary"
            disabled={!name.trim()}
          >
            Start Playing 🚀
          </button>
        </form>
      </div>
    </motion.div>
  );
};

// ==================== CHALLENGE LANDING ====================
const ChallengeLanding = ({ challenge, challenger, onAccept, userName }) => {
  return (
    <motion.div 
      className="mobile-container justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🎯</div>
        <h1 className="game-title text-3xl">{challenger} challenged you!</h1>
        <p className="text-white/80 text-lg mt-2">Guess this Bollywood movie</p>
      </div>
      
      <div className="card text-center">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span className="text-2xl">❤️</span>
            <span className="font-bold">5 lives allowed</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span className="text-2xl">🎯</span>
            <span className="font-bold">Max {challenge?.vowel_limit || 3} vowels in first 5 tries</span>
          </div>
        </div>
        
        <button 
          data-testid="accept-challenge-btn"
          onClick={onAccept}
          className="btn-primary"
        >
          Accept Challenge & Play 🎬
        </button>
      </div>
    </motion.div>
  );
};

// ==================== GAMEPLAY SCREEN ====================
const GameplayScreen = ({ movie, vowelLimit, onComplete, challengeId }) => {
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [tries, setTries] = useState(0);
  const [vowelsUsed, setVowelsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  
  const MAX_WRONG = 5;
  const movieTitle = movie?.title || "";
  
  const faces = ['😃', '🙂', '😐', '😟', '😨', '💀'];
  const currentFace = faces[Math.min(wrongGuesses, 5)];
  
  // Check if letter is in movie
  const isLetterInMovie = useCallback((letter) => {
    return movieTitle.includes(letter);
  }, [movieTitle]);
  
  // Get display word
  const getDisplayWord = useCallback(() => {
    return movieTitle.split('').map(char => {
      if (char === ' ') return ' ';
      if (guessedLetters.has(char)) return char;
      return '_';
    }).join('');
  }, [movieTitle, guessedLetters]);
  
  // Check win condition
  useEffect(() => {
    if (!movieTitle || gameOver) return;
    
    const allLettersGuessed = movieTitle.split('').every(char => 
      char === ' ' || guessedLetters.has(char)
    );
    
    if (allLettersGuessed) {
      setWon(true);
      setGameOver(true);
    }
  }, [guessedLetters, movieTitle, gameOver]);
  
  // Handle letter guess
  const handleGuess = (letter) => {
    if (gameOver || guessedLetters.has(letter)) return;
    
    const isVowel = VOWELS.includes(letter);
    const inFirst5Tries = tries < 5;
    
    // Check vowel limit
    if (isVowel && inFirst5Tries && vowelsUsed >= vowelLimit) {
      toast.error(
        `Whoa there, vowel hunter! You've already used ${vowelLimit} vowels in your first 5 tries. Try a consonant instead! 🤩`,
        { duration: 3000 }
      );
      return;
    }
    
    setGuessedLetters(prev => new Set([...prev, letter]));
    setTries(prev => prev + 1);
    
    if (isVowel && inFirst5Tries) {
      setVowelsUsed(prev => prev + 1);
    }
    
    if (!isLetterInMovie(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= MAX_WRONG) {
        setWon(false);
        setGameOver(true);
      }
    }
  };
  
  // Complete game
  useEffect(() => {
    if (gameOver) {
      setTimeout(() => {
        onComplete(won, tries);
      }, 1500);
    }
  }, [gameOver, won, tries, onComplete]);
  
  const getLetterState = (letter) => {
    if (!guessedLetters.has(letter)) return 'unused';
    return isLetterInMovie(letter) ? 'correct' : 'wrong';
  };
  
  return (
    <motion.div 
      className="mobile-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Stats Bar */}
      <div className="glass-card mb-4">
        <div className="flex justify-between items-center text-white text-sm font-bold">
          <span>Tries: {tries}</span>
          <span>
            Vowels: {tries < 5 ? `${vowelsUsed}/${vowelLimit}` : 'Unlimited'}
          </span>
          <span className="flex gap-1">
            {Array(MAX_WRONG - wrongGuesses).fill('❤️').map((h, i) => <span key={i}>{h}</span>)}
            {Array(wrongGuesses).fill('🖤').map((h, i) => <span key={i}>{h}</span>)}
          </span>
        </div>
      </div>
      
      {/* Hangman Face */}
      <div className="text-center mb-6">
        <motion.div 
          className="text-8xl"
          animate={{ scale: gameOver ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentFace}
        </motion.div>
      </div>
      
      {/* Movie Word Display */}
      <div className="card mb-6">
        <div className="movie-display font-mono text-2xl md:text-3xl font-bold text-slate-800 tracking-wider text-center leading-relaxed">
          {getDisplayWord().split(' ').map((word, wi) => (
            <span key={wi} className="inline-block mx-2 mb-2">
              {word.split('').map((char, ci) => (
                <span key={ci} className={`inline-block min-w-[1.5rem] ${char === '_' ? 'border-b-4 border-purple-500' : ''}`}>
                  {char}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      
      {/* Keyboard */}
      <div className="card">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1 mb-2">
            {row.map(letter => {
              const state = getLetterState(letter);
              const isVowel = VOWELS.includes(letter);
              const inFirst5 = tries < 5;
              const vowelLimitReached = isVowel && inFirst5 && vowelsUsed >= vowelLimit;
              
              return (
                <button
                  key={letter}
                  data-testid={`key-${letter}`}
                  onClick={() => handleGuess(letter)}
                  disabled={guessedLetters.has(letter) || gameOver}
                  className={`
                    keyboard-key
                    ${state === 'correct' ? 'key-correct' : ''}
                    ${state === 'wrong' ? 'key-wrong' : ''}
                    ${state === 'unused' && vowelLimitReached ? 'key-vowel-limit' : ''}
                    ${state === 'unused' && !vowelLimitReached ? 'key-unused' : ''}
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="text-center"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <div className="text-8xl mb-4">{won ? '🎉' : '💔'}</div>
              <h2 className="text-4xl font-bold text-white">
                {won ? 'YOU WON!' : 'GAME OVER'}
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== RESULTS SCREEN ====================
const ResultsScreen = ({ won, movie, tries, userStats, onCreateGroup, onPlayAnother, onGoToGroups, hasGroups }) => {
  return (
    <motion.div 
      className="mobile-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center mb-6">
        <div className="text-7xl mb-4">{won ? '🎉' : '😢'}</div>
        <h1 className="game-title text-3xl">{won ? 'YOU WON! 🏆' : 'YOU LOST!'}</h1>
      </div>
      
      <div className="card mb-4">
        <p className="text-slate-500 text-sm font-bold uppercase tracking-wide mb-2">The Movie Was:</p>
        <h2 className="text-2xl font-black text-purple-600 mb-4">{movie?.title}</h2>
        
        <div className="border-t border-slate-200 pt-4">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wide mb-3">Your Progress:</p>
          
          <div className="space-y-2">
            {userStats?.win_streak > 0 && (
              <div className="flex items-center gap-2 text-orange-500 font-bold">
                <span className="text-xl">🔥</span>
                <span>{userStats.win_streak}-Game Win Streak!</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-green-600 font-bold">
              <span className="text-xl">🏆</span>
              <span>{userStats?.wins || 0} Total Wins {won ? '(+1) 📈' : ''}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-600 font-bold">
              <span className="text-xl">🎯</span>
              <span>Completed in {tries} tries</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <p className="text-slate-600 font-bold text-center mb-4">Want to keep playing with friends?</p>
        
        <div className="space-y-3">
          <button 
            data-testid="create-group-btn"
            onClick={onCreateGroup}
            className="btn-primary"
          >
            Create a Group 🍿
          </button>
          
          {hasGroups && (
            <button 
              data-testid="go-to-groups-btn"
              onClick={onGoToGroups}
              className="btn-secondary"
            >
              Go to My Groups
            </button>
          )}
          
          <button 
            data-testid="play-another-btn"
            onClick={onPlayAnother}
            className="btn-ghost"
          >
            Play Another Game
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MY GROUPS SCREEN ====================
const MyGroupsScreen = ({ groups, onSelectGroup, onCreateGroup, onBack }) => {
  return (
    <motion.div 
      className="mobile-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <button onClick={onBack} className="text-white p-2">
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 className="game-title text-2xl">My Groups 🍿</h1>
      </div>
      
      {groups.length === 0 ? (
        <div className="card text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-slate-600 font-bold mb-4">You're not in any groups yet.</p>
          <button 
            data-testid="create-first-group-btn"
            onClick={onCreateGroup}
            className="btn-primary"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <button
              key={group.id}
              data-testid={`group-card-${group.id}`}
              onClick={() => onSelectGroup(group)}
              className="card w-full text-left hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{group.name}</h3>
                  <p className="text-slate-500 text-sm">
                    <Users className="inline w-4 h-4 mr-1" />
                    {group.members?.length || 0} members
                  </p>
                </div>
                <div className="text-3xl">🍿</div>
              </div>
            </button>
          ))}
          
          <button 
            data-testid="create-new-group-btn"
            onClick={onCreateGroup}
            className="btn-secondary mt-4"
          >
            <Plus className="inline w-5 h-5 mr-2" />
            Create New Group
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ==================== CREATE GROUP SCREEN ====================
const CreateGroupScreen = ({ onSubmit, onBack }) => {
  const [name, setName] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };
  
  return (
    <motion.div 
      className="mobile-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-white p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="game-title text-2xl">Create Group 🍿</h1>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-600 font-bold text-sm uppercase tracking-wide mb-2">
              Group Name
            </label>
            <input
              data-testid="group-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., College Squad, Family Fun"
              className="input-field"
              maxLength={30}
              autoFocus
            />
          </div>
          <button 
            data-testid="create-group-submit-btn"
            type="submit" 
            className="btn-primary"
            disabled={!name.trim()}
          >
            Create Group 🎉
          </button>
        </form>
      </div>
    </motion.div>
  );
};

// ==================== GROUP DASHBOARD ====================
const GroupDashboard = ({ group, currentUser, challenges, onCreateChallenge, onPlayChallenge, onBack, onShareInvite }) => {
  const sortedMembers = [...(group.members || [])].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const aRate = a.games_played ? (a.wins / a.games_played) : 0;
    const bRate = b.games_played ? (b.wins / b.games_played) : 0;
    return bRate - aRate;
  });
  
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const userPendingChallenges = activeChallenges.filter(c => 
    c.results?.some(r => r.player_id === currentUser?.id && r.status === 'pending')
  );
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}?group=${group.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied! 🎉');
  };
  
  return (
    <motion.div 
      className="mobile-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-4 mb-4">
        <button onClick={onBack} className="text-white p-2" data-testid="back-to-groups-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="game-title text-2xl flex-1">{group.name}</h1>
        <button onClick={copyInviteLink} className="text-white p-2" data-testid="share-invite-btn">
          <Share2 size={24} />
        </button>
      </div>
      
      {/* Group Stats */}
      <div className="glass-card mb-4">
        <div className="flex justify-around text-white text-center">
          <div>
            <div className="text-2xl font-black">{group.members?.length || 0}</div>
            <div className="text-xs uppercase tracking-wide opacity-80">Members</div>
          </div>
          <div>
            <div className="text-2xl font-black">{challenges.length}</div>
            <div className="text-xs uppercase tracking-wide opacity-80">Total Games</div>
          </div>
          <div>
            <div className="text-2xl font-black">{activeChallenges.length}</div>
            <div className="text-xs uppercase tracking-wide opacity-80">Active</div>
          </div>
        </div>
      </div>
      
      {/* Leaderboard */}
      <div className="card mb-4">
        <h2 className="text-lg font-black text-slate-800 mb-4">🏆 LEADERBOARD</h2>
        <div className="space-y-2">
          {sortedMembers.map((member, idx) => {
            const winRate = member.games_played > 0 
              ? Math.round((member.wins / member.games_played) * 100) 
              : 0;
            const isCurrentUser = member.user_id === currentUser?.id;
            
            return (
              <div 
                key={member.user_id}
                className={`flex items-center gap-3 p-3 rounded-xl ${isCurrentUser ? 'bg-purple-100' : 'bg-slate-50'}`}
              >
                <div className="text-2xl font-black text-purple-500 w-8">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-800">
                    {member.name} {isCurrentUser && '(You)'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {member.wins} wins | {winRate}% win rate
                  </div>
                </div>
                {member.win_streak > 0 && (
                  <div className="text-orange-500 font-bold flex items-center">
                    🔥 {member.win_streak}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Active Challenges */}
      <div className="card mb-4">
        <h2 className="text-lg font-black text-slate-800 mb-4">🔥 ACTIVE CHALLENGES</h2>
        
        {activeChallenges.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No active challenges. Create one!</p>
        ) : (
          <div className="space-y-2">
            {activeChallenges.map(challenge => {
              const isPending = challenge.results?.some(
                r => r.player_id === currentUser?.id && r.status === 'pending'
              );
              const completedCount = challenge.results?.filter(r => r.status !== 'pending').length || 0;
              const totalCount = challenge.results?.length || 0;
              
              return (
                <div 
                  key={challenge.id}
                  className={`p-3 rounded-xl border-2 ${isPending ? 'bg-orange-50 border-orange-300' : 'bg-slate-50 border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">
                        Challenge by {challenge.creator_name}
                      </div>
                      <div className="text-sm text-slate-500">
                        {completedCount}/{totalCount} completed
                      </div>
                    </div>
                    {isPending && (
                      <button
                        data-testid={`play-challenge-${challenge.id}`}
                        onClick={() => onPlayChallenge(challenge)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm"
                      >
                        Play Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Create Challenge Button */}
      <button 
        data-testid="create-challenge-btn"
        onClick={onCreateChallenge}
        className="btn-primary"
      >
        <Plus className="inline w-5 h-5 mr-2" />
        Create New Challenge
      </button>
    </motion.div>
  );
};

// ==================== CREATE CHALLENGE SCREEN ====================
const CreateChallengeScreen = ({ group, currentUser, onSubmit, onBack }) => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [actors, setActors] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [vowelLimit, setVowelLimit] = useState(3);
  const [filters, setFilters] = useState({ year: '', difficulty: '', actor: '' });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, actorsRes] = await Promise.all([
          axios.get(`${API}/movies`),
          axios.get(`${API}/movies/actors/list`)
        ]);
        setMovies(moviesRes.data);
        setFilteredMovies(moviesRes.data);
        setActors(actorsRes.data);
      } catch (e) {
        console.error('Failed to fetch movies', e);
      }
    };
    fetchData();
  }, []);
  
  useEffect(() => {
    let result = movies;
    
    if (filters.year) {
      const [start, end] = filters.year.split('-').map(Number);
      result = result.filter(m => m.year >= start && m.year <= end);
    }
    if (filters.difficulty) {
      result = result.filter(m => m.difficulty === parseInt(filters.difficulty));
    }
    if (filters.actor) {
      result = result.filter(m => m.actors.toLowerCase().includes(filters.actor.toLowerCase()));
    }
    
    setFilteredMovies(result);
  }, [filters, movies]);
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(
        group.members
          .filter(m => m.user_id !== currentUser.id)
          .map(m => m.user_id)
      );
    }
    setSelectAll(!selectAll);
  };
  
  const toggleParticipant = (userId) => {
    if (selectedParticipants.includes(userId)) {
      setSelectedParticipants(prev => prev.filter(id => id !== userId));
      setSelectAll(false);
    } else {
      setSelectedParticipants(prev => [...prev, userId]);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedMovie || selectedParticipants.length === 0) return;
    onSubmit({
      movie_id: selectedMovie.id,
      participant_ids: selectedParticipants,
      vowel_limit: vowelLimit
    });
  };
  
  const getDifficultyStars = (diff) => {
    return '⭐'.repeat(diff);
  };
  
  const otherMembers = group.members?.filter(m => m.user_id !== currentUser?.id) || [];
  
  return (
    <motion.div 
      className="mobile-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-white p-2">
          <ArrowLeft size={24} />
        </button>
        <h1 className="game-title text-2xl">Create Challenge</h1>
      </div>
      
      {/* Select Participants */}
      <div className="card mb-4">
        <h3 className="font-bold text-slate-800 mb-3">Who do you want to challenge?</h3>
        
        {otherMembers.length === 0 ? (
          <p className="text-slate-500 text-sm">
            No other members yet. Share the group invite link first!
          </p>
        ) : (
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="w-5 h-5 accent-purple-500"
              />
              <span className="font-bold text-slate-800">
                Challenge Entire Group ({otherMembers.length} people)
              </span>
            </label>
            
            {otherMembers.map(member => (
              <label 
                key={member.user_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedParticipants.includes(member.user_id)}
                  onChange={() => toggleParticipant(member.user_id)}
                  className="w-5 h-5 accent-purple-500"
                />
                <span className="text-slate-700">{member.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      
      {/* Choose Movie */}
      <div className="card mb-4">
        <h3 className="font-bold text-slate-800 mb-3">Choose a Movie</h3>
        
        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <select
            value={filters.year}
            onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
            className="flex-1 min-w-[100px] p-2 rounded-lg border-2 border-slate-200 text-sm font-bold"
          >
            <option value="">All Years</option>
            <option value="1995-2000">1995-2000</option>
            <option value="2001-2010">2001-2010</option>
            <option value="2011-2020">2011-2020</option>
            <option value="2021-2025">2021-2025</option>
          </select>
          
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="flex-1 min-w-[100px] p-2 rounded-lg border-2 border-slate-200 text-sm font-bold"
          >
            <option value="">All Difficulty</option>
            <option value="1">⭐ Easy</option>
            <option value="2">⭐⭐ Medium</option>
            <option value="3">⭐⭐⭐ Hard</option>
          </select>
          
          <select
            value={filters.actor}
            onChange={(e) => setFilters(prev => ({ ...prev, actor: e.target.value }))}
            className="flex-1 min-w-[100px] p-2 rounded-lg border-2 border-slate-200 text-sm font-bold"
          >
            <option value="">All Actors</option>
            {actors.map(actor => (
              <option key={actor} value={actor}>{actor}</option>
            ))}
          </select>
        </div>
        
        {/* Movie List */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {filteredMovies.map(movie => (
            <button
              key={movie.id}
              onClick={() => setSelectedMovie(movie)}
              className={`w-full p-3 rounded-xl text-left border-2 transition-all ${
                selectedMovie?.id === movie.id 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-purple-600 font-bold">
                    {getDifficultyStars(movie.difficulty)} {movie.year}
                  </div>
                  <div className="text-slate-600 text-sm">{movie.actors}</div>
                </div>
                {selectedMovie?.id === movie.id && (
                  <Check className="text-purple-500" size={20} />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Vowel Limit */}
      <div className="card mb-4">
        <h3 className="font-bold text-slate-800 mb-3">Max vowels in first 5 tries</h3>
        <select
          value={vowelLimit}
          onChange={(e) => setVowelLimit(parseInt(e.target.value))}
          className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold"
        >
          <option value={2}>2 vowels (Hard)</option>
          <option value={3}>3 vowels (Default)</option>
          <option value={4}>4 vowels (Easy)</option>
          <option value={5}>5 vowels (No limit)</option>
        </select>
      </div>
      
      {/* Submit */}
      <button
        data-testid="send-challenge-btn"
        onClick={handleSubmit}
        disabled={!selectedMovie || selectedParticipants.length === 0}
        className={`btn-primary ${(!selectedMovie || selectedParticipants.length === 0) ? 'opacity-50' : ''}`}
      >
        Send Challenge 🎬
      </button>
    </motion.div>
  );
};

// ==================== GROUP INVITE SCREEN ====================
const GroupInviteScreen = ({ group, onJoin, userName }) => {
  return (
    <motion.div 
      className="mobile-container justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🍿</div>
        <h1 className="game-title text-3xl">Join {group.name}!</h1>
        <p className="text-white/80 text-lg mt-2">
          Created by {group.creator_name}
        </p>
      </div>
      
      <div className="card text-center">
        <div className="mb-6">
          <div className="text-slate-600 font-bold mb-2">
            <Users className="inline w-5 h-5 mr-2" />
            {group.members?.length || 0} members
          </div>
        </div>
        
        <button 
          data-testid="join-group-btn"
          onClick={onJoin}
          className="btn-primary"
        >
          Join Group 🎉
        </button>
      </div>
    </motion.div>
  );
};

// ==================== SOLO PLAY SCREEN ====================
const SoloPlayScreen = ({ onPlay, onBack }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`${API}/movies`);
        setMovies(res.data);
      } catch (e) {
        console.error('Failed to fetch movies', e);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);
  
  const startRandomGame = () => {
    if (movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      onPlay(randomMovie);
    }
  };
  
  return (
    <motion.div 
      className="mobile-container justify-center"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="text-center mb-8">
        <div className="text-7xl mb-4">🎬</div>
        <h1 className="game-title">Solo Play</h1>
        <p className="text-white/80 text-lg mt-2">Test your Bollywood knowledge!</p>
      </div>
      
      <div className="card text-center">
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span className="text-2xl">❤️</span>
            <span className="font-bold">5 lives</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <span className="text-2xl">🎯</span>
            <span className="font-bold">Max 3 vowels in first 5 tries</span>
          </div>
        </div>
        
        <button 
          data-testid="start-solo-game-btn"
          onClick={startRandomGame}
          className="btn-primary mb-3"
          disabled={loading || movies.length === 0}
        >
          {loading ? 'Loading...' : 'Play Random Movie 🎲'}
        </button>
        
        <button 
          onClick={onBack}
          className="btn-ghost"
        >
          Back to Menu
        </button>
      </div>
    </motion.div>
  );
};

// ==================== MAIN APP ====================
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState('loading');
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [groupChallenges, setGroupChallenges] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [urlParams, setUrlParams] = useState(null); // Start as null to detect when parsed
  const [pendingGroupJoin, setPendingGroupJoin] = useState(null);
  const [pendingChallenge, setPendingChallenge] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  
  // Load user from localStorage and parse URL params
  useEffect(() => {
    const savedUser = localStorage.getItem('bh_currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setUserLoaded(true);
    
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challenge');
    const groupId = params.get('group');
    setUrlParams({ challenge: challengeId, group: groupId });
  }, []);
  
  // Handle initial routing - only run after URL params are parsed
  useEffect(() => {
    const init = async () => {
      if (urlParams.challenge) {
        // Challenge link - load challenge
        try {
          const res = await axios.get(`${API}/challenges/${urlParams.challenge}`);
          setPendingChallenge(res.data);
          
          if (!currentUser) {
            setScreen('welcome');
          } else {
            // Load movie and start game
            const movieRes = await axios.get(`${API}/movies/${res.data.movie_id}`);
            setCurrentMovie(movieRes.data);
            setCurrentChallenge(res.data);
            setScreen('challenge-landing');
          }
        } catch (e) {
          console.error('Failed to load challenge', e);
          setScreen(currentUser ? 'groups' : 'welcome');
        }
      } else if (urlParams.group) {
        // Group invite link
        try {
          const res = await axios.get(`${API}/groups/${urlParams.group}`);
          setPendingGroupJoin(res.data);
          
          if (!currentUser) {
            setScreen('welcome');
          } else {
            // Check if already a member
            const isMember = res.data.members?.some(m => m.user_id === currentUser.id);
            if (isMember) {
              setCurrentGroup(res.data);
              await loadGroupChallenges(res.data.id);
              setScreen('group-dashboard');
            } else {
              setScreen('group-invite');
            }
          }
        } catch (e) {
          console.error('Failed to load group', e);
          setScreen(currentUser ? 'groups' : 'welcome');
        }
      } else if (currentUser) {
        // Returning user - show groups
        await loadUserGroups();
        setScreen('groups');
      } else {
        // New user
        setScreen('welcome');
      }
    };
    
    // Only run init after URL params are parsed (not null) and user loading is complete
    if (screen === 'loading' && urlParams !== null && userLoaded) {
      init();
    }
  }, [currentUser, urlParams, screen, userLoaded]);
  
  const loadUserGroups = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API}/users/${currentUser.id}/groups`);
      setGroups(res.data);
    } catch (e) {
      console.error('Failed to load groups', e);
    }
  };
  
  const loadGroupChallenges = async (groupId) => {
    try {
      const res = await axios.get(`${API}/groups/${groupId}/challenges`);
      setGroupChallenges(res.data);
    } catch (e) {
      console.error('Failed to load challenges', e);
    }
  };
  
  // Create user
  const handleCreateUser = async (name) => {
    try {
      const res = await axios.post(`${API}/users`, { name });
      const user = res.data;
      setCurrentUser(user);
      localStorage.setItem('bh_currentUser', JSON.stringify(user));
      
      // Handle pending actions
      if (pendingGroupJoin) {
        // Check if already member (shouldn't be for new user)
        setScreen('group-invite');
      } else if (pendingChallenge) {
        const movieRes = await axios.get(`${API}/movies/${pendingChallenge.movie_id}`);
        setCurrentMovie(movieRes.data);
        setCurrentChallenge(pendingChallenge);
        setScreen('challenge-landing');
      } else {
        await loadUserGroups();
        setScreen('groups');
      }
    } catch (e) {
      console.error('Failed to create user', e);
      toast.error('Failed to create user');
    }
  };
  
  // Join group
  const handleJoinGroup = async () => {
    if (!pendingGroupJoin || !currentUser) return;
    
    try {
      const res = await axios.post(
        `${API}/groups/${pendingGroupJoin.id}/join?user_id=${currentUser.id}&user_name=${encodeURIComponent(currentUser.name)}`
      );
      
      setCurrentGroup(res.data.group);
      await loadGroupChallenges(pendingGroupJoin.id);
      await loadUserGroups();
      setPendingGroupJoin(null);
      
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      
      toast.success('Joined group! 🎉');
      setScreen('group-dashboard');
    } catch (e) {
      console.error('Failed to join group', e);
      toast.error('Failed to join group');
    }
  };
  
  // Create group
  const handleCreateGroup = async (name) => {
    try {
      const res = await axios.post(`${API}/groups`, {
        name,
        creator_id: currentUser.id,
        creator_name: currentUser.name
      });
      
      setCurrentGroup(res.data);
      setGroupChallenges([]);
      await loadUserGroups();
      
      toast.success('Group created! 🎉');
      setScreen('group-dashboard');
    } catch (e) {
      console.error('Failed to create group', e);
      toast.error('Failed to create group');
    }
  };
  
  // Select group
  const handleSelectGroup = async (group) => {
    setCurrentGroup(group);
    await loadGroupChallenges(group.id);
    setScreen('group-dashboard');
  };
  
  // Create challenge
  const handleCreateChallenge = async ({ movie_id, participant_ids, vowel_limit }) => {
    try {
      const res = await axios.post(`${API}/challenges`, {
        group_id: currentGroup.id,
        creator_id: currentUser.id,
        creator_name: currentUser.name,
        movie_id,
        vowel_limit,
        participant_ids
      });
      
      await loadGroupChallenges(currentGroup.id);
      toast.success('Challenge sent! 🎬');
      setScreen('group-dashboard');
    } catch (e) {
      console.error('Failed to create challenge', e);
      toast.error('Failed to create challenge');
    }
  };
  
  // Play challenge
  const handlePlayChallenge = async (challenge) => {
    try {
      const movieRes = await axios.get(`${API}/movies/${challenge.movie_id}`);
      setCurrentMovie(movieRes.data);
      setCurrentChallenge(challenge);
      setScreen('gameplay');
    } catch (e) {
      console.error('Failed to load movie', e);
      toast.error('Failed to load challenge');
    }
  };
  
  // Accept challenge from landing
  const handleAcceptChallenge = () => {
    setScreen('gameplay');
  };
  
  // Complete game
  const handleGameComplete = async (won, tries) => {
    // Submit result if it's a challenge
    if (currentChallenge) {
      try {
        await axios.post(`${API}/challenges/${currentChallenge.id}/result`, {
          challenge_id: currentChallenge.id,
          player_id: currentUser.id,
          player_name: currentUser.name,
          won,
          tries,
          hints_used: 0
        });
        
        // Reload group data if we have a group
        if (currentGroup) {
          const groupRes = await axios.get(`${API}/groups/${currentGroup.id}`);
          setCurrentGroup(groupRes.data);
          await loadGroupChallenges(currentGroup.id);
        }
      } catch (e) {
        console.error('Failed to submit result', e);
      }
    }
    
    // Get updated user stats
    const userStats = currentGroup?.members?.find(m => m.user_id === currentUser.id) || {
      wins: won ? 1 : 0,
      win_streak: won ? 1 : 0
    };
    
    setGameResult({ won, tries, userStats });
    await loadUserGroups();
    setScreen('results');
  };
  
  // Solo play complete
  const handleSoloGameComplete = (won, tries) => {
    setGameResult({ 
      won, 
      tries, 
      userStats: { wins: won ? 1 : 0, win_streak: won ? 1 : 0 }
    });
    setScreen('results');
  };
  
  // Play solo random
  const handlePlaySolo = (movie) => {
    setCurrentMovie(movie);
    setCurrentChallenge(null);
    setScreen('gameplay');
  };
  
  // Clear URL and go to groups
  const goToGroups = async () => {
    window.history.replaceState({}, '', window.location.pathname);
    await loadUserGroups();
    setCurrentChallenge(null);
    setCurrentMovie(null);
    setGameResult(null);
    setScreen('groups');
  };
  
  return (
    <div className="app-background min-h-screen">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'white',
            color: '#1e293b',
            fontWeight: 'bold',
            borderRadius: '1rem'
          }
        }}
      />
      
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <div className="mobile-container justify-center items-center">
            <div className="text-6xl animate-bounce">🎬</div>
          </div>
        )}
        
        {screen === 'welcome' && (
          <WelcomeScreen key="welcome" onSubmit={handleCreateUser} />
        )}
        
        {screen === 'challenge-landing' && (
          <ChallengeLanding 
            key="challenge-landing"
            challenge={currentChallenge}
            challenger={currentChallenge?.creator_name}
            onAccept={handleAcceptChallenge}
            userName={currentUser?.name}
          />
        )}
        
        {screen === 'group-invite' && pendingGroupJoin && (
          <GroupInviteScreen 
            key="group-invite"
            group={pendingGroupJoin}
            onJoin={handleJoinGroup}
            userName={currentUser?.name}
          />
        )}
        
        {screen === 'gameplay' && currentMovie && (
          <GameplayScreen 
            key="gameplay"
            movie={currentMovie}
            vowelLimit={currentChallenge?.vowel_limit || 3}
            onComplete={currentChallenge ? handleGameComplete : handleSoloGameComplete}
            challengeId={currentChallenge?.id}
          />
        )}
        
        {screen === 'results' && (
          <ResultsScreen 
            key="results"
            won={gameResult?.won}
            movie={currentMovie}
            tries={gameResult?.tries}
            userStats={gameResult?.userStats}
            onCreateGroup={() => setScreen('create-group')}
            onPlayAnother={() => setScreen('solo-play')}
            onGoToGroups={goToGroups}
            hasGroups={groups.length > 0}
          />
        )}
        
        {screen === 'groups' && (
          <MyGroupsScreen 
            key="groups"
            groups={groups}
            onSelectGroup={handleSelectGroup}
            onCreateGroup={() => setScreen('create-group')}
          />
        )}
        
        {screen === 'create-group' && (
          <CreateGroupScreen 
            key="create-group"
            onSubmit={handleCreateGroup}
            onBack={goToGroups}
          />
        )}
        
        {screen === 'group-dashboard' && currentGroup && (
          <GroupDashboard 
            key="group-dashboard"
            group={currentGroup}
            currentUser={currentUser}
            challenges={groupChallenges}
            onCreateChallenge={() => setScreen('create-challenge')}
            onPlayChallenge={handlePlayChallenge}
            onBack={goToGroups}
          />
        )}
        
        {screen === 'create-challenge' && currentGroup && (
          <CreateChallengeScreen 
            key="create-challenge"
            group={currentGroup}
            currentUser={currentUser}
            onSubmit={handleCreateChallenge}
            onBack={() => setScreen('group-dashboard')}
          />
        )}
        
        {screen === 'solo-play' && (
          <SoloPlayScreen 
            key="solo-play"
            onPlay={handlePlaySolo}
            onBack={goToGroups}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;