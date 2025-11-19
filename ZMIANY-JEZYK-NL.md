# Lista zmian języ Human: <attachments> 
<attachment id="file:index.css">
User's active selection:
Excerpt from index.css, lines 97 to 97:
```tailwindcss
e
```
</attachment>
<attachment filePath="c:\\Users\\MESSU BOUW\\Desktop\\PROJECT WŁASNY\\src\\index.css">
User's active file for additional context:
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-height: 100vh;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 50%, #e8eeff 100%);
}

#root {
  min-height: 100vh;
}

@layer components {
  .btn {
    @apply px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg;
  }
  
  .btn-primary {
    @apply bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30 hover:shadow-blue-600/50 hover:shadow-xl border border-blue-400;
  }
  
  .btn-secondary {
    @apply bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-gray-300/50 hover:shadow-gray-400/70 hover:shadow-lg border border-gray-300 hover:border-gray-400;
  }
  
  .btn-danger {
    @apply bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/30 hover:shadow-red-600/50 hover:shadow-xl border border-red-400;
  }
  
  .btn-success {
    @apply bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-500/30 hover:shadow-green-600/50 hover:shadow-xl border border-emerald-400;
  }
  
  .btn-warning {
    @apply bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30 hover:shadow-orange-600/50 hover:shadow-xl border border-amber-400;
  }
  
  .btn-icon {
    @apply p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/40 hover:shadow-cyan-600/60 hover:shadow-xl transform hover:scale-110 active:scale-95 transition-all duration-200 border border-blue-400;
  }
  
  .input {
    @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white shadow-inner;
  }
  
  .card {
    @apply bg-white rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-300/80 transition-all duration-300 hover:-translate-y-1;
  }
  
  .card-gradient {
    @apply bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1;
  }
  
  .stat-card {
    @apply bg-gradient-to-br rounded-2xl shadow-xl p-6 text-white transition-all duration-300 hover:shadow-2xl hover:scale-105;
  }

  /* Górny panel */
  .top-panel {
    @apply bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 shadow-xl shadow-blue-500/30 border-b border-blue-400/50;
  }

  /* Nawigacja */
  .nav-active {
    @apply bg-blue-500 text-white shadow-md shadow-blue-500/30 rounded-lg border border-blue-400;
  }

  .nav-inactive {
    @apply text-gray-700 hover:bg-gray-200 hover:shadow-sm rounded-lg transition-all duration-200 hover:text-gray-900;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</attachment>

</attachments>
dobra juz zoiemy stop to z tego stworz projekt i wypchnij do gita jak juz skoczymy z tym i bedzie to zatwuerdzone na localhost