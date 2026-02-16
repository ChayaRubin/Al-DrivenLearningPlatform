import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import type { User, PromptItem, Category, SubCategory } from '../services/api';

const LIMIT = 10;

type Tab = 'users' | 'prompts' | 'categories';

type AdminPrompt = PromptItem & { user?: { id: string; email: string }; category?: { name: string }; subCategory?: { name: string } };

export function Admin() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [promptsTotal, setPromptsTotal] = useState(0);
  const [promptsPage, setPromptsPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Categories: add form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryName, setNewSubCategoryName] = useState<Record<string, string>>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [editingSubCategoryName, setEditingSubCategoryName] = useState('');

  useEffect(() => {
    if (tab !== 'users') return;
    setLoading(true);
    adminApi
      .users(usersPage, LIMIT)
      .then((r) => {
        setUsers(r.data.data);
        setUsersTotal(r.data.total);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [tab, usersPage]);

  useEffect(() => {
    if (tab !== 'prompts') return;
    setLoading(true);
    adminApi
      .prompts(promptsPage, LIMIT)
      .then((r) => {
        setPrompts(r.data.data);
        setPromptsTotal(r.data.total);
      })
      .catch(() => setError('Failed to load prompts'))
      .finally(() => setLoading(false));
  }, [tab, promptsPage]);

  useEffect(() => {
    if (tab !== 'categories') return;
    setLoading(true);
    adminApi
      .categories()
      .then((r) => setCategories(r.data.data))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  }, [tab]);

  const refreshCategories = () => {
    adminApi.categories().then((r) => setCategories(r.data.data)).catch(() => setError('Failed to load categories'));
  };

  const usersTotalPages = Math.ceil(usersTotal / LIMIT) || 1;
  const promptsTotalPages = Math.ceil(promptsTotal / LIMIT) || 1;

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    try {
      await adminApi.createCategory(newCategoryName.trim());
      setNewCategoryName('');
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    setError('');
    try {
      await adminApi.updateCategory(id, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName('');
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category and all its sub-categories? Related prompts will be removed.')) return;
    setError('');
    try {
      await adminApi.deleteCategory(id);
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleAddSubCategory = async (categoryId: string) => {
    const name = newSubCategoryName[categoryId]?.trim();
    if (!name) return;
    setError('');
    try {
      await adminApi.createSubCategory(categoryId, name);
      setNewSubCategoryName((prev) => ({ ...prev, [categoryId]: '' }));
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to add sub-category');
    }
  };

  const handleUpdateSubCategory = async (id: string) => {
    if (!editingSubCategoryName.trim()) return;
    setError('');
    try {
      await adminApi.updateSubCategory(id, editingSubCategoryName.trim());
      setEditingSubCategoryId(null);
      setEditingSubCategoryName('');
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to update sub-category');
    }
  };

  const handleDeleteSubCategory = async (id: string) => {
    if (!window.confirm('Delete this sub-category? Related prompts will be removed.')) return;
    setError('');
    try {
      await adminApi.deleteSubCategory(id);
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to delete sub-category');
    }
  };

  return (
    <>
      <div className="header">
        <h1 className="page-title">Admin</h1>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('users'); setError(''); }}
        >
          Users
        </button>
        <button
          type="button"
          className={`btn ${tab === 'prompts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('prompts'); setError(''); }}
        >
          Prompts
        </button>
        <button
          type="button"
          className={`btn ${tab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setTab('categories'); setError(''); }}
        >
          Categories
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : tab === 'users' ? (
        <>
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '0.5rem 0' }}>Name</th>
                  <th style={{ padding: '0.5rem 0' }}>Email</th>
                  <th style={{ padding: '0.5rem 0' }}>Phone</th>
                  <th style={{ padding: '0.5rem 0' }}>Role</th>
                  <th style={{ padding: '0.5rem 0' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem 0' }}>{u.name ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0' }}>{u.email}</td>
                    <td style={{ padding: '0.5rem 0' }}>{u.phone ?? '—'}</td>
                    <td style={{ padding: '0.5rem 0' }}>{u.role}</td>
                    <td style={{ padding: '0.5rem 0', fontSize: '0.875rem' }}>{new Date(u.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button type="button" className="btn btn-secondary" disabled={usersPage <= 1} onClick={() => setUsersPage((p) => p - 1)}>Previous</button>
            <span>Page {usersPage} of {usersTotalPages} ({usersTotal} total)</span>
            <button type="button" className="btn btn-secondary" disabled={usersPage >= usersTotalPages} onClick={() => setUsersPage((p) => p + 1)}>Next</button>
          </div>
        </>
      ) : tab === 'prompts' ? (
        <>
          <div className="card">
            {prompts.length === 0 ? (
              <p>No prompts.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {prompts.map((p) => (
                  <div key={p.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      {p.user?.email ?? '—'} · {new Date(p.createdAt).toLocaleString()}
                    </div>
                    <strong>{p.category?.name} / {p.subCategory?.name}</strong>
                    <p style={{ marginTop: '0.25rem' }}>{p.userPrompt}</p>
                    <details style={{ marginTop: '0.5rem' }}>
                      <summary>Lesson</summary>
                      <div className="lesson-content" style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{p.generatedLesson}</div>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pagination">
            <button type="button" className="btn btn-secondary" disabled={promptsPage <= 1} onClick={() => setPromptsPage((p) => p - 1)}>Previous</button>
            <span>Page {promptsPage} of {promptsTotalPages} ({promptsTotal} total)</span>
            <button type="button" className="btn btn-secondary" disabled={promptsPage >= promptsTotalPages} onClick={() => setPromptsPage((p) => p + 1)}>Next</button>
          </div>
        </>
      ) : (
        <div className="card">
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="form-group"
              style={{ flex: '1', minWidth: '160px', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 6 }}
            />
            <button type="submit" className="btn btn-primary">Add category</button>
          </form>
          {categories.length === 0 ? (
            <p>No categories yet. Add one above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {categories.map((cat) => (
                <div key={cat.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {editingCategoryId === cat.id ? (
                      <>
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          style={{ flex: 1, minWidth: 120, padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }}
                          autoFocus
                        />
                        <button type="button" className="btn btn-primary" onClick={() => handleUpdateCategory(cat.id)}>Save</button>
                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <strong style={{ fontSize: '1rem' }}>{cat.name}</strong>
                        <button type="button" className="btn btn-secondary" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}>Edit</button>
                        <button type="button" className="btn btn-secondary" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                      </>
                    )}
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="New sub-category"
                        value={newSubCategoryName[cat.id] ?? ''}
                        onChange={(e) => setNewSubCategoryName((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                        style={{ width: 180, padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }}
                      />
                      <button type="button" className="btn btn-primary" onClick={() => handleAddSubCategory(cat.id)}>Add sub-category</button>
                    </div>
                    {cat.subCategories && cat.subCategories.length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {(cat.subCategories as SubCategory[]).map((sub) => (
                          <li key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            {editingSubCategoryId === sub.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editingSubCategoryName}
                                  onChange={(e) => setEditingSubCategoryName(e.target.value)}
                                  style={{ width: 160, padding: '0.35rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6 }}
                                  autoFocus
                                />
                                <button type="button" className="btn btn-primary" onClick={() => handleUpdateSubCategory(sub.id)}>Save</button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setEditingSubCategoryId(null); setEditingSubCategoryName(''); }}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <span>{sub.name}</span>
                                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => { setEditingSubCategoryId(sub.id); setEditingSubCategoryName(sub.name); }}>Edit</button>
                                <button type="button" className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleDeleteSubCategory(sub.id)}>Delete</button>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>No sub-categories.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
