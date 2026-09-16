/**
 * MYTV Movies Module
 * Handles movie data, genres, and filtering
 */

class Movies {
    constructor() {
        this.storage = new Storage();
        this.movies = [];
        this.genres = [];
        this.currentGenre = 'All';
        this.searchQuery = '';
        
        this.init();
    }

    /**
     * Initialize movies
     */
    init() {
        // Load mock movie data
        this.loadMockMovies();
    }

    /**
     * Load mock movie data for demo
     */
    loadMockMovies() {
        this.movies = [
            {
                id: 101,
                title: 'Inception',
                year: 2010,
                genre: 'Sci-Fi',
                rating: 8.8,
                duration: '148 min',
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                cast: 'Leonardo DiCaprio, Marion Cotillard, Ellen Page',
                director: 'Christopher Nolan',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 102,
                title: 'The Dark Knight',
                year: 2008,
                genre: 'Action',
                rating: 9.0,
                duration: '152 min',
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                cast: 'Christian Bale, Heath Ledger, Aaron Eckhart',
                director: 'Christopher Nolan',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 103,
                title: 'Pulp Fiction',
                year: 1994,
                genre: 'Crime',
                rating: 8.9,
                duration: '154 min',
                description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
                cast: 'John Travolta, Uma Thurman, Samuel L. Jackson',
                director: 'Quentin Tarantino',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 104,
                title: 'The Shawshank Redemption',
                year: 1994,
                genre: 'Drama',
                rating: 9.3,
                duration: '142 min',
                description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
                cast: 'Tim Robbins, Morgan Freeman',
                director: 'Frank Darabont',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 105,
                title: 'Forrest Gump',
                year: 1994,
                genre: 'Drama',
                rating: 8.8,
                duration: '142 min',
                description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man with an IQ of 75.',
                cast: 'Tom Hanks, Robin Wright, Gary Sinise',
                director: 'Robert Zemeckis',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 106,
                title: 'The Matrix',
                year: 1999,
                genre: 'Sci-Fi',
                rating: 8.7,
                duration: '136 min',
                description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
                cast: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss',
                director: 'The Wachowskis',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 107,
                title: 'Goodfellas',
                year: 1990,
                genre: 'Crime',
                rating: 8.7,
                duration: '145 min',
                description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
                cast: 'Robert De Niro, Ray Liotta, Joe Pesci',
                director: 'Martin Scorsese',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 108,
                title: 'The Silence of the Lambs',
                year: 1991,
                genre: 'Thriller',
                rating: 8.6,
                duration: '118 min',
                description: 'A young FBI cadet must receive the help of an incarcerated cannibal killer to catch another serial killer.',
                cast: 'Jodie Foster, Anthony Hopkins',
                director: 'Jonathan Demme',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 109,
                title: 'Gladiator',
                year: 2000,
                genre: 'Action',
                rating: 8.5,
                duration: '155 min',
                description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
                cast: 'Russell Crowe, Joaquin Phoenix',
                director: 'Ridley Scott',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 110,
                title: 'The Departed',
                year: 2006,
                genre: 'Crime',
                rating: 8.5,
                duration: '151 min',
                description: 'An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in Boston.',
                cast: 'Leonardo DiCaprio, Matt Damon, Jack Nicholson',
                director: 'Martin Scorsese',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 111,
                title: 'The Prestige',
                year: 2006,
                genre: 'Mystery',
                rating: 8.5,
                duration: '130 min',
                description: 'After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.',
                cast: 'Christian Bale, Hugh Jackman, Scarlett Johansson',
                director: 'Christopher Nolan',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 112,
                title: 'Interstellar',
                year: 2014,
                genre: 'Sci-Fi',
                rating: 8.6,
                duration: '169 min',
                description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
                cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
                director: 'Christopher Nolan',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 113,
                title: 'The Godfather',
                year: 1972,
                genre: 'Crime',
                rating: 9.2,
                duration: '175 min',
                description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
                cast: 'Marlon Brando, Al Pacino, James Caan',
                director: 'Francis Ford Coppola',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 114,
                title: 'Fight Club',
                year: 1999,
                genre: 'Drama',
                rating: 8.8,
                duration: '139 min',
                description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
                cast: 'Brad Pitt, Edward Norton, Helena Bonham Carter',
                director: 'David Fincher',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 115,
                title: 'The Avengers',
                year: 2012,
                genre: 'Action',
                rating: 8.0,
                duration: '143 min',
                description: 'Earth\'s mightiest heroes must come together and learn to fight as a team to stop Loki and his alien army.',
                cast: 'Robert Downey Jr., Chris Evans, Scarlett Johansson',
                director: 'Joss Whedon',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 116,
                title: 'The Conjuring',
                year: 2013,
                genre: 'Horror',
                rating: 7.5,
                duration: '112 min',
                description: 'Paranormal investigators work to help a family terrorized by a dark presence in their farmhouse.',
                cast: 'Patrick Wilson, Vera Farmiga, Lili Taylor',
                director: 'James Wan',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 117,
                title: 'Parasite',
                year: 2019,
                genre: 'Thriller',
                rating: 8.6,
                duration: '132 min',
                description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
                cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong',
                director: 'Bong Joon-ho',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 118,
                title: 'Joker',
                year: 2019,
                genre: 'Drama',
                rating: 8.4,
                duration: '122 min',
                description: 'In Gotham City, mentally troubled comedian Arthur Fleck embarks on a downward spiral of revolution and bloody crime.',
                cast: 'Joaquin Phoenix, Robert De Niro, Zazie Beetz',
                director: 'Todd Phillips',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 119,
                title: 'Dune',
                year: 2021,
                genre: 'Sci-Fi',
                rating: 8.0,
                duration: '155 min',
                description: 'A noble family becomes embroiled in a war for control over the galaxy\'s most valuable asset while its heir becomes troubled by visions of a dark future.',
                cast: 'Timothée Chalamet, Rebecca Ferguson, Zendaya',
                director: 'Denis Villeneuve',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            },
            {
                id: 120,
                title: 'Everything Everywhere All at Once',
                year: 2022,
                genre: 'Sci-Fi',
                rating: 7.8,
                duration: '139 min',
                description: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes.',
                cast: 'Michelle Yeoh, Stephanie Hsu, Ke Huy Quan',
                director: 'Daniel Kwan, Daniel Scheinert',
                stream_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
            }
        ];

        // Extract unique genres
        this.genres = ['All', ...new Set(this.movies.map(m => m.genre))].sort();
    }

