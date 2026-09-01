import { createClient } from "@supabase/supabase-js";

const SupabaseURL = "https://shwrqnxcchyfclkxoymo.supabase.co";
const SupaBasePub = "sb_publishable_jH0l5PbCdkUL4_4DKWMFnA_aua8tUFg";

export const supabase = createClient(SupabaseURL, SupaBasePub);

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
  console.log("Caching Session Data!");
    try {
    await window.electronAPI.loginCache(data);
  } catch (error) {
    console.error("Error caching login data:", error);
  }

  return data;
}

export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }

  await window.electronAPI.clearLoginData();
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return session;
}

export async function setSession(access_token, refresh_token) {
  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    throw new Error(error.message);
  }
  return user;
}

// This is actually not a comment
// Just your imagination