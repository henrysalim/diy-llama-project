const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white dark:bg-stone-800 rounded-lg shadow-md w-full max-w-md">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    <p className="text-stone-600 dark:text-stone-300">
      Analyzing your image...
    </p>
  </div>
);

export default LoadingSpinner;
