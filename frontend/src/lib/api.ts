import type { Product } from './types';
import { API_URL, SEARCH_URL, ASSISTANT_URL, VOICE_URL } from './config';

export interface SearchResult {
  productId: string;
  name: string;
  category: string;
  price: number;
  score: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
  retrieved: { productId: string; name: string }[];
}

export const api = {
  async listProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return data.products || [];
  },

  async getProduct(productId: string): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${productId}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  async createProduct(product: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  async updateProduct(
    productId: string,
    updates: Partial<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${API_URL}/products/${productId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
  },

  // ---- S7 · Búsqueda semántica ----
  async semanticSearch(query: string): Promise<SearchResult[]> {
    if (!SEARCH_URL) throw new Error('Búsqueda semántica no configurada.');
    const response = await fetch(`${SEARCH_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    return data.results || [];
  },

  // ---- S8 · Asistente de compras (chat con memoria) ----
  async askAssistant(message: string, history: ChatMessage[]): Promise<ChatResponse> {
    if (!ASSISTANT_URL) throw new Error('Asistente no configurado.');
    const response = await fetch(`${ASSISTANT_URL}/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: history.map((h) => ({ role: h.role, content: h.content })),
      }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },

  // ---- S5 · Voz (Polly) ----
  async getVoice(productId: string, lang: 'es' | 'en' = 'es'): Promise<{ audioUrl: string }> {
    if (!VOICE_URL) throw new Error('Voz no configurada.');
    const response = await fetch(`${VOICE_URL}/products/${productId}/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang }),
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    return response.json();
  },
};
