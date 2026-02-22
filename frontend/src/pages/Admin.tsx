import { useState, useEffect, useRef } from 'react';
import { adminApi } from '../services/api';
import type { User, PromptItem, Category, SubCategory } from '../services/api';
import { PaginationBar } from '../components/PaginationBar';
import { getCategoryImageUrl } from '../utils/categoryImage';

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const SEARCH_DEBOUNCE_MS = 400;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setDebounced(value), delayMs);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [value, delayMs]);
  return debounced;
}

type Tab = 'users' | 'prompts' | 'categories';

type AdminPrompt = PromptItem & { user?: { id: string; email?: string; name?: string; phone?: string }; category?: { name: string }; subCategory?: { name: string } };

export function Admin() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRole, setUsersRole] = useState<string>('');
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [promptsTotal, setPromptsTotal] = useState(0);
  const [promptsPage, setPromptsPage] = useState(1);
  const [promptsLimit, setPromptsLimit] = useState(10);
  const [promptsSearch, setPromptsSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesLimit, setCategoriesLimit] = useState(10);
  const [categoriesSearch, setCategoriesSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const usersSearchDebounced = useDebouncedValue(usersSearch, SEARCH_DEBOUNCE_MS);
  const promptsSearchDebounced = useDebouncedValue(promptsSearch, SEARCH_DEBOUNCE_MS);
  const categoriesSearchDebounced = useDebouncedValue(categoriesSearch, SEARCH_DEBOUNCE_MS);

  // Users: add form in slide-over & edit
  const [addUserSlideOpen, setAddUserSlideOpen] = useState(false);
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
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [addingWithImage, setAddingWithImage] = useState<'idle' | 'generate' | 'upload'>('idle');

  useEffect(() => {
    if (tab !== 'users') return;
    setLoading(true);
    adminApi
      .users(usersPage, usersLimit, {
        search: usersSearchDebounced.trim() || undefined,
        role: usersRole || undefined,
      })
      .then((r) => {
        setUsers(r.data.data);
        setUsersTotal(r.data.total);
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }, [tab, usersPage, usersLimit, usersSearchDebounced, usersRole]);

  useEffect(() => {
    if (tab === 'users') setUsersPage(1);
  }, [usersSearchDebounced, usersRole, usersLimit, tab]);

  useEffect(() => {
    if (tab !== 'prompts') return;
    setLoading(true);
    adminApi
      .prompts(promptsPage, promptsLimit, promptsSearchDebounced.trim() || undefined)
      .then((r) => {
        setPrompts(r.data.data);
        setPromptsTotal(r.data.total);
      })
      .catch(() => setError('Failed to load prompts'))
      .finally(() => setLoading(false));
  }, [tab, promptsPage, promptsLimit, promptsSearchDebounced]);

  useEffect(() => {
    if (tab === 'prompts') setPromptsPage(1);
  }, [promptsSearchDebounced, promptsLimit, tab]);

  useEffect(() => {
    if (tab !== 'categories') return;
    setLoading(true);
    adminApi
      .categories()
      .then((r) => setCategories(r.data.data))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false));
  }, [tab]);

  const categoriesFiltered = categoriesSearchDebounced.trim()
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(categoriesSearchDebounced.trim().toLowerCase())
      )
    : categories;
  const categoriesTotalPages = Math.ceil(categoriesFiltered.length / categoriesLimit) || 1;
  const categoriesOnPage = categoriesFiltered.slice(
    (categoriesPage - 1) * categoriesLimit,
    categoriesPage * categoriesLimit
  );

  useEffect(() => {
    if (tab === 'categories') {
      const maxPage = Math.ceil(categoriesFiltered.length / categoriesLimit) || 1;
      setCategoriesPage((p) => Math.min(p, maxPage));
    }
  }, [tab, categoriesFiltered.length, categoriesLimit]);

  const refreshUsers = () => {
    adminApi
      .users(usersPage, usersLimit, { search: usersSearchDebounced.trim() || undefined, role: usersRole || undefined })
      .then((r) => {
        setUsers(r.data.data);
        setUsersTotal(r.data.total);
      })
      .catch(() => setError('Failed to load users'));
  };

  const refreshCategories = () => {
    adminApi.categories().then((r) => setCategories(r.data.data)).catch(() => setError('Failed to load categories'));
  };

  const usersTotalPages = Math.ceil(usersTotal / usersLimit) || 1;
  const promptsTotalPages = Math.ceil(promptsTotal / promptsLimit) || 1;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) return;
    setError('');
    try {
      await adminApi.createUser({ name: newUserName.trim(), phone: newUserPhone.trim(), role: newUserRole });
      setNewUserName('');
      setNewUserPhone('');
      setNewUserRole('USER');
      setAddUserSlideOpen(false);
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

  const handleAddCategoryAndGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setError('');
    setAddingWithImage('generate');
    try {
      const res = await adminApi.createCategory(newCategoryName.trim());
      await adminApi.generateCategoryImage(res.data.data.id);
      setNewCategoryName('');
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } }; code?: string };
      const msg = res?.response?.data?.error;
      if (msg) setError(msg);
      else if (res?.code === 'ECONNABORTED' || !res?.response)
        setError('Request timed out or connection failed. Try again.');
      else setError('Failed to add category or generate image');
    } finally {
      setAddingWithImage('idle');
    }
  };

  const handleAddCategoryWithFile = async (file: File) => {
    if (!newCategoryName.trim()) {
      setError('Enter a category name first');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    setError('');
    setAddingWithImage('upload');
    try {
      const res = await adminApi.createCategory(newCategoryName.trim());
      await adminApi.uploadCategoryImage(res.data.data.id, file);
      setNewCategoryName('');
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } }; code?: string };
      const msg = res?.response?.data?.error;
      if (msg) setError(msg);
      else if (res?.code === 'ECONNABORTED' || !res?.response)
        setError('Request timed out or connection failed. Wait a moment and try again (server may be starting). If it still fails, try a smaller image.');
      else setError('Failed to add category or upload image');
    } finally {
      setAddingWithImage('idle');
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

  const handleGenerateCategoryImage = async (id: string) => {
    setError('');
    setGeneratingImageId(id);
    try {
      await adminApi.generateCategoryImage(id);
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } }; code?: string };
      const msg = res?.response?.data?.error;
      if (msg) setError(msg);
      else if (res?.code === 'ECONNABORTED' || !res?.response)
        setError('Request timed out or connection failed. The server may be slow; try again.');
      else setError('Failed to generate image');
    } finally {
      setGeneratingImageId(null);
    }
  };

  const handleUploadCategoryImage = async (id: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    setError('');
    try {
      await adminApi.uploadCategoryImage(id, file);
      refreshCategories();
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } }; code?: string };
      const msg = res?.response?.data?.error;
      if (msg) setError(msg);
      else if (res?.code === 'ECONNABORTED' || !res?.response)
        setError('Request timed out or connection failed. Wait a moment and try again (server may be starting). If it still fails, try a smaller image.');
      else setError('Failed to upload image');
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

  const pageTitles: Record<Tab, string> = { users: 'Users', prompts: 'Prompts', categories: 'Categories' };

  const IconPencil = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
  );
  const IconTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
  );

  return (
    <>
      <header className="admin-header">
        <nav className="admin-nav-bar">
          <button type="button" className={`admin-nav-link ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); setError(''); }}>Users</button>
          <button type="button" className={`admin-nav-link ${tab === 'prompts' ? 'active' : ''}`} onClick={() => { setTab('prompts'); setError(''); }}>Prompts</button>
          <button type="button" className={`admin-nav-link ${tab === 'categories' ? 'active' : ''}`} onClick={() => { setTab('categories'); setError(''); }}>Categories</button>
        </nav>
        <div className="admin-page-header">
          <h1 className="admin-page-title">{pageTitles[tab]}</h1>
          {tab === 'users' && (
            <button type="button" className="admin-btn-primary" onClick={() => setAddUserSlideOpen(true)}>Add User</button>
          )}
        </div>
      </header>
      <div className="admin-body">
        {error && <p className="error-msg">{error}</p>}
        {tab === 'users' ? (
          <>
            <div className="admin-filters admin-content-card">
              <div className="admin-filter-row">
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Search</span>
                  <input
                    type="text"
                    className="input admin-filter-input"
                    placeholder="Name or phone..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                  />
                </label>
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Role</span>
                  <select
                    className="input admin-filter-input admin-filter-select"
                    value={usersRole}
                    onChange={(e) => setUsersRole(e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </label>
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Per page</span>
                  <select
                    className="input admin-filter-input admin-filter-select"
                    value={usersLimit}
                    onChange={(e) => setUsersLimit(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className={`table-wrap admin-content-card admin-users-table ${loading ? 'admin-table-loading' : ''}`}>
              {loading && <div className="admin-loading-overlay" aria-hidden><span className="admin-loading-spinner" /> Loading…</div>}
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
                          <td style={{ fontSize: 'var(--text-sm)', color: 'var(--admin-slate-light)' }}>{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="admin-table-actions-col">
                            <button type="button" className="admin-btn-primary" style={{ marginRight: 4 }} onClick={() => handleUpdateUser(u.id)}>Save</button>
                            <button type="button" className="admin-btn-secondary" onClick={() => { setEditingUserId(null); setEditingUserName(''); setEditingUserPhone(''); setEditingUserRole('USER'); }}>Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{u.name ?? '—'}</td>
                          <td>{u.phone ?? '—'}</td>
                          <td><span className="admin-role-badge">{u.role}</span></td>
                          <td style={{ fontSize: 'var(--text-sm)', color: 'var(--admin-slate-light)' }}>{new Date(u.createdAt).toLocaleString()}</td>
                          <td className="admin-table-actions-col">
                            <button type="button" className="admin-icon-btn" onClick={() => { setEditingUserId(u.id); setEditingUserName(u.name ?? ''); setEditingUserPhone(u.phone ?? ''); setEditingUserRole(u.role); }} title="Edit" aria-label="Edit"><IconPencil /></button>
                            <button type="button" className="admin-icon-btn admin-icon-btn-danger" onClick={() => handleDeleteUser(u.id)} title="Delete" aria-label="Delete"><IconTrash /></button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationBar>
                <div className="pagination">
                  <button type="button" className="admin-btn-secondary" disabled={usersPage <= 1} onClick={() => setUsersPage((p) => p - 1)}>Previous</button>
                  <span>Page {usersPage} of {usersTotalPages} ({usersTotal} total)</span>
                  <button type="button" className="admin-btn-secondary" disabled={usersPage >= usersTotalPages} onClick={() => setUsersPage((p) => p + 1)}>Next</button>
                </div>
              </PaginationBar>
            </div>
            {addUserSlideOpen && (
              <>
                <div className="admin-slide-over-overlay" onClick={() => setAddUserSlideOpen(false)} aria-hidden />
                <div className="admin-slide-over" role="dialog" aria-labelledby="admin-add-user-title">
                  <div className="admin-slide-over-header">
                    <h2 id="admin-add-user-title" className="admin-slide-over-title">Add User</h2>
                    <button type="button" className="admin-slide-over-close" onClick={() => setAddUserSlideOpen(false)} aria-label="Close">×</button>
                  </div>
                  <form className="admin-slide-over-body" onSubmit={handleAddUser}>
                    <div className="form-group">
                      <label htmlFor="new-user-name">Name</label>
                      <input id="new-user-name" type="text" placeholder="Full name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-user-phone">Phone</label>
                      <input id="new-user-phone" type="text" placeholder="Phone number" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-user-role">Role</label>
                      <select id="new-user-role" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <button type="submit" className="admin-btn-primary">Add User</button>
                  </form>
                </div>
              </>
            )}
          </>
        ) : tab === 'prompts' ? (
          <>
            <div className="admin-filters admin-content-card">
              <div className="admin-filter-row">
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Search</span>
                  <input
                    type="text"
                    className="input admin-filter-input"
                    placeholder="Prompt, category, user..."
                    value={promptsSearch}
                    onChange={(e) => setPromptsSearch(e.target.value)}
                  />
                </label>
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Per page</span>
                  <select
                    className="input admin-filter-input admin-filter-select"
                    value={promptsLimit}
                    onChange={(e) => setPromptsLimit(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className={`admin-content-card admin-content-card--with-list ${loading ? 'admin-table-loading' : ''}`} style={{ padding: 'var(--space-4)' }}>
              {loading && <div className="admin-loading-overlay" aria-hidden><span className="admin-loading-spinner" /> Loading…</div>}
            {prompts.length === 0 && !loading ? (
              <p className="admin-empty-state">No prompts.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {prompts.map((p) => (
                  <div key={p.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>
                      {p.user?.name ?? p.user?.phone ?? '—'} · {new Date(p.createdAt).toLocaleString()}
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
            <PaginationBar>
              <div className="pagination">
                <button type="button" className="admin-btn-secondary" disabled={promptsPage <= 1} onClick={() => setPromptsPage((p) => p - 1)}>Previous</button>
                <span>Page {promptsPage} of {promptsTotalPages} ({promptsTotal} total)</span>
                <button type="button" className="admin-btn-secondary" disabled={promptsPage >= promptsTotalPages} onClick={() => setPromptsPage((p) => p + 1)}>Next</button>
              </div>
            </PaginationBar>
          </div>
          </>
        ) : (
          <>
            <div className="admin-filters admin-content-card">
              <div className="admin-filter-row">
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Search</span>
                  <input
                    type="text"
                    className="input admin-filter-input"
                    placeholder="Category name..."
                    value={categoriesSearch}
                    onChange={(e) => setCategoriesSearch(e.target.value)}
                  />
                </label>
                <label className="admin-filter-item admin-filter-item--inline">
                  <span className="admin-filter-label">Per page</span>
                  <select
                    className="input admin-filter-input admin-filter-select"
                    value={categoriesLimit}
                    onChange={(e) => setCategoriesLimit(Number(e.target.value))}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <form className="admin-add-form admin-add-form--compact admin-add-category-form admin-content-card" style={{ padding: 'var(--space-4)' }} onSubmit={handleAddCategory}>
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
              <div className="admin-add-category-actions">
                <button type="submit" className="admin-btn-primary" disabled={!newCategoryName.trim()}>
                  Add category
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={!newCategoryName.trim() || addingWithImage !== 'idle'}
                  onClick={handleAddCategoryAndGenerateImage}
                >
                  {addingWithImage === 'generate' ? 'Adding…' : 'Add category & generate image'}
                </button>
                <label className="admin-btn-secondary" style={{ marginBottom: 0, cursor: 'pointer' }}>
                  {addingWithImage === 'upload' ? 'Uploading…' : 'Add category & choose image from PC'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    disabled={!newCategoryName.trim() || addingWithImage !== 'idle'}
                    style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleAddCategoryWithFile(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </form>
            <div className="admin-category-list">
              {categories.length === 0 ? (
                <p style={{ color: 'var(--gray-500)', margin: 0 }}>No categories yet. Add one above.</p>
              ) : (
                categoriesOnPage.map((cat) => (
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
                      <button type="button" className="admin-btn-primary" onClick={() => handleUpdateCategory(cat.id)}>Save</button>
                      <button type="button" className="admin-btn-secondary" onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="admin-category-name">{cat.name}</span>
                      <button type="button" className="admin-icon-btn" onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }} title="Edit" aria-label="Edit"><IconPencil /></button>
                      <button type="button" className="admin-icon-btn admin-icon-btn-danger" onClick={() => handleDeleteCategory(cat.id)} title="Delete" aria-label="Delete"><IconTrash /></button>
                    </>
                  )}
                </div>
                <div className="admin-category-image-section">
                  <div className="admin-category-image-preview-wrap">
                    <div className="admin-category-image-preview" style={{ backgroundImage: `url(${getCategoryImageUrl(cat)})` }} aria-hidden />
                    {!cat.imageUrl && (
                      <span className="admin-category-image-fallback-hint">Default URL</span>
                    )}
                  </div>
                  <div className="admin-category-image-actions">
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      disabled={generatingImageId === cat.id}
                      onClick={() => handleGenerateCategoryImage(cat.id)}
                    >
                      {generatingImageId === cat.id ? 'Generating…' : 'Generate with AI'}
                    </button>
                    <label className="admin-btn-secondary" style={{ marginBottom: 0, cursor: 'pointer' }}>
                      Choose from PC
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadCategoryImage(cat.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
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
                    <button type="button" className="admin-btn-primary" onClick={() => handleAddSubCategory(cat.id)}>Add sub-category</button>
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
                              <button type="button" className="admin-btn-primary" onClick={() => handleUpdateSubCategory(sub.id)}>Save</button>
                              <button type="button" className="admin-btn-secondary" onClick={() => { setEditingSubCategoryId(null); setEditingSubCategoryName(''); }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <span>{sub.name}</span>
                              <button type="button" className="admin-icon-btn" onClick={() => { setEditingSubCategoryId(sub.id); setEditingSubCategoryName(sub.name); }} title="Edit" aria-label="Edit"><IconPencil /></button>
                              <button type="button" className="admin-icon-btn admin-icon-btn-danger" onClick={() => handleDeleteSubCategory(sub.id)} title="Delete" aria-label="Delete"><IconTrash /></button>
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
            <PaginationBar className="admin-categories-pagination">
              <div className="pagination">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={categoriesPage <= 1}
                  onClick={() => setCategoriesPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>Page {categoriesPage} of {categoriesTotalPages} ({categoriesFiltered.length} total)</span>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  disabled={categoriesPage >= categoriesTotalPages}
                  onClick={() => setCategoriesPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </PaginationBar>
          </>
        )}
      </div>
    </>
  );
}
