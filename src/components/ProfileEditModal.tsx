import { useState, useRef, useEffect } from 'react';
import { Save, X, User as UserIcon, Globe, Upload } from 'lucide-react';
import { User as UserType } from '../types';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { compressImage, validateImageFile, formatFileSize, getDataUrlSize } from '../lib/imageUtils';

interface ProfileEditModalProps {
  user: UserType;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: UserType) => void;
  isFirstTime?: boolean;
}

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

const ProfileEditModal = ({ user, isOpen, onClose, onUpdate, isFirstTime = false }: ProfileEditModalProps) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    bio: user.user_profiles?.bio || '',
    timezone: user.user_profiles?.timezone || 'UTC',
    avatar_url: user.avatar_url || '',
    profile_picture_url: user.user_profiles?.profile_picture_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize image preview when modal opens
  useEffect(() => {
    if (isOpen && user.user_profiles?.profile_picture_url) {
      setImagePreview(user.user_profiles.profile_picture_url);
    } else {
      setImagePreview(null);
    }
  }, [isOpen, user.user_profiles?.profile_picture_url]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!formData.name.trim()) {
        throw new Error('Name is required');
      }

      if (formData.bio.length > 300) {
        throw new Error('Bio must be 300 characters or less');
      }

      // Validate URLs if provided
      if (formData.avatar_url.trim() && !isValidUrl(formData.avatar_url.trim())) {
        throw new Error('Please enter a valid URL for the avatar');
      }
      if (formData.profile_picture_url.trim() && !isValidUrl(formData.profile_picture_url.trim())) {
        throw new Error('Please enter a valid URL for the profile picture');
      }

      // Update users table (basic info)
      const userUpdateData = {
        name: formData.name.trim(),
        avatar_url: formData.avatar_url.trim() || null
      };


      const { data: userData, error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', user.id)
        .select()
        .single();

      if (userUpdateError) {
        console.error('User table update error - check database permissions');
        throw new Error(`User update error: ${userUpdateError.message}`);
      }

      // Update or insert user_profiles table (extended profile info)
      const profileUpdateData = {
        user_id: user.id,
        bio: formData.bio.trim() || null,
        timezone: formData.timezone,
        profile_picture_url: formData.profile_picture_url.trim() || null,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };


      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let profileData, profileUpdateError;

      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('user_profiles')
          .update(profileUpdateData)
          .eq('user_id', user.id)
          .select()
          .single();
        profileData = result.data;
        profileUpdateError = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from('user_profiles')
          .insert(profileUpdateData)
          .select()
          .single();
        profileData = result.data;
        profileUpdateError = result.error;
      }

      if (profileUpdateError) {
        console.error('Profile table update error - check database permissions');
        throw new Error(`Profile update error: ${profileUpdateError.message}`);
      }

      if (!userData || !profileData) {
        throw new Error('No data returned from update operation');
      }

      // Combine the updated user data with profile data
      const updatedUser = {
        ...userData,
        user_profiles: profileData
      };

      onUpdate(updatedUser);
      onClose();
    } catch (err: unknown) {
      console.error('Profile update failed:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while updating your profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');

    try {
      // Validate the image file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }


      // Compress the image
      const compressedDataUrl = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8,
        outputFormat: 'jpeg',
        maxSizeBytes: 500 * 1024 // 500KB
      });


      // Update form data and preview
      setFormData(prev => ({ ...prev, profile_picture_url: compressedDataUrl }));
      setImagePreview(compressedDataUrl);

    } catch (err: unknown) {
      console.error('Image upload failed:', err);
      if (err instanceof Error) {
        setError(`Image upload failed: ${err.message}`);
      } else {
        setError('Failed to process image. Please try again.');
      }
    } finally {
      setUploadingImage(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profile_picture_url: '' }));
    setImagePreview(null);
    setError('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-cream-primary rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-coffee-dark px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-orange-accent rounded-lg flex-shrink-0">
              <UserIcon className="h-5 w-5 text-text-inverse" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold text-text-inverse truncate">
                {isFirstTime ? 'Complete Your Profile' : 'Edit Profile'}
              </h2>
              <p className="text-xs sm:text-sm text-text-inverse/80 truncate">
                {isFirstTime ? 'Help others get to know you better' : 'Update your information'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex-shrink-0"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-text-inverse" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-coffee-medium mb-2">
              Display Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-coffee-medium/30 rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-warm-white text-base"
              placeholder="How should others address you?"
              maxLength={50}
              required
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-coffee-medium mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-4 py-3 border border-coffee-medium/30 rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-warm-white resize-none text-base"
              placeholder="Tell us a bit about yourself..."
              rows={3}
              maxLength={300}
              style={{ minHeight: '96px' }}
            />
            <div className="text-xs text-text-muted mt-1 text-right">
              {formData.bio.length}/300 characters
            </div>
          </div>

          {/* Timezone Field */}
          <div>
            <label className="block text-sm font-medium text-coffee-medium mb-2">
              <Globe className="h-4 w-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-4 py-3 border border-coffee-medium/30 rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-warm-white text-base"
              style={{ minHeight: '48px' }}
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          {/* Avatar URL Field */}
          <div>
            <label className="block text-sm font-medium text-coffee-medium mb-2">
              Avatar URL (Header)
            </label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => handleInputChange('avatar_url', e.target.value)}
              className="w-full px-4 py-3 border border-coffee-medium/30 rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-warm-white text-base"
              placeholder="https://example.com/your-avatar.jpg"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-coffee-medium mb-2">
              Profile Picture
            </label>
            
            {/* Current/Preview Image */}
            <div className="mb-4 flex justify-center sm:justify-start">
              {(imagePreview || formData.profile_picture_url) && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview || formData.profile_picture_url}
                    alt="Profile preview"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-warm-white shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                    style={{ minHeight: '32px', minWidth: '32px' }}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={triggerFileInput}
                disabled={uploadingImage}
                className="flex items-center space-x-2 px-4 py-3 border-2 border-dashed border-coffee-medium/30 rounded-lg hover:border-orange-accent hover:bg-orange-accent/5 transition-all w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '52px' }}
              >
                {uploadingImage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-orange-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-coffee-medium">Compressing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 text-coffee-medium" />
                    <span className="text-coffee-medium">Upload Image</span>
                  </>
                )}
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* URL Input Alternative */}
              <div className="text-center text-xs text-text-muted">
                or enter URL:
              </div>
              <input
                type="url"
                value={formData.profile_picture_url}
                onChange={(e) => handleInputChange('profile_picture_url', e.target.value)}
                className="w-full px-4 py-3 border border-coffee-medium/30 rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-warm-white text-base"
                placeholder="https://example.com/your-profile-pic.jpg"
                style={{ minHeight: '48px' }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 sm:gap-0 pt-6 border-t border-cream-tertiary">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-orange-accent text-text-inverse px-6 py-3 rounded-lg font-medium hover:bg-orange-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-1"
              style={{ minHeight: '52px' }}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-cream-secondary text-coffee-medium rounded-lg font-medium hover:bg-cream-tertiary transition-colors disabled:opacity-50 order-2 sm:order-2"
              style={{ minHeight: '52px' }}
            >
              Cancel
            </button>
          </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileEditModal;