import { apiRequest } from "./queryClient";
import type { GenerateReadmeRequest, GenerateReadmeResponse, ReadmeGeneration, UserResponse } from "@shared/schema";

export const api = {
  generateReadme: async (data: GenerateReadmeRequest): Promise<GenerateReadmeResponse> => {
    const res = await apiRequest("POST", "/api/generate-readme", data);
    return res.json();
  },

  getReadme: async (id: string): Promise<ReadmeGeneration> => {
    const res = await apiRequest("GET", `/api/readme/${id}`);
    return res.json();
  },

  getRecentGenerations: async (limit?: number): Promise<ReadmeGeneration[]> => {
    const url = `/api/recent-generations${limit ? `?limit=${limit}` : ''}`;
    const res = await apiRequest("GET", url);
    return res.json();
  },

  downloadReadme: async (id: string): Promise<Blob> => {
    const res = await apiRequest("GET", `/api/download/${id}`);
    return res.blob();
  },

  validateRepository: async (repositoryUrl: string): Promise<{ valid: boolean; error?: string }> => {
    const res = await apiRequest("POST", "/api/validate-repository", { repositoryUrl });
    return res.json();
  },

  // Authentication endpoints
  getCurrentUser: async (): Promise<UserResponse> => {
    const res = await apiRequest("GET", "/api/user");
    return res.json();
  },

  logout: async (): Promise<{ success: boolean }> => {
    const res = await apiRequest("POST", "/api/logout");
    return res.json();
  },
};
