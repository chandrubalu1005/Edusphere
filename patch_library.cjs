const fs = require('fs');

// Patch hooks.js
let code = fs.readFileSync('frontend/src/api/hooks.js', 'utf8');

const oldLibraryHook = `export const useLibraryBooks = (query) => {
  return useQuery({
    queryKey: ['libraryBooks', query],
    queryFn: async () => {
      const res = await api.get('/library/books', { params: { q: query } });
      return res.data;
    },
    retry: 1,
  });
};`;

const newLibraryHook = `export const useLibraryBooks = (query) => {
  return useQuery({
    queryKey: ['libraryBooks', query],
    queryFn: async () => {
      const res = await api.get('/library/catalog/search', { params: { q: query } });
      return { books: res.data.data || [], total: res.data.total || 0 };
    },
    retry: 1,
  });
};`;

code = code.replace(oldLibraryHook, newLibraryHook);
fs.writeFileSync('frontend/src/api/hooks.js', code);

console.log('Success LibraryHooks');
