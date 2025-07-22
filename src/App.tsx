import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User, Cafe } from './types';
import { Coffee, Plus, LogOut, Search, Users, User as UserIcon, Info, Clock, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import CursorTrail from './components/CursorTrail';
import AuthModal from './components/AuthModal';
import CreateCafeModal from './components/CreateCafeModal';
import CafeCard from './components/CafeCard';
import CafeRoom from './components/CafeRoom';
import UserProfile from './components/UserProfile';
import BartenderChat from './components/BartenderChat';
import InfoPanel from './components/InfoPanel';
import ProfileCompletionReminder from './components/ProfileCompletionReminder';
import ProfileEditModal from './components/ProfileEditModal';
import HomePage from './components/HomePage';
import { useNavigate } from 'react-router-dom';
import FocusRoom from './components/FocusRoom';
import MobileNavDrawer from './components/MobileNavDrawer';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showBartenderChat, setShowBartenderChat] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'browse'>('home');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const navigate = useNavigate();

  const checkProfileCompletion = (user: User) => {
    // Show reminder if profile is not completed and hasn't been dismissed this session
    const isProfileCompleted = user.user_profiles?.profile_completed ?? false;
    if (!isProfileCompleted) {
      const dismissedThisSession = sessionStorage.getItem(`profile-reminder-dismissed-${user.id}`);
      if (!dismissedThisSession) {
        setShowProfileReminder(true);
      }
    }
  };

  const handleCompleteProfile = () => {
    setShowProfileReminder(false);
    setShowProfileEditModal(true);
  };

  const handleDismissReminder = () => {
    setShowProfileReminder(false);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    // If profile was just completed, hide the reminder
    if (updatedUser.user_profiles?.profile_completed) {
      setShowProfileReminder(false);
    }
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select(`
            *,
            user_profiles (*)
          `)
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
            console.error('Error creating user profile - check database configuration');
          } else {
            setUser(createdUser);
            checkProfileCompletion(createdUser);
          }
        } else if (!error && userData) {
          setUser(userData);
          checkProfileCompletion(userData);
        }
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
        current_members: cafe.cafe_members?.filter((member: { status: string }) => member.status === 'active').length || 0
      }));
      
      setCafes(cafesWithMemberCount);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clean up URL on initial load if it has OAuth tokens
        if (window.location.hash.includes('access_token')) {
          // Let Supabase handle the OAuth callback first
          setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 1000);
        }
        
        // Test Supabase connection
        try {
          await supabase.from('users').select('count').limit(1);
        } catch (testError) {
          console.error('Supabase connection failed:', testError);
        }
        
        await checkUser();
        await fetchCafes();
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth state changes (for OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Clean up URL after OAuth callback
          if (window.location.hash.includes('access_token')) {
            // Replace current URL with clean version (removes hash parameters)
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          
          // User signed in via OAuth, check if profile exists
          const { data: userData, error } = await supabase
            .from('users')
            .select(`
              *,
              user_profiles (*)
            `)
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
              console.error('Error creating user profile - check database configuration');
            } else {
              setUser(createdUser);
              checkProfileCompletion(createdUser);
            }
          } else if (!error && userData) {
            setUser(userData);
            checkProfileCompletion(userData);
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

  // Add router for /focusroom
  const isFocusRoom = window.location.pathname === '/focusroom';
  if (isFocusRoom && user) {
    return <FocusRoom currentUser={user} onExit={() => navigate('/')} />;
  }

  return (
    <>
      <CursorTrail />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        {/* Header */}
        <header className="bg-coffee-dark backdrop-blur-sm shadow-sm border-b border-coffee-medium/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-6">
                {/* Mobile Menu Button */}
                {user && (
                  <button
                    onClick={() => setShowMobileNav(true)}
                    className="p-2 text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium rounded-lg transition-all md:hidden"
                    style={{ minHeight: '44px', minWidth: '44px' }}
                    aria-label="Open navigation menu"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-accent to-golden-accent rounded-xl shadow-lg">
                    <Coffee className="h-6 w-6 text-text-inverse" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-text-inverse">Manziil Café</h1>
                    <p className="text-xs text-text-inverse/80 hidden sm:block">Your virtual social Cafe experience</p>
                  </div>
                </div>
                
                {/* Desktop Navigation */}
                {user && (
                  <nav className="hidden md:flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentView('home')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentView === 'home' 
                          ? 'bg-orange-accent text-text-inverse' 
                          : 'text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium'
                      }`}
                    >
                      Home
                    </button>
                    <button
                      onClick={() => setCurrentView('browse')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentView === 'browse' 
                          ? 'bg-orange-accent text-text-inverse' 
                          : 'text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium'
                      }`}
                    >
                      Browse Cafés
                    </button>
                  </nav>
                )}
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                {user ? (
                  <>
                    {/* Desktop User Section */}
                    <div className="hidden md:flex items-center space-x-3 text-sm">
                      <button
                        onClick={() => setShowUserProfile(true)}
                        className="w-8 h-8 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center text-text-inverse font-medium hover:scale-105 transition-transform"
                        style={{ minHeight: '44px', minWidth: '44px' }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </button>
                      <span className="text-text-inverse/90">Welcome, {user.name}</span>
                    </div>
                    
                    {/* Mobile/Tablet Actions */}
                    <button
                      onClick={() => setShowInfoPanel(true)}
                      className="p-2 text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium rounded-full transition-all md:hidden"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                      title="App Information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    
                    {/* Desktop Actions */}
                    <button
                      onClick={() => setShowInfoPanel(true)}
                      className="hidden md:block p-2 text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium rounded-full transition-all"
                      title="App Information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="hidden md:block p-2 text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium rounded-full transition-all"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowInfoPanel(true)}
                      className="p-2 text-text-inverse/80 hover:text-text-inverse hover:bg-coffee-medium rounded-full transition-all"
                      style={{ minHeight: '44px', minWidth: '44px' }}
                      title="App Information"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse px-4 md:px-6 py-2 rounded-lg font-medium hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-105 text-sm md:text-base"
                      style={{ minHeight: '44px' }}
                    >
                      <span className="hidden sm:inline">Join Now</span>
                      <span className="sm:hidden">Join</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        {user ? (
          currentView === 'home' ? (
            <HomePage
              user={user}
              onCreateCafe={() => setShowCreateModal(true)}
              onBrowseCafes={() => setCurrentView('browse')}
              onSelectCafe={handleCafeSelect}
              onOpenFocusRoom={() => navigate('/focusroom')}
              onOpenBartenderChat={() => setShowBartenderChat(true)}
            />
          ) : (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 min-h-screen">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto sm:mx-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search spaces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-cream-tertiary rounded-xl focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-cream-primary text-base"
                    style={{ minHeight: '48px' }}
                  />
                </div>
              </div>

              {/* Actions Bar - Mobile Optimized */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse px-6 py-3 rounded-xl font-medium hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-105 shadow-lg"
                    style={{ minHeight: '52px' }}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Create New Space</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                    <button
                      onClick={() => setShowBartenderChat(true)}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-coffee-medium to-coffee-light text-text-inverse px-4 sm:px-6 py-3 rounded-xl font-medium hover:from-coffee-medium/90 hover:to-coffee-light/90 transition-all transform hover:scale-105 shadow-lg"
                      style={{ minHeight: '52px' }}
                    >
                      <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">AI Bartender</span>
                    </button>
                    <button
                      onClick={() => navigate('/focusroom')}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-coffee-dark to-coffee-medium text-text-inverse px-4 sm:px-6 py-3 rounded-xl font-medium hover:from-coffee-dark/90 hover:to-coffee-medium/90 transition-all transform hover:scale-105 shadow-lg"
                      style={{ minHeight: '52px' }}
                    >
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">Focus Room</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spaces Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredCafes.length === 0 ? (
                  <div className="col-span-full text-center py-12 px-4">
                    <div className="bg-cream-primary rounded-2xl p-8 shadow-lg border border-cream-tertiary">
                      <Coffee className="h-16 w-16 text-text-muted mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-text-secondary mb-3">
                        {searchTerm ? 'No spaces found' : 'No spaces yet'}
                      </h3>
                      <p className="text-text-muted mb-6 max-w-md mx-auto leading-relaxed">
                        {searchTerm 
                          ? 'Try adjusting your search terms or browse all available spaces'
                          : 'Be the first to create a space and start the conversation!'
                        }
                      </p>
                      {!searchTerm && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse px-6 py-3 rounded-xl font-medium hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-105 shadow-lg"
                          style={{ minHeight: '48px' }}
                        >
                          Create First Space
                        </button>
                      )}
                    </div>
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
            </main>
          )
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
            <div className="text-center py-20 bg-warm-white rounded-2xl shadow-lg mx-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto"
              >
                <div className="mb-8">
                  <div className="p-4 bg-gradient-to-br from-orange-accent to-golden-accent rounded-2xl shadow-2xl inline-block mb-6">
                    <Coffee className="h-16 w-16 text-text-inverse" />
                  </div>
                  <h1 className="text-5xl font-bold text-text-primary mb-4">
                    Welcome to <span className="text-orange-accent">Manziil Café</span>
                  </h1>
                  <p className="text-xl text-text-secondary mb-8">
                    Create or join virtual spaces, chat with friends, order virtual treats, 
                    and get recommendations from our AI bartender. Your cozy corner in the digital world.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-cream-primary rounded-xl shadow-lg border border-cream-tertiary"
                  >
                    <div className="w-12 h-12 bg-orange-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Coffee className="h-6 w-6 text-orange-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Virtual Spaces</h3>
                    <p className="text-text-secondary text-sm">
                      Create themed spaces and invite friends for cozy conversations
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-cream-primary rounded-xl shadow-lg border border-cream-tertiary"
                  >
                    <div className="w-12 h-12 bg-coffee-medium/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Users className="h-6 w-6 text-coffee-medium" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Real-time Chat</h3>
                    <p className="text-text-secondary text-sm">
                      Engage in live conversations with fellow space visitors
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-cream-primary rounded-xl shadow-lg border border-cream-tertiary"
                  >
                    <div className="w-12 h-12 bg-golden-accent/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                      <Coffee className="h-6 w-6 text-golden-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">AI Bartender</h3>
                    <p className="text-text-secondary text-sm">
                      Get personalized recommendations and assistance from our AI helper
                    </p>
                  </motion.div>
                </div>

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse px-8 py-4 rounded-xl font-semibold text-lg hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Your VirtualCafe Journey
                </button>
              </motion.div>
            </div>
          </main>
        )}

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
            onUpdate={handleProfileUpdate}
            onClose={() => setShowUserProfile(false)}
          />
        )}

        {user && showBartenderChat && (
          <BartenderChat
            currentUser={user}
            onClose={() => setShowBartenderChat(false)}
          />
        )}

        {user && showProfileReminder && (
          <ProfileCompletionReminder
            user={user}
            onCompleteProfile={handleCompleteProfile}
            onDismiss={handleDismissReminder}
          />
        )}

        {user && showProfileEditModal && (
          <ProfileEditModal
            user={user}
            isOpen={showProfileEditModal}
            onClose={() => setShowProfileEditModal(false)}
            onUpdate={handleProfileUpdate}
            isFirstTime={!(user.user_profiles?.profile_completed ?? false)}
          />
        )}

        <InfoPanel
          isOpen={showInfoPanel}
          onClose={() => setShowInfoPanel(false)}
        />

        {/* Mobile Navigation Drawer */}
        {user && (
          <MobileNavDrawer
            isOpen={showMobileNav}
            onClose={() => setShowMobileNav(false)}
            user={user}
            currentView={currentView}
            onHomeClick={() => setCurrentView('home')}
            onBrowseClick={() => setCurrentView('browse')}
            onFocusRoomClick={() => navigate('/focusroom')}
            onBartenderClick={() => setShowBartenderChat(true)}
            onProfileClick={() => setShowUserProfile(true)}
            onInfoClick={() => setShowInfoPanel(true)}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </>
  );
}

export default App;