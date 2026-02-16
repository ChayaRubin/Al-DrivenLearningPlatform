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

  // Users: add form & edit
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<string>('USER');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [editingUserPhone, setEditingUserPhone] = useState('');
  const [editingUserRole, setEditingUserRole] = useState('USER');

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

  const refreshUsers = () => {
    adminApi.users(usersPage, LIMIT).then((r) => {
      setUsers(r.data.data);
      setUsersTotal(r.data.total);
    }).catch(() => setError('Failed to load users'));
  };

  const refreshCategories = () => {
    adminApi.categories().then((r) => setCategories(r.data.data)).catch(() => setError('Failed to load categories'));
  };

  const usersTotalPages = Math.ceil(usersTotal / LIMIT) || 1;
  const promptsTotalPages = Math.ceil(promptsTotal / LIMIT) || 1;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) return;
    setError('');
    try {
      await adminApi.createUser({ name: newUserName.trim(), phone: newUserPhone.trim(), role: newUserRole });
      setNewUserName('');
      setNewUserPhone('');
      setNewUserRole('USER');
      refreshUsers();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to add user');
    }
  };

  const handleUpdateUser = async (id: string) => {
    if (!editingUserName.trim() || !editingUserPhone.trim()) return;
    setError('');
    try {
      await adminApi.updateUser(id, {
        name: editingUserName.trim(),
        phone: editingUserPhone.trim(),
        role: editingUserRole,
      });
      setEditingUserId(null);
      setEditingUserName('');
      setEditingUserPhone('');
      setEditingUserRole('USER');
      refreshUsers();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Delete this user? Their learning history will be removed.')) return;
    setError('');
    try {
      await adminApi.deleteUser(id);
      refreshUsers();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to delete user');
    }
  };

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
      <div className="admin-header">
        <h1 className="page-title">Admin</h1>
        <div className="admin-tabs">
          <button
            type="button"
            className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-light-blue'}`}
            onClick={() => { setTab('users'); setError(''); }}
          >
            Users
          </button>
          <button
            type="button"
            className={`btn ${tab === 'prompts' ? 'btn-primary' : 'btn-light-blue'}`}
            onClick={() => { setTab('prompts'); setError(''); }}
          >
            Prompts
          </button>
          <button
            type="button"
            className={`btn ${tab === 'categories' ? 'btn-primary' : 'btn-light-blue'}`}
            onClick={() => { setTab('categories'); setError(''); }}
          >
            Categories
          </button>
        </div>
      </div>
      <div className="admin-body">
        {error && <p className="error-msg">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : tab === 'users' ? (
          <>
            <form className="admin-add-form card" onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="new-user-name">Name</label>
                <input
                  id="new-user-name"
                  type="text"
                  placeholder="Full name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-user-phone">Phone</label>
                <input
                  id="new-user-phone"
                  type="text"
                  placeholder="Phone number"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="new-user-role">Role</label>
                <select
                  id="new-user-role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="input"
                  style={{ minWidth: 120 }}
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Add user</button>
            </form>
            <div className="card table-wrap admin-content-card">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th className="admin-table-actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      {editingUserId === u.id ? (
                        <>
                          <td>
                            <input
                              type="text"
                              value={editingUserName}
                              onChange={(e) => setEditingUserName(e.target.value)}
                              className="input admin-inline-input"
                              placeholder="Name"
                              autoFocus
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              value={editingUserPhone}
                              onChange={(e) => setEditingUserPhone(e.target.value)}
                              className="input admin-inline-input"
                              placeholder="Phone"
                            />
                          </td>
                          <td>
                            <select
                              value={editingUserRole}
                              onChange={(e) => setEditingUserRole(e.target.value)}
                              className="input admin-inline-input"
                            >
                              <option value="USER">User</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </td>
                          <td style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="admin-table-actions-col">
                            <button type="button" className="btn btn-primary btn-sm" onClick={() => handleUpdateUser(u.id)}>Save</button>
                            <button type="button" className="btn btn-light-blue btn-sm" onClick={() => { setEditingUserId(null); setEditingUserName(''); setEditingUserPhone(''); setEditingUserRole('USER'); }}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{u.name ?? '—'}</td>
                          <td>{u.phone ?? '—'}</td>
                          <td><span className="admin-role-badge">{u.role}</span></td>
                          <td style={{ fontSize: 'var(--text-sm)' }}>{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="admin-table-actions-col">
                            <button type="button" className="btn btn-light-blue btn-sm" onClick={() => { setEditingUserId(u.id); setEditingUserName(u.name ?? ''); setEditingUserPhone(u.phone ?? ''); setEditingUserRole(u.role); }}>Edit</button>
                            <button type="button" className="btn btn-light-blue btn-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button type="button" className="btn btn-light-blue" disabled={usersPage <= 1} onClick={() => setUsersPage((p) => p - 1)}>Previous</button>
                <span>Page {usersPage} of {usersTotalPages} ({usersTotal} total)</span>
                <button type="button" className="btn btn-light-blue" disabled={usersPage >= usersTotalPages} onClick={() => setUsersPage((p) => p + 1)}>Next</button>
              </div>
            </div>
          </>
        ) : tab === 'prompts' ? (
          <div className="card admin-content-card">
            {prompts.length === 0 ? (
              <p>No prompts.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {prompts.map((p) => (
                  <div key={p.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                      {p.user?.email ?? '—'} · {new Date(p.createdAt).toLocaleString()}
                    </div>
                    <strong>{p.category?.name} / {p.subCategory?.name}</strong>
                    <p style={{ marginTop: '0.25rem' }}>{p.userPrompt}</p>
                    <details style={{ marginTop: '0.5rem' }}>
                      <summary className="details-summary-blue">Lesson</summary>
                      <div className="lesson-content" style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{p.generatedLesson}</div>
                    </details>
                  </div>
                ))}
              </div>
            )}
            <div className="pagination">
              <button type="button" className="btn btn-light-blue" disabled={promptsPage <= 1} onClick={() => setPromptsPage((p) => p - 1)}>Previous</button>
              <span>Page {promptsPage} of {promptsTotalPages} ({promptsTotal} total)</span>
              <button type="button" className="btn btn-light-blue" disabled={promptsPage >= promptsTotalPages} onClick={() => setPromptsPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        ) : (
          <>
            <form className="admin-add-form admin-add-form--compact card" onSubmit={handleAddCategory}>
              <div className="form-group">
                <label htmlFor="new-category-name">Category name</label>
                <input
                  id="new-category-name"
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="input"
                />
              </div>
              <button type="submit" className="btn btn-primary">Add category</button>
            </form>
            <div className="admin-category-list">
              {categories.length === 0 ? (
                <p style={{ color: 'var(--gray-500)', margin: 0 }}>No categories yet. Add one above.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="admin-category-card">
                <div className="admin-category-header">
                  {editingCategoryId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={(e) => setEditingCategoryName(e.target.value)}
                        className="input"
                        style={{ flex: 1, minWidth: 120 }}
                        autoFocus
                      />
                      <button type="button" className="btn btn-primary" onClick={() => handleUpdateCategory(cat.id)}>Save</button>
                      <button type="button" className="btn btn-light-blue" onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="admin-category-name">{cat.name}</span>
                      <button type="button" className="btn btn-light-blue" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}>Edit</button>
                      <button type="button" className="btn btn-light-blue" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                    </>
                  )}
                </div>
                <div className="admin-sub-section">
                  <div className="admin-sub-add-row">
                    <input
                      type="text"
                      placeholder="New sub-category"
                      value={newSubCategoryName[cat.id] ?? ''}
                      onChange={(e) => setNewSubCategoryName((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                      className="input"
                      style={{ width: 180 }}
                    />
                    <button type="button" className="btn btn-primary" onClick={() => handleAddSubCategory(cat.id)}>Add sub-category</button>
                  </div>
                  {cat.subCategories && cat.subCategories.length > 0 ? (
                    <ul className="admin-sub-list">
                      {(cat.subCategories as SubCategory[]).map((sub) => (
                        <li key={sub.id} className="admin-sub-row">
                          {editingSubCategoryId === sub.id ? (
                            <>
                              <input
                                type="text"
                                value={editingSubCategoryName}
                                onChange={(e) => setEditingSubCategoryName(e.target.value)}
                                className="input"
                                style={{ width: 160 }}
                                autoFocus
                              />
                              <button type="button" className="btn btn-primary" onClick={() => handleUpdateSubCategory(sub.id)}>Save</button>
                              <button type="button" className="btn btn-light-blue" onClick={() => { setEditingSubCategoryId(null); setEditingSubCategoryName(''); }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <span>{sub.name}</span>
                              <button type="button" className="btn btn-light-blue" style={{ fontSize: 'var(--text-sm)' }} onClick={() => { setEditingSubCategoryId(sub.id); setEditingSubCategoryName(sub.name); }}>Edit</button>
                              <button type="button" className="btn btn-light-blue" style={{ fontSize: 'var(--text-sm)' }} onClick={() => handleDeleteSubCategory(sub.id)}>Delete</button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', margin: 0 }}>No sub-categories.</p>
                  )}
                </div>
              </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
