import { useState, useEffect, type FormEvent } from 'react';
import { categoriesApi, promptsApi } from '../services/api';

type Cat = { id: string; name: string; subCategories: { id: string; name: string }[] };

const CATEGORY_IMAGES: Record<string, string> = {
  Programming: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80',
  Mathematics: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
  'Data Science': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
  'Generative AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80',
};

function getCategoryImage(name: string): string {
  return CATEGORY_IMAGES[name] ?? `https://picsum.photos/seed/${encodeURIComponent(name)}/400/280`;
}

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
    categoriesApi
      .list()
      .then((r) => setCategories(r.data.data))
      .catch(() => setError('Failed to load categories'));
  }, []);

  const subCategories = categoryId
    ? (categories.find((c) => c.id === categoryId)?.subCategories ?? [])
    : [];

  useEffect(() => {
    setSubCategoryId('');
  }, [categoryId]);

  const handleCardClick = (id: string) => {
    setCategoryId(id);
    setResult(null);
    setError('');
  };

  const handleBackToCategories = () => {
    setCategoryId('');
    setSubCategoryId('');
    setPrompt('');
    setResult(null);
    setError('');
  };

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

  const selectedCategory = categoryId ? categories.find((c) => c.id === categoryId) : null;

  return (
    <div className="dashboard-page">
      {!categoryId ? (
        <>
          <header className="dashboard-header">
            {/* <h1 className="dashboard-title">Dashboard</h1> */}
            <p className="dashboard-subtitle">
              Choose a category to start learning with AI-powered lessons.
            </p>
          </header>
          <section className="dashboard-categories">
            {/* <h2 className="dashboard-section-title">Categories</h2> */}
            <div className="category-cards">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="category-card"
                  onClick={() => handleCardClick(c.id)}
                >
                  <div
                    className="category-card-image"
                    style={{ backgroundImage: `url(${getCategoryImage(c.name)})` }}
                  />
                  <div className="category-card-body">
                    <span>{c.name}</span>
                    <span className="arrow">→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="dashboard-lesson-flow">
          <header className="lesson-header">
            <button type="button" className="btn-back" onClick={handleBackToCategories}>
              ← Categories
            </button>
            {selectedCategory && (
              <div className="lesson-header-category">
                <div
                  className="selected-category-badge-image"
                  style={{ backgroundImage: `url(${getCategoryImage(selectedCategory.name)})` }}
                />
                <strong className="selected-category-name">{selectedCategory.name}</strong>
              </div>
            )}
          </header>

          <section className="prompt-section">
            <div className="prompt-form-card">
              <h2 className="prompt-form-title">What do you want to learn?</h2>
              <form onSubmit={handleSubmit} className="prompt-form">
                <div className="form-group">
                  <label>Sub-category</label>
                  <select
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select sub-category</option>
                    {subCategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Your question or topic</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    placeholder="e.g. Explain closures in JavaScript"
                    required
                  />
                </div>
                {error && <p className="error-msg">{error}</p>}
                <button type="submit" className="btn btn-primary prompt-submit-btn" disabled={loading}>
                  {loading ? 'Generating lesson...' : 'Generate lesson'}
                </button>
              </form>
            </div>
            {result && (
              <div className="card lesson-result-card">
                <div className="lesson-result-meta">
                  <span className="lesson-result-category">
                    {result.category?.name} / {result.subCategory?.name}
                  </span>
                  <p className="lesson-result-prompt">{result.userPrompt}</p>
                </div>
                <div className="lesson-content">{result.generatedLesson}</div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
