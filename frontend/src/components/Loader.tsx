
export function Loader() {
  return (
    <div role="status" className="flex justify-center w-full pt-4">
      <span className="relative flex h-12 w-12">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 opacity-60"></span>
        <svg
          aria-hidden="true"
          className="w-12 h-12 animate-spin drop-shadow-lg"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="loader-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f472b6" />
              <stop offset="0.5" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50.5"
            r="40"
            stroke="url(#loader-gradient)"
            strokeWidth="10"
            fill="none"
            opacity="0.3"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="url(#loader-gradient)"
          />
        </svg>
      </span>
      <span className="sr-only">Loading...</span>
    </div>
  );
}