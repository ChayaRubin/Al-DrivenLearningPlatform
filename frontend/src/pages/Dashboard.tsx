import { useState, useEffect, type FormEvent } from 'react';
import { categoriesApi, promptsApi } from '../services/api';

type Cat = { id: string; name: string; subCategories: { id: string; name: string }[] };

export function Dashboard() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    userPrompt: string;
    generatedLesson: string;
    category?: { name: string };
    subCategory?: { name: string };
  } | null>(null);

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.data.data)).catch(() => setError('Failed to load categories'));
  }, []);

  const subCategories = categoryId ? (categories.find((c) => c.id === categoryId)?.subCategories ?? []) : [];

  useEffect(() => {
    setSubCategoryId('');
  }, [categoryId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!categoryId || !subCategoryId || !prompt.trim()) {
      setError('Please select category, sub-category and enter a prompt');
      return;
    }
    setLoading(true);
    try {
      const { data } = await promptsApi.create(categoryId, subCategoryId, prompt.trim());
      setResult(data.data);
    } catch (err: unknown) {
      const res = err as { response?: { data?: { error?: string } } };
      setError(res?.response?.data?.error || 'Failed to generate lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <h1 className="page-title">Dashboard</h1>
      </div>
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>New learning prompt</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Sub-category</label>
            <select
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              required
              disabled={!categoryId}
            >
              <option value="">Select sub-category</option>
              {subCategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>What do you want to learn?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. Explain closures in JavaScript"
              required
            />
          </div>
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating lesson...' : 'Generate lesson'}
          </button>
        </form>
      </div>
      {result && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{result.category?.name} / {result.subCategory?.name}</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>{result.userPrompt}</p>
          <div className="lesson-content">{result.generatedLesson}</div>
        </div>
      )}
    </>
  );
}
