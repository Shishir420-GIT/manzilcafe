import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Coffee } from 'lucide-react';
import { checkRateLimit } from '../lib/rateLimiter';

interface CreateCafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const CreateCafeModal = ({ isOpen, onClose, onSuccess, userId }: CreateCafeModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('cozy');
  const [capacity, setCapacity] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const themes = [
    { value: 'cozy', label: 'Cozy Corner', description: 'Warm and intimate atmosphere' },
    { value: 'modern', label: 'Modern Minimal', description: 'Clean and contemporary' },
    { value: 'rustic', label: 'Rustic Charm', description: 'Traditional and homey' },
    { value: 'elegant', label: 'Elegant Lounge', description: 'Sophisticated and upscale' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check rate limit for cafe creation
    const rateLimitCheck = checkRateLimit(userId, 'cafe_create');
    if (!rateLimitCheck.allowed) {
      setError(rateLimitCheck.error || 'Rate limit exceeded');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('cafes')
        .insert({
          host_id: userId,
          name,
          description,
          theme,
          capacity,
        });

      if (error) throw error;
      
      onSuccess();
      onClose();
      setName('');
      setDescription('');
      setTheme('cozy');
      setCapacity(20);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-warm-white rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-accent via-golden-accent to-orange-accent"></div>
        
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-accent/20 rounded-full">
                <Coffee className="h-6 w-6 text-orange-accent" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary">Create Your Space</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-cream-secondary rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Space Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-cream-tertiary rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-cream-primary"
                placeholder="My Cozy Corner"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-cream-tertiary rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all resize-none bg-cream-primary"
                placeholder="Describe the vibe and atmosphere of your space..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((themeOption) => (
                  <label
                    key={themeOption.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      theme === themeOption.value
                        ? 'border-orange-accent bg-orange-accent/10'
                        : 'border-cream-tertiary hover:border-cream-tertiary/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={themeOption.value}
                      checked={theme === themeOption.value}
                      onChange={(e) => setTheme(e.target.value)}
                      className="sr-only"
                    />
                    <div className="text-sm font-medium text-text-primary mb-1">
                      {themeOption.label}
                    </div>
                    <div className="text-xs text-text-muted">
                      {themeOption.description}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Capacity
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value))}
                min="5"
                max="100"
                className="w-full px-4 py-3 border border-cream-tertiary rounded-lg focus:ring-2 focus:ring-orange-accent focus:border-transparent transition-all bg-cream-primary"
                required
              />
              <p className="text-xs text-text-muted mt-1">
                Maximum number of members (5-100)
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse py-3 px-4 rounded-lg font-medium hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Space'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCafeModal;