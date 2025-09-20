// API utilities for PasteGo backend integration

const API_BASE = "http://localhost:8080/api";

export interface Paste {
  id: string;
  content: string;
  language: string;
  created_at: string;
  expire_at?: string;
  views: number;
}

export interface CreatePasteRequest {
  content: string;
  language: string;
  expire_at?: string;
}

export const api = {
  async createPaste(data: CreatePasteRequest): Promise<Paste> {
    const response = await fetch(`${API_BASE}/pastes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create paste: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getPaste(id: string): Promise<Paste> {
    const response = await fetch(`${API_BASE}/pastes/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get paste: ${response.statusText}`);
    }
    
    return response.json();
  },

  async getRawPaste(id: string): Promise<string> {
    const response = await fetch(`${API_BASE}/pastes/${id}/raw`);
    
    if (!response.ok) {
      throw new Error(`Failed to get raw paste: ${response.statusText}`);
    }
    
    return response.text();
  },

  async updateViews(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/pastes/${id}/view`, {
      method: "PUT",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update views: ${response.statusText}`);
    }
  },
};