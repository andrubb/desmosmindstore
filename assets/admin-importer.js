// ════════════════════════════════════════════════════════════
// Admin URL importer — lazy-loaded module
// Loaded on-demand by the storefront when the admin clicks
// "Importar desde URL" inside the product form modal. Scrapes
// Gymshark / YoungLA product pages via an allorigins CORS proxy
// and pre-fills the admin form.
//
// Attached to `window` so inline onclick handlers in the admin
// markup keep working unchanged.
// ════════════════════════════════════════════════════════════
(function(){
  let importedData = {};

  async function _runImportFromURL(){
    const url = document.getElementById('import-url').value.trim();
    if (!url) { setImportStatus('Pega un link primero', 'error'); return; }

    const isGymshark = url.includes('gymshark.com');
    const isYoungLA  = url.includes('youngla.com');
    if (!isGymshark && !isYoungLA) {
      setImportStatus('Solo funciona con links de Gymshark o YoungLA', 'error');
      return;
    }

    const btn = document.getElementById('import-btn');
    btn.disabled = true;
    setImportStatus('Conectando...', 'loading');
    document.getElementById('import-preview').classList.add('hidden');

    try {
      // Use allorigins proxy to bypass CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('No se pudo conectar');
      const data = await res.json();
      const html = data.contents;
      if (!html) throw new Error('Página vacía');

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      let name = '', brand = '', price = '', img = '', desc = '';

      if (isGymshark) {
        name  = getMeta(doc, 'og:title') || getSelector(doc, 'h1') || '';
        brand = 'GYMSHARK';
        price = getMeta(doc, 'og:price:amount') ||
                getSelector(doc, '[data-test="product-price"]') ||
                getSelector(doc, '.ProductPrice') ||
                getSelector(doc, '[class*="price"]') || '';
        img   = getMeta(doc, 'og:image') || '';
        desc  = getMeta(doc, 'og:description') ||
                getSelector(doc, '[class*="description"]') || '';
      } else {
        name  = getMeta(doc, 'og:title') || getSelector(doc, 'h1') || '';
        brand = 'YOUNGLA';
        price = getMeta(doc, 'og:price:amount') ||
                getSelector(doc, '.price') ||
                getSelector(doc, '[class*="Price"]') ||
                getSelector(doc, '[class*="price"]') || '';
        img   = getMeta(doc, 'og:image') || '';
        desc  = getMeta(doc, 'og:description') || '';
      }

      // Clean up
      name  = name.replace(/gymshark\s*[-–|]/i, '').replace(/youngla\s*[-–|]/i, '').trim();
      price = price.replace(/[^\d.,$€₡£]/g, '').trim();
      if (!name) throw new Error('No se pudo leer el nombre del producto. Intenta con otro link.');

      importedData = { name, brand, price, img, desc, url };

      document.getElementById('import-preview-brand').textContent = brand;
      document.getElementById('import-preview-name').textContent  = name;
      document.getElementById('import-preview-price').textContent = price
        ? `Precio: ${price}`
        : 'Precio no detectado — ingrésalo manualmente';
      const imgEl = document.getElementById('import-preview-img');
      if (img) { imgEl.src = img; imgEl.style.display = 'block'; }
      else      { imgEl.style.display = 'none'; }
      document.getElementById('import-preview').classList.remove('hidden');
      setImportStatus('✓ Producto encontrado — revisa los datos', 'success');

    } catch (e) {
      setImportStatus('Error: ' + e.message, 'error');
    } finally {
      btn.disabled = false;
    }
  }

  function getMeta(doc, prop) {
    const el = doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
    return el ? (el.getAttribute('content') || '').trim() : '';
  }
  function getSelector(doc, sel) {
    const el = doc.querySelector(sel);
    return el ? el.textContent.trim() : '';
  }
  function setImportStatus(msg, type) {
    const el = document.getElementById('import-status');
    if (!el) return;
    el.textContent = msg;
    el.className = 'import-status ' + (type || '');
  }

  function _runUseImportedData(){
    if (!importedData.name) return;
    document.getElementById('f-name').value  = importedData.name  || '';
    document.getElementById('f-brand').value = importedData.brand || '';
    document.getElementById('f-desc').value  = importedData.desc  || '';
    document.getElementById('f-img').value   = importedData.img   || '';
    if (importedData.price) {
      const numPrice = parseInt(importedData.price.replace(/[^\d]/g, ''), 10);
      if (!isNaN(numPrice)) document.getElementById('f-price').value = numPrice;
    }
    if (typeof window.showToast === 'function') {
      window.showToast('Datos importados ✓ — revisa y completa los campos');
    }
    document.getElementById('import-url').value = '';
    document.getElementById('import-preview').classList.add('hidden');
    setImportStatus('', '');
    importedData = {};
  }

  // Expose to inline onclick handlers
  window._runImportFromURL  = _runImportFromURL;
  window._runUseImportedData = _runUseImportedData;
})();