    /**
     * Get all genres
     */
    getGenres() {
        return this.genres;
    }

    /**
     * Get filtered movies
     */
    getFilteredMovies() {
        let filtered = this.movies;

        // Filter by genre
        if (this.currentGenre !== 'All') {
            filtered = filtered.filter(m => m.genre === this.currentGenre);
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(m => 
                m.title.toLowerCase().includes(query) ||
                m.genre.toLowerCase().includes(query) ||
                m.cast.toLowerCase().includes(query) ||
                m.director.toLowerCase().includes(query)
            );
        }

        return filtered;
    }

    /**
     * Set genre filter
     */
    setGenre(genre) {
        this.currentGenre = genre;
    }

    /**
     * Set search query
     */
    setSearchQuery(query) {
        this.searchQuery = query;
    }

    /**
     * Get movie by ID
     */
    getMovieById(id) {
        return this.movies.find(m => m.id === parseInt(id));
    }

    /**
     * Toggle favorite movie
     */
    toggleFavorite(movieId) {
        const movie = this.getMovieById(movieId);
        if (!movie) return false;

        const isFavorited = this.storage.isFavorited(movieId, 'movie');

        if (isFavorited) {
            return this.storage.removeFavorite(movieId, 'movie');
        } else {
            return this.storage.addFavorite({
                id: movieId,
                type: 'movie',
                title: movie.title,
                genre: movie.genre,
                year: movie.year,
                rating: movie.rating,
                addedAt: new Date().toISOString()
            });
        }
    }

    /**
     * Check if movie is favorited
     */
    isFavorited(movieId) {
        return this.storage.isFavorited(movieId, 'movie');
    }

    /**
     * Add to recently watched
     */
    addToRecent(movieId) {
        const movie = this.getMovieById(movieId);
        if (!movie) return false;

        return this.storage.addRecent({
            id: movieId,
            type: 'movie',
            title: movie.title,
            genre: movie.genre,
            year: movie.year,
            rating: movie.rating
        });
    }
}

// Export for use in other modules
window.Movies = Movies;
