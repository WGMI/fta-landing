// Supabase configuration and database functions
const SUPABASE_URL = 'https://ugdyjgemjewzrdzyownp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZHlqZ2VtamV3enJkenlvd25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjQzMzMsImV4cCI6MjA3MjMwMDMzM30.Knjw3g3TTYR-9DHWlI5QqYdy3Vo72vG4vaFyGgxDrV0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database functions for leaderboard
const LeaderboardDB = {
    // Save a new score to the leaderboard
    async saveScore(name, game, score) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .insert([
                    { name: name, game: game, score: score }
                ]);
            
            if (error) {
                console.error('Error saving score:', error);
                return { success: false, error: error.message };
            }
            
            return { success: true, data: data };
        } catch (error) {
            console.error('Error saving score:', error);
            return { success: false, error: error.message };
        }
    },

    // Get leaderboard for a specific game
    async getLeaderboard(game, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .eq('game', game)
                .order('score', { ascending: false })
                .limit(limit);
            
            if (error) {
                console.error('Error fetching leaderboard:', error);
                return { success: false, error: error.message };
            }
            
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            return { success: false, error: error.message };
        }
    },

    // Get all leaderboards
    async getAllLeaderboards() {
        try {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('score', { ascending: false });
            
            if (error) {
                console.error('Error fetching all leaderboards:', error);
                return { success: false, error: error.message };
            }
            
            return { success: true, data: data };
        } catch (error) {
            console.error('Error fetching all leaderboards:', error);
            return { success: false, error: error.message };
        }
    }
};

// Export for use in other files
window.LeaderboardDB = LeaderboardDB;
