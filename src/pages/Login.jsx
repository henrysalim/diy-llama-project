import { useEffect, useState } from "react";
import { supabase } from "../auth/supabase";

export default function Login() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session != null) {
    window.location.href = "/";
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          process.env.NODE_ENV == "production"
            ? "https://diy-with-llama.vercel.app"
            : "http://localhost:5173",
      },
    });

    if (error) console.error("Error logging in: " + error.message);
  };

  return (
    <div className="bg-orange-50 dark:bg-stone-800 h-screen flex justify-center items-center">
      <div className="max-w-md mx-auto dark:bg-stone-900 p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-emerald-600">
          Login
        </h2>
        <p className="text-center text-stone-600 dark:text-stone-300 mb-8">
          Sign in with your Google account to continue.
        </p>
        <button
          onClick={handleLogin}
          className="w-full cursor-pointer bg-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
            ></path>
            <path
              fill="#FF3D00"
              d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
            ></path>
            <path
              fill="#4CAF50"
              d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
            ></path>
            <path
              fill="#1976D2"
              d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.032 44 24c0-1.341-.138-2.65-.389-3.917z"
            ></path>
          </svg>
          <span>Login with Google</span>
        </button>
      </div>
    </div>
  );
}
