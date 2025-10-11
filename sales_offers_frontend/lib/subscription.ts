export interface SubscriptionFeatures {
  max_offers: number;
  blog_posts: number;
  analytics: 'basic' | 'advanced' | 'premium';
  support: 'email' | 'priority' | 'dedicated';
  branding: boolean;
  featured_listings: boolean;
  api_access: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price_ksh: string;
  duration_days: number;
  max_offers: number;
  features: SubscriptionFeatures;
}

export interface UserSubscription {
  has_subscription: boolean;
  plan_name: string;
  max_offers: number;
  offers_remaining: number;
  can_create_offers: boolean;
  plan?: SubscriptionPlan;
}

export class SubscriptionChecker {
  private subscription: UserSubscription | null = null;

  constructor(subscription: UserSubscription | null) {
    this.subscription = subscription;
  }

  canCreateOffers(): boolean {
    return this.subscription?.can_create_offers ?? false;
  }

  canCreateBlogPosts(currentCount: number): boolean {
    if (!this.subscription) return currentCount < 2;
    
    const features = this.subscription.plan?.features;
    if (!features) return currentCount < 2;
    
    const maxPosts = features.blog_posts;
    return maxPosts === -1 || currentCount < maxPosts;
  }

  getMaxOffers(): number {
    return this.subscription?.max_offers ?? 1;
  }

  getMaxBlogPosts(): number {
    if (!this.subscription?.plan?.features) return 2;
    return this.subscription.plan.features.blog_posts;
  }

  hasFeature(feature: keyof SubscriptionFeatures): boolean {
    if (!this.subscription?.plan?.features) return false;
    return Boolean(this.subscription.plan.features[feature]);
  }

  getAnalyticsLevel(): 'basic' | 'advanced' | 'premium' {
    return this.subscription?.plan?.features?.analytics ?? 'basic';
  }

  getSupportLevel(): 'email' | 'priority' | 'dedicated' {
    return this.subscription?.plan?.features?.support ?? 'email';
  }

  getPlanName(): string {
    return this.subscription?.plan_name ?? 'No Plan';
  }

  isFeatureRestricted(feature: string, currentUsage: number): { restricted: boolean; message: string; upgradeUrl: string } {
    let maxAllowed = 0;
    let featureName = '';

    switch (feature) {
      case 'offers':
        maxAllowed = this.getMaxOffers();
        featureName = 'offers';
        break;
      case 'blog_posts':
        maxAllowed = this.getMaxBlogPosts();
        featureName = 'blog posts';
        break;
      default:
        return { restricted: false, message: '', upgradeUrl: '' };
    }

    const restricted = maxAllowed !== -1 && currentUsage >= maxAllowed;
    const message = restricted 
      ? `You've reached your plan limit of ${maxAllowed} ${featureName}. Upgrade to create more.`
      : '';

    return {
      restricted,
      message,
      upgradeUrl: '/pricing'
    };
  }
}

export const createSubscriptionChecker = (subscription: UserSubscription | null): SubscriptionChecker => {
  return new SubscriptionChecker(subscription);
};