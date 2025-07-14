interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (userId: string, action: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Configure rate limits for different actions
  configure(action: string, config: RateLimitConfig) {
    this.configs.set(action, config);
  }

  // Check if request is allowed
  isAllowed(userId: string | undefined, action: string): { allowed: boolean; remaining: number; resetTime: number } {
    if (!userId) {
      return { allowed: false, remaining: 0, resetTime: Date.now() };
    }

    const config = this.configs.get(action);
    if (!config) {
      return { allowed: true, remaining: -1, resetTime: Date.now() };
    }

    const key = config.keyGenerator ? config.keyGenerator(userId, action) : `${userId}:${action}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return { allowed: true, remaining: config.maxRequests - 1, resetTime: now + config.windowMs };
    }

    if (entry.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);

    return { 
      allowed: true, 
      remaining: config.maxRequests - entry.count, 
      resetTime: entry.resetTime 
    };
  }

  // Get current status for a user/action
  getStatus(userId: string | undefined, action: string): { count: number; limit: number; resetTime: number } {
    if (!userId) {
      return { count: 0, limit: -1, resetTime: Date.now() };
    }

    const config = this.configs.get(action);
    if (!config) {
      return { count: 0, limit: -1, resetTime: Date.now() };
    }

    const key = config.keyGenerator ? config.keyGenerator(userId, action) : `${userId}:${action}`;
    const entry = this.limits.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetTime) {
      return { count: 0, limit: config.maxRequests, resetTime: now + config.windowMs };
    }

    return { 
      count: entry.count, 
      limit: config.maxRequests, 
      resetTime: entry.resetTime 
    };
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  // Reset limits for a user/action (for testing or admin use)
  reset(userId: string | undefined, action: string) {
    if (!userId) return;
    
    const config = this.configs.get(action);
    if (!config) return;

    const key = config.keyGenerator ? config.keyGenerator(userId, action) : `${userId}:${action}`;
    this.limits.delete(key);
  }
}

// Create global rate limiter instance
export const rateLimiter = new RateLimiter();

// Configure default rate limits
rateLimiter.configure('message', { maxRequests: 10, windowMs: 60 * 1000 }); // 10 messages per minute
rateLimiter.configure('order', { maxRequests: 5, windowMs: 60 * 1000 }); // 5 orders per minute
rateLimiter.configure('ai_request', { maxRequests: 3, windowMs: 60 * 1000 }); // 3 AI requests per minute
rateLimiter.configure('voice_message', { maxRequests: 2, windowMs: 60 * 1000 }); // 2 voice messages per minute
rateLimiter.configure('cafe_join', { maxRequests: 10, windowMs: 60 * 1000 }); // 10 cafe joins per minute
rateLimiter.configure('cafe_create', { maxRequests: 2, windowMs: 60 * 1000 }); // 2 cafe creations per minute

// Helper function to check rate limit with user-friendly error messages
export const checkRateLimit = (userId: string | undefined, action: string): { 
  allowed: boolean; 
  error?: string; 
  remaining?: number; 
  resetTime?: number 
} => {
  if (!userId) {
    return { allowed: false, error: 'User not authenticated' };
  }

  const result = rateLimiter.isAllowed(userId, action);
  
  if (!result.allowed) {
    const resetTime = new Date(result.resetTime);
    const timeUntilReset = Math.ceil((result.resetTime - Date.now()) / 1000);
    
    let errorMessage = 'Rate limit exceeded. ';
    switch (action) {
      case 'message':
        errorMessage += `You can send ${rateLimiter.getStatus(userId, 'message').limit} messages per minute. Try again in ${timeUntilReset} seconds.`;
        break;
      case 'order':
        errorMessage += `You can place ${rateLimiter.getStatus(userId, 'order').limit} orders per minute. Try again in ${timeUntilReset} seconds.`;
        break;
      case 'ai_request':
        errorMessage += `You can make ${rateLimiter.getStatus(userId, 'ai_request').limit} AI requests per minute. Try again in ${timeUntilReset} seconds.`;
        break;
      case 'voice_message':
        errorMessage += `You can send ${rateLimiter.getStatus(userId, 'voice_message').limit} voice messages per minute. Try again in ${timeUntilReset} seconds.`;
        break;
      case 'cafe_join':
        errorMessage += `You can join ${rateLimiter.getStatus(userId, 'cafe_join').limit} cafes per minute. Try again in ${timeUntilReset} seconds.`;
        break;
      case 'cafe_create':
        errorMessage += `You can create ${rateLimiter.getStatus(userId, 'cafe_create').limit} cafes per minute. Try again in ${timeUntilReset} seconds.`;
        break;
      default:
        errorMessage += `Try again in ${timeUntilReset} seconds.`;
    }
    
    return { allowed: false, error: errorMessage };
  }
  
  return { allowed: true, remaining: result.remaining, resetTime: result.resetTime };
};

// Helper function to get rate limit status for UI display
export const getRateLimitStatus = (userId: string | undefined, action: string) => {
  return rateLimiter.getStatus(userId, action);
}; 