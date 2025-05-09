import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { movieService } from "../services/api";
import { Movie } from "../Data/MovieInterfaces";
import { useTheater } from "../context/TheaterContext";

// 🎥 Trailer mappings
const trailerMappings: Record<number, string> = {
  1: "https://www.youtube.com/watch?v=YoHD9XEInc0",
  2: "https://www.youtube.com/watch?v=eOrNdBpGMv8",
  3: "https://www.youtube.com/watch?v=d9MyW72ELq0",
  4: "https://www.youtube.com/watch?v=mqqft2x_Aa4",
  5: "https://www.youtube.com/watch?v=JfVOs4VSpmA",
  6: "https://www.youtube.com/watch?v=8g18jFHCLXk",
  7: "https://www.youtube.com/watch?v=wxN1T1uxQ2g",
  8: "https://www.youtube.com/watch?v=giXco2jaZ_4",
  9: "https://www.youtube.com/watch?v=_Z3QKkl1WyM",
  10: "https://www.youtube.com/watch?v=PLl99DlL6b4",
  11: "https://www.youtube.com/watch?v=V75dMMIW2B4",
  12: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
  13: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
  14: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
  15: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
  16: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
  17: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
  18: "https://www.youtube.com/watch?v=xlnPHQ3TLX8",
  19: "https://www.youtube.com/watch?v=DzfpyUB60YY",
};

const getYoutubeId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/
  );
  return match ? match[1] : null;
};

const MovieDescriptionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theater, loadingTheater } = useTheater();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const movieData = await movieService.getById(parseInt(id, 10));
        setMovie(movieData);
      } catch (err) {
        console.error("Error fetching movie details:", err);
        setError("Failed to load movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  if (loadingTheater || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-xl">⏳ Loading movie & theater info...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="text-xl text-red-500">{error || "Movie not found"}</div>
      </div>
    );
  }

  const trailerUrl = movie.id ? trailerMappings[movie.id] : null;
  const youtubeId = trailerUrl ? getYoutubeId(trailerUrl) : null;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black text-white p-6 min-h-screen">
      <h1 className="text-5xl font-extrabold text-center mb-8">{movie.title}</h1>

      <div className="flex flex-col lg:flex-row justify-center gap-10 items-start mb-10 max-w-6xl mx-auto">
        {youtubeId ? (
          <div className="w-full max-w-2xl aspect-video">
            <iframe
              className="w-full h-full rounded-xl"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`}
              title={`${movie.title} Trailer`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="text-gray-400">Trailer unavailable</p>
        )}

        <div className="flex flex-col items-center">
          <motion.img
            src={movie.posterUrl}
            alt={movie.title}
            className="rounded-xl border-4 border-purple-500 shadow-xl w-64 mb-4 hover:scale-105 transition-transform"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            onError={(e) => {
              e.currentTarget.src = "/images/placeholder-poster.jpg";
            }}
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 transition px-8 py-3 rounded-xl text-lg font-semibold shadow-md shadow-red-500"
            onClick={() => {
              if (!theater) {
                alert("Please select a theater before booking.");
                return;
              }
              navigate(`/showtimes/${movie.id}`);
            }}
            
          >
            🎟️ Book Now
          </motion.button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <span className="px-3 py-1 bg-red-600 rounded-full text-sm">{movie.genre}</span>
          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">{movie.duration} min</span>
          <span className="px-3 py-1 bg-gray-700 rounded-full text-sm">
            {new Date(movie.releaseDate).getFullYear()}
          </span>
          {movie.rating && (
            <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm">
              Rating: {movie.rating}
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">Description</h2>
        <p className="text-gray-300 mb-4 leading-relaxed text-lg">
          {movie.description || "No description available."}
        </p>

        <h2 className="text-xl font-semibold">Director</h2>
        <p className="text-gray-300 mb-4">{movie.director || "Unknown"}</p>

        <p className="text-sm text-gray-500 italic">
          📍 Selected Theater: {theater?.name || "None"}
        </p>

        <div className="mt-10">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition"
          >
            ← Back to Movies
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDescriptionPage;
