import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { HomePageData, QuickStats, User } from '../types';

export const useHomeData = (user: User | null) => {
  const [data, setData] = useState<HomePageData>({
    stats: {
      totalCafesVisited: 0,
      totalTimeSpent: '0h 0m',
      favoriteTheme: 'cozy',
      currentStreak: 0,
      totalMessages: 0,
      totalOrders: 0,
      totalSessionsCompleted: 0
    },
    recentCafes: [],
    loading: true,
    error: null
  });

  const formatTimeSpent = (totalHours: number): string => {
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    return `${hours}h ${minutes}m`;
  };

  const calculateStreakDays = (joinDates: string[]): number => {
    if (joinDates.length === 0) return 0;
    
    const dates = joinDates
      .map(date => new Date(date).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    // Check if user was active today or yesterday to start counting streak
    if (dates[0] === today || dates[0] === yesterday) {
      streak = 1;
      let currentDate = new Date(dates[0]);
      
      for (let i = 1; i < dates.length; i++) {
        const nextDate = new Date(dates[i]);
        const dayDiff = (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          streak++;
          currentDate = nextDate;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  const getMostFrequentTheme = (themes: string[]): string => {
    if (themes.length === 0) return 'cozy';
    
    const themeCount = themes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(themeCount).reduce((a, b) => 
      themeCount[a] > themeCount[b] ? a : b
    );
  };

  const fetchHomeData = async () => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false, error: 'User not authenticated' }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch user's café memberships with café details
      const { data: cafeMembers, error: membersError } = await supabase
        .from('cafe_members')
        .select(`
          id,
          cafe_id,
          joined_at,
          status,
          cafes (
            id,
            name,
            description,
            theme,
            host_id,
            capacity,
            users!cafes_host_id_fkey (name, avatar_url)
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (membersError) throw membersError;

      // Fetch user's messages count
      const { count: messagesCount, error: messagesError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', user.id);

      if (messagesError) throw messagesError;

      // Fetch user's orders count
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (ordersError) throw ordersError;

      // Process the data
      const validCafeMembers = cafeMembers?.filter(member => member.cafes) || [];
      const joinDates = validCafeMembers.map(member => member.joined_at);
      const themes = validCafeMembers.map(member => member.cafes.theme);
      
      // Calculate stats
      const totalCafesVisited = new Set(validCafeMembers.map(member => member.cafe_id)).size;
      const estimatedHours = totalCafesVisited * 1.5; // Estimate 1.5 hours per café visit
      const currentStreak = calculateStreakDays(joinDates);
      const favoriteTheme = getMostFrequentTheme(themes);
      
      // Calculate completed sessions (café visits + estimated focus sessions)
      const cafeSessionsCompleted = validCafeMembers.length; // Each café membership = 1 session
      const estimatedFocusSessions = Math.floor(totalCafesVisited * 0.3); // Estimate 30% of café visits include focus sessions
      const totalSessionsCompleted = cafeSessionsCompleted + estimatedFocusSessions;

      const stats: QuickStats = {
        totalCafesVisited,
        totalTimeSpent: formatTimeSpent(estimatedHours),
        favoriteTheme,
        currentStreak,
        totalMessages: messagesCount || 0,
        totalOrders: ordersCount || 0,
        totalSessionsCompleted
      };

      // Get recent cafés (last 3 visited)
      const recentCafesData = validCafeMembers
        .slice(0, 3)
        .map(member => ({
          id: member.cafes.id,
          name: member.cafes.name,
          description: member.cafes.description,
          theme: member.cafes.theme,
          last_visited: member.joined_at,
          member_count: 0, // Will be populated separately if needed
          isOwner: member.cafes.host_id === user.id,
          host: {
            id: member.cafes.host_id,
            name: member.cafes.users.name,
            avatar_url: member.cafes.users.avatar_url,
            email: '',
            role: 'host' as const,
            created_at: ''
          }
        }));

      setData({
        stats,
        recentCafes: recentCafesData,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching home data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load home data'
      }));
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [user?.id]);

  const refetch = () => {
    fetchHomeData();
  };

  return { ...data, refetch };
};