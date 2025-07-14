import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User, Cafe } from './types';
import { Coffee, Plus, LogOut, Search, Users, User as UserIcon, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import CursorTrail from './components/CursorTrail';
import AuthModal from './components/AuthModal';
import CreateCafeModal from './components/CreateCafeModal';
import CafeCard from './components/CafeCard';
import CafeRoom from './components/CafeRoom';
import UserProfile from './components/UserProfile';
import BartenderChat from './components/BartenderChat';
import InfoPanel from './components/InfoPanel';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showBartenderChat, setShowBartenderChat] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const checkUser = async () => {
    try {
      console.log('Checking user session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      
      if (session?.user) {
        console.log('User found in session:', session.user.email);
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          console.log('Creating new user profile...');
          // User exists in auth but not in public.users table, create profile
          const newUser = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            role: session.user.user_metadata?.role || 'visitor',
            avatar_url: session.user.user_metadata?.avatar_url || null
          };

          const { data: createdUser, error: insertError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user profile:', insertError);
          } else {
            console.log('User profile created:', createdUser);
            setUser(createdUser);
          }
        } else if (!error && userData) {
          console.log('User profile found:', userData);
          setUser(userData);
        }
      } else {
        console.log('No user session found');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const fetchCafes = async () => {
    try {
      const { data, error } = await supabase
        .from('cafes')
        .select(`
          *,
          users!cafes_host_id_fkey(name),
          cafe_members(user_id, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Count current members for each space
      const cafesWithMemberCount = (data || []).map(cafe => ({
        ...cafe,
        host: cafe.users,
        current_members: cafe.cafe_members?.filter((member: any) => member.status === 'active').length || 0
      }));
      
      setCafes(cafesWithMemberCount);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Test Supabase connection
        try {
          const { data, error } = await supabase.from('users').select('count').limit(1);
          console.log('Supabase connection test:', { data, error });
        } catch (testError) {
          console.error('Supabase connection failed:', testError);
        }
        
        await checkUser();
        await fetchCafes();
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth state changes (for OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in via OAuth, check if profile exists
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code === 'PGRST116') {
            // User exists in auth but not in public.users table, create profile
            const newUser = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
              role: session.user.user_metadata?.role || 'visitor',
              avatar_url: session.user.user_metadata?.avatar_url || null
            };

            const { data: createdUser, error: insertError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user profile:', insertError);
            } else {
              setUser(createdUser);
            }
          } else if (!error && userData) {
            setUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSelectedCafe(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fallback to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedCafe(null);
  };

  const handleCafeSelect = (cafe: Cafe) => {
    setSelectedCafe(cafe);
  };

  const handleLeaveCafe = () => {
    setSelectedCafe(null);
  };

  const filteredCafes = cafes.filter(cafe =>
    cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cafe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-amber-800 font-medium">Loading Manziil Café...</span>
          </div>
          <button
            onClick={() => setLoading(false)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Skip Loading
          </button>
        </div>
      </div>
    );
  }

  if (selectedCafe && user) {
    return (
      <>
        <CursorTrail />
        <CafeRoom
          cafe={selectedCafe}
          currentUser={user}
          onLeave={handleLeaveCafe}
        />
      </>
    );
  }

  return (
    <>
      <CursorTrail />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-amber-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-xl shadow-lg">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Manziil Café</h1>
                  <p className="text-xs text-gray-600">Your virtual social space experience</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <div className="hidden sm:flex items-center space-x-3 text-sm">
                      <button
                        onClick={() => setShowUserProfile(true)}
                        className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-medium hover:scale-105 transition-transform"
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </button>
                      <span className="text-gray-700">Welcome, {user.name}</span>
                    </div>
                    <button
                      onClick={() => setShowUserProfile(true)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all sm:hidden"
                    >
                      <UserIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowInfoPanel(true)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
                      title="App Information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowInfoPanel(true)}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all"
                      title="App Information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:from-amber-700 hover:to-yellow-600 transition-all transform hover:scale-105"
                    >
                      Join Now
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {user ? (
            <>
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search spaces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:from-amber-700 hover:to-yellow-600 transition-all transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Space</span>
                  </button>
                  <button
                    onClick={() => setShowBartenderChat(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:from-amber-700 hover:to-yellow-600 transition-all transform hover:scale-105"
                  >
                    <Coffee className="h-4 w-4" />
                    <span>Connect with Bartender</span>
                  </button>
                </div>
              </div>

              {/* Spaces Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCafes.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      {searchTerm ? 'No spaces found' : 'No spaces yet'}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'Be the first to create a space and start the conversation!'
                      }
                    </p>
                  </div>
                ) : (
                  filteredCafes.map((cafe) => (
                    <CafeCard
                      key={cafe.id}
                      cafe={cafe}
                      onClick={() => handleCafeSelect(cafe)}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            /* Welcome Section */
            <div className="text-center py-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto"
              >
                <div className="mb-8">
                  <div className="p-4 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-2xl shadow-2xl inline-block mb-6">
                    <Coffee className="h-16 w-16 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold text-gray-800 mb-4">
                    Welcome to <span className="text-amber-600">Manziil Café</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Create or join virtual spaces, chat with friends, order virtual treats, 
                    and get recommendations from our AI bartender. Your cozy corner in the digital world.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-white rounded-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Coffee className="h-6 w-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Virtual Spaces</h3>
                    <p className="text-gray-600 text-sm">
                      Create themed spaces and invite friends for cozy conversations
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-white rounded-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Chat</h3>
                    <p className="text-gray-600 text-sm">
                      Engage in live conversations with fellow space visitors
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-white rounded-xl shadow-lg"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Coffee className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Bartender</h3>
                    <p className="text-gray-600 text-sm">
                      Get personalized recommendations and assistance from our AI helper
                    </p>
                  </motion.div>
                </div>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-amber-700 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Your Space Journey
                </button>
              </motion.div>
            </div>
          )}
        </main>

        {/* Modals */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            checkUser();
            fetchCafes();
          }}
        />

        {user && (
          <CreateCafeModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchCafes}
            userId={user.id}
          />
        )}

        {user && showUserProfile && (
          <UserProfile
            user={user}
            onUpdate={setUser}
            onClose={() => setShowUserProfile(false)}
          />
        )}

        {user && showBartenderChat && (
          <BartenderChat
            currentUser={user}
            onClose={() => setShowBartenderChat(false)}
          />
        )}

        <InfoPanel
          isOpen={showInfoPanel}
          onClose={() => setShowInfoPanel(false)}
        />
      </div>
    </>
  );
}

export default App;