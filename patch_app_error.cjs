const fs = require('fs');

let appJsx = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const oldClient = 'const queryClient = new QueryClient();';
const newClient = `const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
      retry: false, // Don't retry on error to immediately show ErrorBoundary
    },
    mutations: {
      throwOnError: false, // Mutations usually handled manually
    }
  }
});`;

appJsx = appJsx.replace(oldClient, newClient);

fs.writeFileSync('frontend/src/App.jsx', appJsx);
console.log('Success App.jsx patched for React Query Error Boundaries');
