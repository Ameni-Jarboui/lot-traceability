import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function LotCreate() {
  const [form, setForm] = useState({
    produit: '', origine: '', campagne: '', quantite: '', datePeremption: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/lots', { ...form, quantite: parseFloat(form.quantite) });
      navigate(`/lots/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20 }}>
      <h2>Nouveau lot (Réception)</h2>
      <form onSubmit={handleSubmit}>
        <input name="produit" placeholder="Produit (ex: Huile Olive)" onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        <input name="origine" placeholder="Origine" onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        <input name="campagne" placeholder="Campagne (ex: 2026)" onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        <input name="quantite" type="number" step="0.01" placeholder="Quantité" onChange={handleChange} required style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        <input name="datePeremption" type="date" onChange={handleChange} style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: 10, width: '100%' }}>Créer le lot</button>
      </form>
    </div>
  );
}