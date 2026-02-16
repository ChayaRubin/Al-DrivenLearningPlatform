import { useState, useEffect } from 'react';
import { usersApi } from '../services/api';
import type { PromptItem } from '../services/api';

const LIMIT = 10;

export function History() {
  const [items, setItems] = useState<PromptItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    usersApi
      .myHistory(page, LIMIT)
      .then((r) => {
        setItems(r.data.data);
        setTotal(r.data.total);
      })
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <>
      <div className="header">
        <h1 className="page-title">Learning History</h1>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : items.length === 0 ? (
        <div className="card">No learning history yet. Submit a prompt from the Dashboard.</div>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong>{item.category?.name ?? ''} / {item.subCategory?.name ?? ''}</strong>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{new Date(item.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4b5563' }}>{item.userPrompt}</p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem' }}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                {expandedId === item.id ? 'Hide lesson' : 'Show lesson'}
              </button>
              {expandedId === item.id && (
                <div className="lesson-content" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  {item.generatedLesson}
                </div>
              )}
            </div>
          ))}
          <div className="pagination">
            <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {page} of {totalPages} ({total} total)</span>
            <button type="button" className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}
    </>
  );
}
