import { useState, useEffect, useRef } from 'react';
import { Icon, ICONS } from '../../components/Layout.jsx';
import api from '../../api/client.js';
import toast from 'react-hot-toast';

export default function CommandPalette({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const fetchedResults = [];

        // 1. Search Courses
        try {
          const res = await api.get(`/courses/search?q=${encodeURIComponent(query)}`);
          const courses = res.data?.courses || [];
          courses.forEach(c => {
            fetchedResults.push({
              id: c._id || c.id,
              title: `${c.code}: ${c.title}`,
              category: 'Courses',
              icon: '📚',
              action: () => onNavigate('courses')
            });
          });
        } catch (err) {
          console.warn('Courses search failed:', err.message);
        }

        // 2. Search Discussions (local filter fallback or fetch)
        try {
          const res = await api.get('/discussions');
          const threads = res.data?.threads || res.data || [];
          const filtered = threads.filter(t => 
            t.title?.toLowerCase().includes(query.toLowerCase()) || 
            t.content?.toLowerCase().includes(query.toLowerCase())
          );
          filtered.forEach(t => {
            fetchedResults.push({
              id: t._id || t.id,
              title: t.title,
              category: 'Discussions',
              icon: '💬',
              action: () => onNavigate('communication')
            });
          });
        } catch (err) {
          console.warn('Discussions search failed:', err.message);
        }

        setResults(fetchedResults);
        setSelectedIndex(0);
      } catch (error) {
        toast.error('Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Key listeners for arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(results.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % Math.max(results.length, 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999, alignItems: 'flex-start', paddingTop: 100 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 600, padding: 0, borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <span style={{ marginRight: 12, color: 'var(--text-3)' }}><Icon d={ICONS.search} size={18} /></span>
          <input
            ref={inputRef}
            className="form-input"
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: 16, width: '100%', outline: 'none', boxShadow: 'none' }}
            placeholder="Search courses, discussions, resources..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd style={{ fontSize: 10, background: 'var(--surface-2)', padding: '3px 6px', borderRadius: 4, color: 'var(--text-3)', border: '1px solid var(--border)' }}>ESC</kbd>
        </div>

        <div style={{ maxHeight: 350, overflowY: 'auto', background: 'var(--surface-2)' }}>
          {loading && (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)' }}>Searching...</div>
          )}

          {!loading && results.length === 0 && query && (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-3)' }}>No results found for "{query}"</div>
          )}

          {!loading && results.length === 0 && !query && (
            <div style={{ padding: '20px', color: 'var(--text-3)', fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Try searching for:</div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, listStyle: 'none' }}>
                <li style={{ cursor: 'pointer' }} onClick={() => setQuery('CS')}>📚 CS courses</li>
                <li style={{ cursor: 'pointer' }} onClick={() => setQuery('Algorithm')}>💬 Algorithm discussions</li>
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ padding: 8 }}>
              {Object.entries(
                results.reduce((groups, item) => {
                  if (!groups[item.category]) groups[item.category] = [];
                  groups[item.category].push(item);
                  return groups;
                }, {})
              ).map(([category, items]) => (
                <div key={category}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', padding: '10px 12px 6px', letterSpacing: 0.5 }}>{category}</div>
                  {items.map((item, idx) => {
                    const overallIndex = results.indexOf(item);
                    const isSelected = overallIndex === selectedIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => { item.action(); onClose(); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: 'var(--r-sm)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--primary)' : 'transparent',
                          color: isSelected ? 'white' : 'var(--text-1)'
                        }}
                      >
                        <span style={{ marginRight: 10, fontSize: 16 }}>{item.icon}</span>
                        <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.title}</div>
                        {isSelected && <span style={{ fontSize: 12, opacity: 0.7 }}>↵ Enter</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
