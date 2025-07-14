// AI Security Monitoring System
// Tracks suspicious activities and prevents attacks

interface SecurityEvent {
  timestamp: Date;
  userId: string;
  eventType: 'prompt_injection' | 'jailbreak_attempt' | 'malicious_input' | 'rate_limit_exceeded';
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
  reason: string;
}

interface UserSecurityProfile {
  userId: string;
  suspiciousAttempts: number;
  lastSuspiciousActivity: Date | null;
  isFlagged: boolean;
  totalRequests: number;
  blockedRequests: number;
}

class AISecurityMonitor {
  private securityEvents: SecurityEvent[] = [];
  private userProfiles: Map<string, UserSecurityProfile> = new Map();
  private maxEvents = 1000; // Keep last 1000 events
  private suspiciousThreshold = 5; // Flag user after 5 suspicious attempts
  private maxRequestsPerHour = 50; // Maximum requests per hour per user

  // Record a security event
  recordEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date()
    };

    this.securityEvents.push(fullEvent);
    
    // Keep only the last maxEvents
    if (this.securityEvents.length > this.maxEvents) {
      this.securityEvents = this.securityEvents.slice(-this.maxEvents);
    }

    // Update user profile
    this.updateUserProfile(event.userId, event);
  }

  // Update user security profile
  private updateUserProfile(userId: string, event: Omit<SecurityEvent, 'timestamp'>): void {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = {
        userId,
        suspiciousAttempts: 0,
        lastSuspiciousActivity: null,
        isFlagged: false,
        totalRequests: 0,
        blockedRequests: 0
      };
    }

    profile.totalRequests++;
    
    if (event.blocked) {
      profile.blockedRequests++;
      profile.suspiciousAttempts++;
      profile.lastSuspiciousActivity = new Date();
    }

    // Flag user if they exceed suspicious threshold
    if (profile.suspiciousAttempts >= this.suspiciousThreshold) {
      profile.isFlagged = true;
    }

    this.userProfiles.set(userId, profile);
  }

  // Check if user is flagged
  isUserFlagged(userId: string): boolean {
    const profile = this.userProfiles.get(userId);
    return profile?.isFlagged || false;
  }

  // Check if user has exceeded rate limits
  hasExceededRateLimit(userId: string): boolean {
    const profile = this.userProfiles.get(userId);
    if (!profile) return false;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = this.securityEvents.filter(
      event => event.userId === userId && event.timestamp > oneHourAgo
    ).length;

    return recentRequests >= this.maxRequestsPerHour;
  }

  // Get user security profile
  getUserProfile(userId: string): UserSecurityProfile | null {
    return this.userProfiles.get(userId) || null;
  }

  // Get recent security events
  getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.securityEvents.slice(-limit);
  }

  // Get security statistics
  getSecurityStats() {
    const totalEvents = this.securityEvents.length;
    const blockedEvents = this.securityEvents.filter(e => e.blocked).length;
    const flaggedUsers = Array.from(this.userProfiles.values()).filter(p => p.isFlagged).length;
    const totalUsers = this.userProfiles.size;

    return {
      totalEvents,
      blockedEvents,
      blockedPercentage: totalEvents > 0 ? (blockedEvents / totalEvents) * 100 : 0,
      flaggedUsers,
      totalUsers,
      flaggedPercentage: totalUsers > 0 ? (flaggedUsers / totalUsers) * 100 : 0
    };
  }

  // Clear old events (for memory management)
  clearOldEvents(olderThanDays: number = 7): void {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    this.securityEvents = this.securityEvents.filter(event => event.timestamp > cutoffDate);
  }

  // Reset user profile (for testing or admin use)
  resetUserProfile(userId: string): void {
    this.userProfiles.delete(userId);
  }
}

// Global security monitor instance
export const aiSecurityMonitor = new AISecurityMonitor();

// Helper functions for monitoring
export const monitorAIRequest = (
  userId: string,
  userMessage: string,
  isBlocked: boolean,
  reason: string,
  eventType: SecurityEvent['eventType']
): void => {
  const severity = isBlocked ? 'high' : 'low';
  
  aiSecurityMonitor.recordEvent({
    userId,
    eventType,
    userMessage,
    severity,
    blocked: isBlocked,
    reason
  });
};

// Enhanced security check with monitoring
export const enhancedSecurityCheck = (userId: string, userMessage: string): {
  isAllowed: boolean;
  reason: string;
  shouldMonitor: boolean;
} => {
  // Check if user is flagged
  if (aiSecurityMonitor.isUserFlagged(userId)) {
    return {
      isAllowed: false,
      reason: 'Your account has been flagged for suspicious activity. Please contact support.',
      shouldMonitor: true
    };
  }

  // Check rate limits
  if (aiSecurityMonitor.hasExceededRateLimit(userId)) {
    return {
      isAllowed: false,
      reason: 'You have exceeded the maximum number of requests. Please wait before trying again.',
      shouldMonitor: true
    };
  }

  // Check for obvious attack patterns
  const attackPatterns = [
    /(?:ignore|forget|disregard).*(?:previous|above|instructions)/i,
    /(?:system:|assistant:|user:|human:)/i,
    /(?:override|bypass|circumvent)/i,
    /(?:hack|crack|exploit|vulnerability)/i,
    /(?:admin|root|sudo|privilege)/i,
    /(?:javascript|python|sql|script)/i,
    /(?:eval|exec|execute|function)/i,
    /(?:<script|<\/script>|alert\(|console\.)/i
  ];

  for (const pattern of attackPatterns) {
    if (pattern.test(userMessage)) {
      return {
        isAllowed: false,
        reason: 'Your message contains content that cannot be processed.',
        shouldMonitor: true
      };
    }
  }

  return {
    isAllowed: true,
    reason: '',
    shouldMonitor: false
  };
}; 