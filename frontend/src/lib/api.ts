// API utilities for PasteGo backend integration

const API_BASE = "http://localhost:8081/api";

export interface Paste {
  id: string;
  content: string;
  language: string;
  expire_at?: string;
  created_at:string;
  views: number;
}

export interface CreatePasteRequest {
  content: string;
  language: string;
  expire_at?: string;
}

export interface UpdatePasteRequest {
  content: string;
  language: string;
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
  
  async updatePaste(id: string, data: UpdatePasteRequest): Promise<void> {
    const response = await fetch(`${API_BASE}/pastes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update paste: ${response.statusText}`);
    }
  },
};