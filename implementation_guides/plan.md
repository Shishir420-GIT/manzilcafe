Step 1: Profile Editing Feature Implementation
Overview
Implement profile editing functionality with one-time reminder - the simplest feature to start with. This builds on existing user management without affecting core chat/focus functionality.
🎯 SINGLE FEATURE FOCUS
ONLY implement profile editing. Do NOT touch any other features or components.
What We're Adding
1. Enhanced Profile Modal
Extend the existing UserProfile.tsx component to include editing capabilities.
2. One-Time Profile Reminder
Add a gentle reminder for users to complete their profile after first login.
3. Profile Completion Tracking
Track whether users have completed their profile setup.
Database Schema (Already Created)
Since SQL tables are already created, we'll work with existing users table and add:
sql-- Assuming these columns exist in users table:
-- profile_completed boolean DEFAULT false
-- bio text
-- avatar_url text (already exists)
-- Additional fields as needed
Implementation Steps
Step 1: Update User Type
typescript// In src/types/index.ts - EXTEND existing User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'visitor' | 'host' | 'moderator';
  created_at: string;
  // ADD these new fields
  bio?: string;
  profile_completed?: boolean;
  timezone?: string;
  notification_preferences?: any;
}
Step 2: Create ProfileEditModal Component
typescript// Create new file: src/components/ProfileEditModal.tsx
import { useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface ProfileEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
  isFirstTime?: boolean; // For one-time reminder
}

// Component should include:
// - Name editing
// - Bio text area
// - Avatar URL input (or file upload if implemented)
// - Timezone selection
// - Save/Cancel buttons
// - Loading states
// - Error handling
Step 3: Create ProfileCompletionReminder Component
typescript// Create new file: src/components/ProfileCompletionReminder.tsx
import { useState, useEffect } from 'react';
import { User } from '../types';

interface ProfileCompletionReminderProps {
  user: User;
  onCompleteProfile: () => void;
  onDismiss: () => void;
}

// Component should:
// - Show only if profile_completed is false
// - Display once per session (use sessionStorage)
// - Have "Complete Profile" and "Maybe Later" buttons
// - Use warm, inviting copy that matches café theme
Step 4: Update UserProfile Component
typescript// MODIFY existing src/components/UserProfile.tsx
// Add these capabilities:
// - "Edit Profile" button
// - Integration with ProfileEditModal
// - Display bio field
// - Show profile completion status
// - Better stats display
Step 5: Integration with App.tsx
typescript// In App.tsx, add logic to:
// - Check profile completion status after login
// - Show ProfileCompletionReminder if needed
// - Handle profile updates
// - Mark profile as completed after first edit

// Add this logic in the user authentication section:
const checkProfileCompletion = (user: User) => {
  // Show reminder if profile_completed is false
  // Store in component state
  // Don't show more than once per session
};
Design Guidelines
Use Existing Coffee Color Palette
css/* Apply these colors consistently */
--coffee-dark: #4A3428      /* Modal headers, primary buttons */
--coffee-medium: #6B4E3D    /* Labels, secondary buttons */
--cream-primary: #F5E6D3    /* Modal backgrounds */
--orange-accent: #D2691E    /* Save buttons, call-to-action */
--golden-accent: #DAA520    /* Success states, highlights */
--warm-white: #FAF7F2       /* Input backgrounds */
Component Styling

Modal: Cream background with coffee-colored header
Form inputs: Warm white backgrounds with coffee borders
Save button: Orange accent with white text
Cancel button: Cream secondary with coffee text
Reminder banner: Golden accent with warm styling

Integration Points
Where to Add Profile Editing Access

Header navigation: Add profile icon/menu
Existing UserProfile modal: Add "Edit" button
User dropdown: Add "Edit Profile" option

Reminder Trigger Locations

After successful login: Check completion status
First app visit: Show gentle reminder
Navigation header: Small indicator if incomplete

Testing Checklist

 Profile modal opens and closes correctly
 All form fields save properly to database
 Profile completion status updates correctly
 One-time reminder shows only once per session
 Reminder dismissal works properly
 "Complete Profile" button works
 Profile changes reflect immediately in UI
 Error handling works for failed saves
 Loading states display correctly
 Mobile responsiveness maintained

Database Operations
Profile Update Query
typescript// Update user profile
const { data, error } = await supabase
  .from('users')
  .update({
    name: newName,
    bio: newBio,
    avatar_url: newAvatarUrl,
    profile_completed: true,
    updated_at: new Date().toISOString()
  })
  .eq('id', userId)
  .select()
  .single();
Profile Completion Check
typescript// Check if profile is complete
const { data: user } = await supabase
  .from('users')
  .select('profile_completed')
  .eq('id', userId)
  .single();
Security Considerations

Use existing authentication patterns
Validate all inputs before saving
Apply rate limiting to profile updates
Sanitize bio text input
Ensure users can only edit their own profiles

Files to Create/Modify
New Files

src/components/ProfileEditModal.tsx
src/components/ProfileCompletionReminder.tsx

Modified Files

src/components/UserProfile.tsx (add edit functionality)
src/App.tsx (add reminder logic)
src/types/index.ts (extend User interface)

Success Criteria
✅ Users can edit their profile information
✅ One-time reminder appears for new users
✅ Profile completion status is tracked
✅ All existing functionality remains intact
✅ Design matches coffee theme consistently
✅ Mobile experience is smooth
✅ No breaking changes to existing features
Next Steps After This Feature
Once this is working perfectly:

Test thoroughly
Commit changes
Move to Step 2: Home Page Feature
Then Step 3: Meditation Point
Then Step 4: Video Chat Rooms
Finally Step 5: Watch Party Features

Remember: Only implement profile editing in this step. Don't touch any other features!