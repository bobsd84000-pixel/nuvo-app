import React, { useState, useCallback, useRef, useEffect } from 'react';

export default function Nuvo() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const localDB = [
    { id: 'l1', name: 'Pomme', cat: 'Fruit', K: 195, Mg: 5, Ca: 5, Fe: 0.2 },
    { id: 'l2', name: 'Banane', cat: 'Fruit', K: 358, Mg: 27, Ca: 5, Fe: 0.3 },
    { id: 'l3', name: 'Orange', cat: 'Fruit', K: 181, Mg: 10, Ca: 40, Fe: 0.1 },
    { id: 'l4', name: 'Brocoli', cat: 'Légume', K: 316, Mg: 21, Ca: 47, Fe: 0.7 },
    { id: 'l5', name: 'Épinard', cat: 'Légume', K: 558, Mg: 79, Ca: 99, Fe: 2.7 },
    { id: 'l6', name: 'Carotte', cat: 'Légume', K: 320, Mg: 12, Ca: 33, Fe: 0.3 },
    { id: 'l7', name: 'Lait', cat: 'Dairy', K: 149, Mg: 12, Ca: 113, Fe: 0.1 },
    { id: 'l8', name: 'Fromage', cat: 'Dairy', K: 98, Mg: 28, Ca: 721, Fe: 0.7 },
    { id: 'l9', name: 'Œuf', cat: 'Protein', K: 126, Mg: 10, Ca: 50, Fe: 1.8 },
    { id: 'l10', name: 'Poulet', cat: 'Protein', K: 256, Mg: 26, Ca: 11, Fe: 0.9 },
    { id: 'l11', name: 'Poisson', cat: 'Protein', K: 363, Mg: 32, Ca: 16, Fe: 0.8 },
    { id: 'l12', name: 'Amande', cat: 'Nuts', K: 705, Mg: 270, Ca: 264, Fe: 3.7 },
    { id: 'l13', name: 'Noix', cat: 'Nuts', K: 441, Mg: 158, Ca: 98, Fe: 2.6 },
    { id: 'l14', name: 'Avocat', cat: 'Fruit', K: 485, Mg: 29, Ca: 12, Fe: 0.6 },
    { id: 'l15', name: 'Riz', cat: 'Grain', K: 115, Mg: 25, Ca: 10, Fe: 0.8 },
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
          .map(p => ({
            id: `off-${p.code}`,
            name: p.product_name,
            cat: 'OpenFoodFacts',
            K: Math.round(p.nutriments.potassium_100g || 0),
            Mg: Math.round(p.nutriments.magnesium_100g || 0),
            Ca: Math.round(p.nutriments.calcium_100g || 0),
            Fe: +(p.nutriments.iron_100g || 0).toFixed(1),
          }));
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
    K: a.K + f.K,
    Mg: a.Mg + f.Mg,
    Ca: a.Ca + f.Ca,
    Fe: a.Fe + f.Fe,
  }), { K: 0, Mg: 0, Ca: 0, Fe: 0 });

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
                <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>K:{f.K}mg Mg:{f.Mg}mg Ca:{f.Ca}mg Fe:{f.Fe}mg</div>
              </div>
              <button onClick={() => remove(f.id)} style={{ padding: '5px 10px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 10 }}>×</button>
            </div>
          ))
        )}
      </div>

      {selected.length > 0 && (
        <div style={{ padding: 15, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 6 }}>
          <h3 style={{ marginTop: 0 }}>Daily Totals</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><div style={{ fontSize: 12, color: '#666' }}>K (mg)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.K}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Mg (mg)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.Mg}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Ca (mg)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.Ca}</div></div>
            <div><div style={{ fontSize: 12, color: '#666' }}>Fe (mg)</div><div style={{ fontSize: 18, fontWeight: 'bold' }}>{totals.Fe}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
