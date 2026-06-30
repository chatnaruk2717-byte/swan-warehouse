import React, { useState, useEffect } from 'react';
import { Package, PlusCircle, RefreshCw, Layers, Archive, Check, AlertCircle } from 'lucide-react';
import './App.css';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  created_at?: string;
}

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? '/api' 
  : 'https://warehouse-api.chatnaruk2717.workers.dev/api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch products from API
  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setErrorMessage('ไม่สามารถเชื่อมต่อกับ Serverless API ได้ กรุณาตรวจสอบว่ารันบริการ backend (wrangler) อยู่หรือไม่');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Submit product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantity) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          quantity: parseInt(quantity, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }

      const newProduct = await response.json();
      setProducts((prev) => [newProduct, ...prev]);
      
      // Reset form
      setName('');
      setPrice('');
      setQuantity('');
      
      setSuccessMessage('บันทึกข้อมูลสินค้าลง D1 Database สำเร็จ!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setErrorMessage(err.message || 'ไม่สามารถบันทึกข้อมูลสินค้าได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-title">
          <h1>
            <Package size={28} />
            <span>ระบบบันทึกพัสดุและคลังสินค้า</span>
          </h1>
          <p>Cloudflare Workers + Hono + D1 Database + React (Vite)</p>
        </div>
        <span className="badge">Serverless App</span>
      </header>

      {successMessage && (
        <div className="alert-success">
          <Check size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert-success" style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#dc2626' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid-layout">
        {/* Left Column: Form */}
        <section className="glass-card">
          <h2 className="card-title">
            <PlusCircle size={18} />
            <span>เพิ่มรายการสินค้าใหม่</span>
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ชื่อสินค้า (Product Name)</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="ระบุชื่อสินค้าหรือรหัสสินค้า"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">ราคาสินค้าต่อหน่วย (Price)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">จำนวนสินค้าในสต็อก (Quantity)</label>
              <input
                type="number"
                required
                className="form-input"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูลสินค้า'}
            </button>
          </form>
        </section>

        {/* Right Column: Products List */}
        <section className="glass-card">
          <div className="card-title" style={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} />
              <span>รายการสินค้าในคลัง (D1 Database)</span>
            </div>
            <button 
              onClick={fetchProducts} 
              disabled={isLoading}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1b4d3e', display: 'flex', alignItems: 'center' }}
              title="ดึงข้อมูลใหม่"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {isLoading && products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid #1b4d3e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>กำลังเรียกคืนข้อมูลจาก D1 Database...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Archive size={40} style={{ margin: '0 auto 1rem auto', display: 'block', color: '#cbd5e1' }} />
              <p>ไม่มีรายการสินค้าในระบบ</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>กรอกข้อมูลด้านซ้ายเพื่อเพิ่มสินค้าชิ้นแรกของคุณ</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }} className="text-center">ID</th>
                    <th>ชื่อสินค้า</th>
                    <th style={{ width: '100px' }} className="text-center">ราคา / หน่วย</th>
                    <th style={{ width: '80px' }} className="text-center">จำนวน</th>
                    <th style={{ width: '120px' }} className="text-center">รวมมูลค่า</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td className="text-center" style={{ fontFamily: 'monospace', color: '#94a3b8' }}>#{item.id}</td>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td className="text-center" style={{ fontFamily: 'monospace' }}>฿{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-center font-mono" style={{ fontWeight: 600 }}>{item.quantity}</td>
                      <td className="text-center text-orange" style={{ fontFamily: 'monospace' }}>
                        ฿{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
export default App;
