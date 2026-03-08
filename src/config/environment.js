export const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';

export const API_URL = isDevelopment
    ? 'http://localhost:3002'
    : 'https://api.bluegembot.com';

export const WS_URL = isDevelopment
    ? 'ws://localhost:3002/ws'
    : 'wss://api.bluegembot.com/ws';