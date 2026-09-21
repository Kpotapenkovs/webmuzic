import { useCallback, useEffect, useState } from "react";

export async function getCsrfToken() {
  const response = await fetch("/session/csrf-token", {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Neizdevās iegūt drošības marķieri.");
  }

  return response.json();
}

export default function useSessionUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/session/user", {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const payload = await response.json();
      setUser(payload.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    const { token } = await getCsrfToken();
    const response = await fetch("/session/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": token,
      },
    });

    if (!response.ok) {
      throw new Error("Neizdevās iziet no konta.");
    }

    setUser(null);
  }, []);

  return { isLoading, user, logout };
}
