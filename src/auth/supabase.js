import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  // `${import.meta.env.VITE_PUBLIC_SUPABASE_URL}`,
  // `${import.meta.env.SUPABASE_ANON_KEY}`
  "https://ivcxehvnzscoisuewiti.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2Y3hlaHZuenNjb2lzdWV3aXRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjkxMjcsImV4cCI6MjA3Mjc0NTEyN30.EKFc-_lU9VnKW_3qESZx3Q97BrxFE9NZxY154wYS93I"
);
