import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { UserResponse } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery<UserResponse | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        return await api.getCurrentUser();
      } catch (error: any) {
        if (error.status === 401) {
          return null; // Not authenticated
        }
        throw error;
      }
    },
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/recent-generations"] });
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
      });
    },
    onError: (error: any) => {
      // Still clear local state even if logout fails
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/recent-generations"] });
      
      toast({
        title: "Session ended",
        description: "You have been signed out.",
        variant: "default",
      });
    },
  });

  const login = () => {
    window.location.href = "/auth/github";
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isLoadingUser,
    login,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}