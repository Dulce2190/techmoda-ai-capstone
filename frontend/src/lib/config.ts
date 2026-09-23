declare global {
  interface Window {
    __ENV?: {
      VITE_API_URL?: string;
      VITE_SEARCH_URL?: string;
      VITE_ASSISTANT_URL?: string;
      VITE_VOICE_URL?: string;
    };
  }
}

function clean(url: string | undefined, fallback: string): string {
  return (url || fallback).replace(/\/+$/, '');
}

export const API_URL = clean(
  window.__ENV?.VITE_API_URL || import.meta.env.VITE_API_URL,
  'https://your-function-url-id.lambda-url.us-east-1.on.aws'
);

export const SEARCH_URL = clean(
  window.__ENV?.VITE_SEARCH_URL || import.meta.env.VITE_SEARCH_URL,
  ''
);

export const ASSISTANT_URL = clean(
  window.__ENV?.VITE_ASSISTANT_URL || import.meta.env.VITE_ASSISTANT_URL,
  ''
);

export const VOICE_URL = clean(
  window.__ENV?.VITE_VOICE_URL || import.meta.env.VITE_VOICE_URL,
  ''
);

if (import.meta.env.DEV) {
  console.log('API URL:', API_URL);
  console.log('Search URL:', SEARCH_URL);
  console.log('Assistant URL:', ASSISTANT_URL);
  console.log('Voice URL:', VOICE_URL);
}
