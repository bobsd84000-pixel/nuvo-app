import React, { useState, useCallback, useRef, useEffect } from 'react';

export default function Nuvo() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const localDB = [
    { id: 'l1', name: 'Pomme', cat: 'Fruit', kcal: 52, prot: 0.3, gluc: 14, lip: 0.2, sel: 0 },
    { id: 'l2', name: 'Banane', cat: 'Fruit', kcal: 89, prot: 1.1, gluc: 23, lip: 0.3, sel: 0 },
    { id: 'l3', name: 'Orange', cat: 'Fruit', kcal: 47, prot: 0.9, gluc: 12, lip: 0.1, sel: 0 },
    { id: 'l4', name: 'Brocoli', cat: 'Légume', kcal: 34, prot: 2.8, gluc: 7, lip: 0.4, sel: 0.03 },
    { id: 'l5', name: 'Épinard', cat: 'Légume', kcal: 23, prot: 2.9, gluc: 3.6, lip: 0.4, sel: 0.08 },
    { id: 'l6', name: 'Carotte', cat: 'Légume', kcal: 41, prot: 0.9, gluc: 10, lip: 0.2, sel: 0.07 },
    { id: 'l7', name: 'Lait', cat: 'Dairy', kcal: 42, prot: 3.4, gluc: 5, lip: 1, sel: 0.04 },
    { id: 'l8', name: 'Fromage', cat: 'Dairy', kcal: 402, prot: 25, gluc: 1.3, lip: 33, sel: 1.8 },
    { id: 'l9', name: 'Œuf', cat: 'Protein', kcal: 155, prot: 13, gluc: 1.1, lip: 11, sel: 0.3 },
    { id: 'l10', name: 'Poulet', cat: 'Protein', kcal: 165, prot: 31, gluc: 0, lip: 3.6, sel: 0.1 },
    { id: 'l11', name: 'Poisson', cat: 'Protein', kcal: 206, prot: 22, gluc: 0, lip: 12, sel: 0.1 },
    { id: 'l12', name: 'Amande', cat: 'Nuts', kcal: 579, prot: 21, gluc: 22, lip: 50, sel: 0 },
    { id: 'l13', name: 'Noix', cat: 'Nuts', kcal: 654, prot: 15, gluc: 14, lip: 65, sel: 0 },
    { id: 'l14', name: 'Avocat', cat: 'Fruit', kcal: 160, prot: 2, gluc: 9, lip: 15, sel: 0.01 },
    { id: 'l15', name: 'Riz', cat: 'Grain', kcal: 130, prot: 2.7, gluc: 28, lip: 0.3, sel: 0 },
  ];

  const handleSearch = useCallback((q) => {
    setSearch(q);

    if (abortRef.current) abortRef.current.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceRef.current = setTimeout(async () => {
      const lower = q.toLowerCase();

      const local = localDB.filter(f =>
        f.name.toLowerCase().includes(lower) ||
        f.cat.toLowerCase().includes(lower)
      );

      const controller = new AbortController();
      abortRef.current = controller;

      let apiResults = [];
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15&fields=code,product_name,nutriments`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        apiResults = (data.products || [])
          .filter(p => p.product_name && p.nutriments)
          .map(p => {
            const n = p.nutriments;
            return {
              id: `off-${p.code}`,
              name: p.product_name,
              cat: 'OpenFoodFacts',
              kcal: Math.round(n['energy-kcal_100g'] || 0),
              prot: +(n.proteins_100g || 0).toFixed(1),
              gluc: +(n.carbohydrates_100g || 0).toFixed(1),
              lip: +(n.fat_100g || 0).toFixed(1),
              sel: +(n.salt_100g || 0).toFixed(2),
            };
          });
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('OFF fetch error:', e);
        }
      }

      const localNames = new Set(local.map(f => f.name.toLowerCase()));
      const deduped = apiResults.filter(a => !localNames.has(a.name.toLowerCase()));

      setResults([...local, ...deduped].slice(0, 20));
      setLoading(false);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const add = (food) => {
    if (!selected.find(s => s.id === food.id)) {
      setSelected([...selected, food]);
    }
  };

  const remove = (id) => {
    setSelected(selected.filter(s => s.id !== id));
  };

  const totals = selected.reduce((a, f) => ({
    kcal: a.kcal + f.kcal,
    prot: a.prot + f.prot,
    gluc: a.gluc + f.gluc,
    lip: a.lip + f.lip,
    sel: a.sel + f.sel,
  }), { kcal: 0, prot: 0, gluc: 0, lip: 0, sel: 0 });

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'system-ui, -apple-system' }}>
      <h1 style={{ margin: '0 0 5px 0' }}>NUVO v8</h1>
      <p style={{ margin: '0 0 20px 0', color: '#666' }}>Nutrition Tracker · Local + OpenFoodFacts</p>

      <input
        type="text"
        placeholder="Search foods..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 15, borderRadius: 6, border: '1px solid #ddd', boxSizing: 'border-box' }}
      />

      {loading && <p style={{ color: '#999' }}>Searching...</p>}

      {results.length > 0 && (
        <div style={{ marginBottom: 20, background: '#fafafa', padding: 15, borderRadius: 6 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10 }}>Results ({results.length})</h3>
          {results.map(f => (
            <div key={f.id} style={{ padding: 10, marginBottom: 8, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{f.name}</strong>
                <div style={{ fontSize: 12, color: f.cat === 'OpenFoodFacts' ? '#f57c00' : '#999' }}>{f.cat}</div>
              </div>
              <button onClick={() => add(f)} style={{ padding: '6px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 6, marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Selected ({selected.length})</h3>
        {selected.length === 0 ? (
          <p style={{ color: '#999' }}>Add foods...</p>
        ) : (
          selected.map(f => (
            <div key={f.id} style={{ padding: 10, marginBottom: 8, background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <strong>{f.name}</strong>
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>{f.kcal}kcal · P:{f.prot}g G:{f.gluc}g L:{f.lip}g Sel:{f.sel}g</div>
              </div>
              <button onClick={() => remove(f.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 10 }}>×</button>
            </div>
          ))
        )}
      </div>

      {selected.length > 0 && (
        <div style={{ padding: 15, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6 }}>
          <h3 style={{ marginTop: 0 }}>Daily Totals (per 100g each)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><div style={{ fontSize: 12, color: '#666' }}>Énergie (kcal)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.kcal}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Protéines (g)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.prot.toFixed(1)}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Glucides (g)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.gluc.toFixed(1)}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Lipides (g)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.lip.toFixed(1)}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Sel (g)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.sel.toFixed(2)}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
