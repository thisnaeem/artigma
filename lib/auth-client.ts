import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

export const signInWithGoogle = async () => {
  await signIn.social({
    provider: "google",
    callbackURL: "/app",
  });
};
