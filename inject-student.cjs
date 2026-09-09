const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/portals/student/features.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Need to inject the reservation mutation hook
content = content.replace(
  /export function StudentLibrary\(\{ user \}\) \{/g,
  `
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client.js';

export function StudentLibrary({ user }) {
  const queryClient = useQueryClient();
  const reservationMutation = useMutation({
    mutationFn: async (titleId) => {
      const res = await api.post('/library/reservations', { titleId });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Book reserved successfully. You will be notified when a copy is available.');
      queryClient.invalidateQueries(['searchCatalog']);
      queryClient.invalidateQueries(['liveLibraryLoans']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to reserve book');
    }
  });
`
);

// Replace the fake handleRequest toast
content = content.replace(
  /const handleRequest = \(titleId\) => \{\s*toast\.error\('Service unavailable \(Book reservation API not connected\)'\);\s*\};/,
  `const handleRequest = (titleId) => {
    reservationMutation.mutate(titleId);
  };`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected real StudentLibrary reservation workflow');
