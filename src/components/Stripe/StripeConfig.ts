const stripePublicKey = import.meta.env.STRIPE_PUBLIC_KEY

export const STRIPE_CONFIG = {
    publishableKey: stripePublicKey || 'pk_test_fallback_key',
    options: {
        locale: 'en' as const,
    },
};

export const API_CONFIG = {
    baseUrl: 'http://localhost:3002',
};

export const SUBSCRIPTION_PLANS = {
    basic: {
        name: 'Basic Plan',
        price: 9.99,
        currency: 'eur',
        description: 'Basic subscription with essential features'
    },
    gold: {
        name: 'Gold Plan',
        price: 19.99,
        currency: 'eur',
        description: 'Premium subscription with all features'
    }
};