const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/portals/admin/features.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Inject the required hooks for circulation
content = content.replace(
  /useLiveLibraryResources,/,
  'useLiveLibraryResources, useAdminLiveLibraryLoans,'
);
content = content.replace(
  /useUpdateAnnouncement, useDeleteAnnouncement/,
  'useUpdateAnnouncement, useDeleteAnnouncement, useIssueBook, useReturnBook'
);

const newLibraryManagement = `
// ── DIGITAL LIBRARY MANAGEMENT (Circulation Desk) ───────────────────────────
export function LibraryManagement({ user }) {
  const [tab, setTab] = useState('circulation');
  const [memberId, setMemberId] = useState('');
  const [copyId, setCopyId] = useState('');
  
  const { data: LIBRARY_RESOURCES = [] } = useLiveLibraryResources();
  const { data: LOANS = [], isLoading: loansLoading } = useAdminLiveLibraryLoans();
  
  const issueMutation = useIssueBook();
  const returnMutation = useReturnBook();

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!memberId || !copyId) return toast.error('Both Member ID and Copy ID are required');
    issueMutation.mutate({ memberId, copyId });
    setCopyId('');
  };

  const activeLoans = LOANS.filter(l => l.status === 'ACTIVE' || l.status === 'OVERDUE');

  return (
    <div>
      <PageHeader
        title="Circulation Desk & Catalog"
        subtitle="Manage check-outs, returns, fines, and the overall library catalog"
        breadcrumbs={[{ label: 'Dashboard', onClick: () => {} }, { label: 'Library Mgmt' }]}
      />

      <Tabs tabs={[
        { id: 'circulation', label: 'Circulation Desk (Check In/Out)', icon: <BookOpen size={16} /> },
        { id: 'catalog', label: 'Physical Catalog', icon: <BookOpen size={16} /> },
      ]} active={tab} onChange={setTab} />

      {tab === 'circulation' && (
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Check-Out Book</h3>
            <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Member ID / Student ID</label>
                <input type="text" className="input" placeholder="Scan or type ID..." value={memberId} onChange={e => setMemberId(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Book Copy Barcode</label>
                <input type="text" className="input" placeholder="Scan barcode..." value={copyId} onChange={e => setCopyId(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={issueMutation.isLoading}>
                {issueMutation.isLoading ? 'Processing...' : 'Check Out Copy'}
              </button>
            </form>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ marginBottom: 16 }}>Active Check-Outs (Return Desk)</h3>
            {loansLoading ? <p>Loading loans...</p> : (
              <DataTable
                columns={[
                  { key: 'bookTitle', label: 'Book', render: (_, row) => <strong>{row.bookCopyId?.bookTitleId?.title || 'Unknown'}</strong> },
                  { key: 'member', label: 'Member', render: (_, row) => row.memberId?.userId?.name || 'Unknown' },
                  { key: 'dueDate', label: 'Due Date', render: v => new Date(v).toLocaleDateString() },
                  { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
                  { key: 'action', label: 'Action', width: 100, render: (_, row) => (
                    <button 
                      className="btn btn-outline btn-sm" 
                      onClick={() => returnMutation.mutate(row._id)}
                      disabled={returnMutation.isLoading}
                    >
                      Check-In
                    </button>
                  )}
                ]}
                data={activeLoans}
              />
            )}
          </div>
        </div>
      )}

      {tab === 'catalog' && (
        <div style={{ marginTop: 24 }}>
          <DataTable
            columns={[
              { key: 'isbn', label: 'ISBN/ID', width: 120, render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>{v}</span> },
              { key: 'title', label: 'Book Title', render: (v, row) => <strong>{v} <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>by {row.author}</span></strong> },
              { key: 'category', label: 'Category' },
              { key: 'department', label: 'Department', width: 90 },
              { key: 'copies', label: 'Total Copies', width: 90 },
              { key: 'available', label: 'Available', width: 90 }
            ]}
            data={LIBRARY_RESOURCES}
          />
        </div>
      )}
    </div>
  );
}
`;

content = content.replace(
  /\/\/ ── DIGITAL LIBRARY MANAGEMENT ──────────────────────────────────────────────[\s\S]*?(?=\/\/ ── PLACEMENT MANAGEMENT ────────────────────────────────────────────────────)/,
  newLibraryManagement + '\n'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully injected real Admin LibraryManagement Circulation Desk');
