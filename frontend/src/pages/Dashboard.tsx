import { useState, useEffect, type FormEvent } from 'react';
import { categoriesApi, promptsApi } from '../services/api';
import { PaginationBar } from '../components/PaginationBar';
import { getCategoryImageUrl } from '../utils/categoryImage';

type Cat = { id: string; name: string; imageUrl?: string | null; subCategories: { id: string; name: string }[] };

const CATEGORIES_PER_PAGE = 9;

export function Dashboard() {
  const [categories, setCategories] = useState<Cat[]>([]);
  const [categoriesPage, setCategoriesPage] = useState(1);
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

  const categoriesTotalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE) || 1;
  const categoriesOnPage = categories.slice(
    (categoriesPage - 1) * CATEGORIES_PER_PAGE,
    categoriesPage * CATEGORIES_PER_PAGE
  );

  return (
    <div className="dashboard-page">
      {!categoryId ? (
        <>
          <section className="dashboard-categories">
            <h2 className="dashboard-section-title">Choose a category to start learning with AI-powered lessons.</h2>
            <div className="category-cards">
              {categoriesOnPage.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="category-card"
                  onClick={() => handleCardClick(c.id)}
                >
                  <div
                    className="category-card-image"
                    style={{ backgroundImage: `url(${getCategoryImageUrl(c)})` }}
                  />
                  <div className="category-card-body">
                    <span>{c.name}</span>
                    <span className="arrow">→</span>
                  </div>
                </button>
              ))}
            </div>
            <PaginationBar>
              <div className="pagination dashboard-categories-pagination">
                <button
                  type="button"
                  className="btn btn-light-blue"
                  disabled={categoriesPage <= 1}
                  onClick={() => setCategoriesPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>Page {categoriesPage} of {categoriesTotalPages} ({categories.length} total)</span>
                <button
                  type="button"
                  className="btn btn-light-blue"
                  disabled={categoriesPage >= categoriesTotalPages}
                  onClick={() => setCategoriesPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </PaginationBar>
          </section>
        </>
      ) : (
        <div className="dashboard-lesson-flow">
          <header className="lesson-header">
            <button type="button" className="btn-back" onClick={handleBackToCategories}>
              ← Categories
            </button>
            {selectedCategory && (
              <div className="lesson-hero-banner">
                <div
                  className="lesson-hero-icon"
                  style={{ backgroundImage: `url(${getCategoryImageUrl(selectedCategory)})` }}
                  aria-hidden
                />
                <div className="lesson-hero-text">
                  <h1 className="lesson-hero-title">{selectedCategory.name}</h1>
                  <p className="lesson-hero-subtitle">Generate a personalized lesson</p>
                </div>
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
