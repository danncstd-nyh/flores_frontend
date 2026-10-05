import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const canManageProducts = user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const totalUnits = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const listedStockValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0), 0);

  return (
    <div className="workspace">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">🕷</span>
          <span>PARKER<span className="brand-divider">/</span>STOCKROOM</span>
        </div>
        <div className="topbar-actions">
          <span className="account">Signed in as <strong>{user.username}</strong><span className={`role-tag${canManageProducts ? ' admin' : ''}`}>{canManageProducts ? 'Admin' : 'View only'}</span></span>
          <button className="button button-quiet" onClick={onLogout}>Sign out <span aria-hidden="true">↗</span></button>
        </div>
      </header>

      <main className="content">
        {error && <div className="alert error" role="alert">{error}</div>}
        {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}</div>}

        <section className="page-heading">
          <div>
            <p className="eyebrow">Field operations / stockroom 01</p>
            <h1>Product inventory</h1>
            <p>Catalog overview and current stock.</p>
          </div>
          {canManageProducts && (
            <div className="page-actions">
              <button className="button" onClick={() => setFormFor({})}><span aria-hidden="true">+</span> Add product</button>
            </div>
          )}
        </section>

        <section className="stats" aria-label="Inventory summary">
          <div className="stat"><span className="stat-label">Catalog items</span><strong className="stat-value">{products.length.toString().padStart(2, '0')}</strong></div>
          <div className="stat"><span className="stat-label">Units on hand</span><strong className="stat-value">{totalUnits.toLocaleString('en-PH')}</strong></div>
          <div className="stat"><span className="stat-label">Stock at listed price</span><strong className="stat-value">{peso.format(listedStockValue)}</strong></div>
        </section>

        <section className="catalog" aria-label="Product catalog">
          <div className="catalog-head">
            <h2>Current catalog</h2>
            <span className="catalog-meta">{products.length} {products.length === 1 ? 'record' : 'records'}</span>
          </div>
          {loading ? <div className="loading-state">Loading inventory…</div> : (
            products.length === 0 ? (
              <div className="empty-state"><span className="empty-mark" aria-hidden="true">🕷</span><p>No products in the catalog.</p></div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>#</th><th>Product</th><th>Description</th><th className="numeric">Unit price</th><th className="numeric">On hand</th><th>Added</th>{canManageProducts && <th aria-label="Actions"></th>}</tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="product-id">{product.id.toString().padStart(3, '0')}</td>
                        <td className="product-name">{product.product_name}</td>
                        <td className="product-description">{product.description || '—'}</td>
                        <td className="numeric product-price">{peso.format(product.price)}</td>
                        <td className="numeric quantity-value">{Number(product.quantity).toLocaleString('en-PH')}</td>
                        <td className="created-value">{product.created_at}</td>
                        {canManageProducts && (
                          <td>
                            <div className="row-actions">
                              <button className="button button-blue button-small" onClick={() => setFormFor(product)}>Edit</button>
                              <button className="button button-danger button-small" onClick={() => handleDelete(product)}>Delete</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </section>
      </main>

      {formFor && (
        <ProductForm
          product={formFor.id ? formFor : null}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      )}
    </div>
  );
}
