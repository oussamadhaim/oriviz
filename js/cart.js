// =============================================
// CART SYSTEM — localStorage-based shopping cart
// =============================================
const Cart = {
  STORAGE_KEY: 'oriviz_cart',

  getItems() {
    try {
      let items = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      let sanitized = false;
      items = items.map(item => {
        if (typeof CONFIG !== 'undefined' && CONFIG.products && (!item.price || !item.name || !item.image)) {
          const p = CONFIG.products.find(pr => pr.id === item.id);
          if (p) {
            sanitized = true;
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.image,
              qty: item.qty
            };
          }
        }
        return item;
      });
      if (sanitized) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      }
      return items;
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.updateBadge();
    if (typeof window.__syncCart === 'function') {
      window.__syncCart();
    }
  },

  addItem(product, qty = 1) {
    const items = this.getItems();
    const existing = items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ ...product, qty: qty });
    }
    this.saveItems(items);
    this.showNotification(product.name);
    
    // Open drawer automatically when item is added
    setTimeout(() => {
      this.openDrawer();
    }, 500);
  },

  removeItem(productId) {
    const items = this.getItems().filter(i => i.id !== productId);
    this.saveItems(items);
  },

  updateQty(productId, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(1, qty);
      this.saveItems(items);
    }
  },

  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateBadge();
    if (typeof window.__syncCart === 'function') {
      window.__syncCart();
    }
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0);
  },

  getCount() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  // ── Badge on cart icon ──
  updateBadge() {
    const count = this.getCount();
    
    // Update badge 1
    const badge1 = document.getElementById('cart-badge-1');
    const text1 = document.getElementById('cart-text-1');
    if (badge1) {
      badge1.style.display = count > 0 ? 'flex' : 'none';
      badge1.textContent = count;
    }
    if (text1) {
      text1.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }

    // Update badge 2
    const badge2 = document.getElementById('cart-badge-2');
    const text2 = document.getElementById('cart-text-2');
    if (badge2) {
      badge2.style.display = count > 0 ? 'flex' : 'none';
      badge2.textContent = count;
    }
    if (text2) {
      text2.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }
    
    // Update index.html badge if present
    const countEl = document.getElementById('cart-count');
    const countHeader = document.getElementById('header-cart-count');
    if (countHeader) {
      countHeader.textContent = count;
      countHeader.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (countEl) {
      countEl.textContent = count;
    }
  },

  // ── Toast notification ──
  showNotification(productName) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cart-toast';
      toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 10000;
        background: #111; color: #fff; border: 1px solid #FD8670;
        padding: 16px 24px; border-radius: 8px;
        font-family: 'Instrument Sans', sans-serif; font-size: 14px;
        transform: translateY(100px); opacity: 0;
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; align-items: center; gap: 10px;
        box-shadow: 0 8px 32px rgba(253,134,112,0.15);
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg width="20" height="20" fill="none" stroke="#FD8670" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
      <span><strong>${productName}</strong> ajouté au panier</span>
    `;
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });
    setTimeout(() => {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
    }, 3000);
  },

  // ── CUSTOM CART DRAWER (RIGHT PANEL) ──
  initDrawer() {
    if (document.getElementById('local-cart-drawer')) return;

    // Create style element for the drawer
    const style = document.createElement('style');
    style.innerHTML = `
      .local-cart-drawer {
        position: fixed;
        inset: 0;
        z-index: 100000;
        visibility: hidden;
        pointer-events: none;
        font-family: 'Instrument Sans', sans-serif;
      }
      .local-cart-drawer.active {
        visibility: visible;
        pointer-events: auto;
      }
      .local-cart-drawer-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .local-cart-drawer.active .local-cart-drawer-overlay {
        opacity: 1;
      }
      .local-cart-drawer-content {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-width: 440px;
        background: #000000;
        color: #ffffff;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
        transform: translateX(100%);
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        border-left: 1px solid rgba(255, 255, 255, 0.1);
      }
      .local-cart-drawer.active .local-cart-drawer-content {
        transform: translateX(0);
      }
      .local-cart-drawer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 2rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .local-cart-drawer-item-count {
        font-size: 0.95rem;
        color: #ffffff;
        font-weight: 300;
      }
      .local-cart-drawer-close {
        background: transparent;
        border: none;
        color: #ffffff;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
      }
      .local-cart-drawer-close:hover {
        opacity: 0.7;
      }
      .local-cart-drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 2.5rem 2rem;
        display: flex;
        flex-direction: column;
      }
      
      /* Empty State style */
      .local-cart-drawer-empty {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
      }
      .local-cart-drawer-empty h3 {
        font-size: 1.8rem;
        font-weight: 400;
        margin: 0 0 2rem 0;
        color: #ffffff;
        letter-spacing: -0.01em;
      }
      .local-cart-drawer-empty p {
        font-size: 0.95rem;
        color: rgba(255, 255, 255, 0.85);
        margin: 0 0 2.5rem 0;
      }
      .local-cart-drawer-empty a {
        font-size: 0.95rem;
        color: #ffffff;
        text-decoration: underline;
        text-underline-offset: 4px;
        transition: opacity 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
      .local-cart-drawer-empty a:hover {
        opacity: 0.7;
      }

      /* Items State style */
      .local-cart-drawer-title {
        font-size: 1.8rem;
        font-weight: 400;
        margin: 0 0 2rem 0;
        letter-spacing: -0.01em;
      }
      .local-cart-drawer-items-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        margin-bottom: 2.5rem;
      }
      .local-cart-drawer-item {
        display: flex;
        gap: 1.25rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .local-cart-drawer-item-img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 8px;
        background: #111;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .local-cart-drawer-item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .local-cart-drawer-item-name {
        font-size: 0.95rem;
        font-weight: 500;
        color: #ffffff;
      }
      .local-cart-drawer-item-price {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
      }
      .local-cart-drawer-item-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 0.5rem;
      }
      .local-cart-drawer-qty-controls {
        display: flex;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 9999px;
        overflow: hidden;
      }
      .local-cart-drawer-qty-btn {
        background: transparent;
        border: none;
        color: #ffffff;
        width: 28px;
        height: 28px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        transition: background 0.2s;
      }
      .local-cart-drawer-qty-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .local-cart-drawer-qty-value {
        width: 24px;
        text-align: center;
        font-size: 0.85rem;
        font-weight: 600;
      }
      .local-cart-drawer-item-remove {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        font-size: 0.8rem;
        cursor: pointer;
        text-decoration: underline;
        transition: color 0.2s;
      }
      .local-cart-drawer-item-remove:hover {
        color: #ff4444;
      }
      .local-cart-drawer-footer {
        margin-top: auto;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 1.5rem;
      }
      .local-cart-drawer-subtotal {
        display: flex;
        justify-content: space-between;
        font-size: 1rem;
        margin-bottom: 0.5rem;
      }
      .local-cart-drawer-subtotal-val {
        font-weight: 600;
        color: #ffffff;
      }
      .local-cart-drawer-shipping {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 1.5rem;
      }
      .local-cart-drawer-checkout-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 0.85rem;
        border-radius: 9999px;
        background-color: #ffffff;
        color: #000000;
        border: 1px solid #ffffff;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.15em;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
      }
      .local-cart-drawer-checkout-btn:hover {
        background-color: #000000;
        color: #ffffff;
      }
    `;
    document.head.appendChild(style);

    // Create drawer element
    const drawer = document.createElement('div');
    drawer.id = 'local-cart-drawer';
    drawer.className = 'local-cart-drawer';
    drawer.innerHTML = `
      <div class="local-cart-drawer-overlay" id="local-cart-drawer-overlay"></div>
      <div class="local-cart-drawer-content">
        <div class="local-cart-drawer-header">
          <span class="local-cart-drawer-item-count" id="local-cart-drawer-item-count">Your cart - 0 items</span>
          <button class="local-cart-drawer-close" id="local-cart-drawer-close" aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="local-cart-drawer-body" id="local-cart-drawer-body">
        </div>
      </div>
    `;
    document.body.appendChild(drawer);

    // Event listeners
    document.getElementById('local-cart-drawer-close').addEventListener('click', () => this.closeDrawer());
    document.getElementById('local-cart-drawer-overlay').addEventListener('click', () => this.closeDrawer());

    this.bindHeaderIcons();
  },

  openDrawer() {
    this.initDrawer();
    document.getElementById('local-cart-drawer').classList.add('active');
    this.renderDrawer();
  },

  closeDrawer() {
    const drawer = document.getElementById('local-cart-drawer');
    if (drawer) {
      drawer.classList.remove('active');
    }
  },

  renderDrawer() {
    const items = this.getItems();
    const count = this.getCount();
    const total = this.getTotal();

    // Update item count in header
    document.getElementById('local-cart-drawer-item-count').textContent = `Votre panier - ${count} article${count !== 1 ? 's' : ''}`;

    const body = document.getElementById('local-cart-drawer-body');

    if (items.length === 0) {
      body.innerHTML = `
        <div class="local-cart-drawer-empty">
          <h3>Votre panier</h3>
          <p>Votre panier est actuellement vide.</p>
          <a href="#" id="local-cart-drawer-continue">Continuer vos achats &rarr;</a>
        </div>
      `;
      document.getElementById('local-cart-drawer-continue').addEventListener('click', (e) => {
        e.preventDefault();
        this.closeDrawer();
      });
      return;
    }

    let html = `
      <h3 class="local-cart-drawer-title">Votre panier</h3>
      <div class="local-cart-drawer-items-list">
    `;

    items.forEach(item => {
      // Use clean image URLs (avoid shopify double slashes if present)
      let imgUrl = item.image;
      if (imgUrl.startsWith('//')) {
        imgUrl = 'https:' + imgUrl;
      } else if (!imgUrl.startsWith('/') && !imgUrl.startsWith('http')) {
        imgUrl = '/' + imgUrl;
      }
      
      html += `
        <div class="local-cart-drawer-item">
          <a href="/products/${item.id}" style="display: block;">
            <img src="${imgUrl}" alt="${item.name}" class="local-cart-drawer-item-img">
          </a>
          <div class="local-cart-drawer-item-details">
            <div>
              <a href="/products/${item.id}" class="local-cart-drawer-item-name" style="text-decoration: none; color: inherit; transition: color 0.2s;">${item.name}</a>
              <div class="local-cart-drawer-item-price">${item.price.toLocaleString('fr-FR')} DH</div>
            </div>
            <div class="local-cart-drawer-item-actions">
              <div class="local-cart-drawer-qty-controls">
                <button class="local-cart-drawer-qty-btn" onclick="Cart.changeQty('${item.id}', -1)">&minus;</button>
                <span class="local-cart-drawer-qty-value">${item.qty}</span>
                <button class="local-cart-drawer-qty-btn" onclick="Cart.changeQty('${item.id}', 1)">&plus;</button>
              </div>
              <button class="local-cart-drawer-item-remove" onclick="Cart.removeItem('${item.id}'); Cart.renderDrawer();">Supprimer</button>
            </div>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <div class="local-cart-drawer-footer">
        <div class="local-cart-drawer-subtotal">
          <span>Sous-total</span>
          <span class="local-cart-drawer-subtotal-val">${total.toLocaleString('fr-FR')} DH</span>
        </div>
        <div class="local-cart-drawer-shipping">Livraison gratuite.</div>
        <a href="/checkout.html" class="local-cart-drawer-checkout-btn">Passer la commande</a>
      </div>
    `;

    body.innerHTML = html;
  },

  changeQty(id, delta) {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (item) {
      const newQty = item.qty + delta;
      if (newQty < 1) {
        this.removeItem(id);
      } else {
        this.updateQty(id, newQty);
      }
      this.renderDrawer();
    }
  },

  bindHeaderIcons() {
    const icon1 = document.getElementById('header-cart-icon-1');
    const icon2 = document.getElementById('header-cart-icon-2');
    
    // Remove inline event listeners if any, then bind
    if (icon1) {
      icon1.onclick = null;
      icon1.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    }
    
    if (icon2) {
      icon2.onclick = null;
      icon2.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    }
  }
}

// Cart ready
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  Cart.initDrawer();

  // ── EcomSend App Override Styles ──
  const ecomsendStyle = document.createElement('style');
  ecomsendStyle.innerHTML = `
    /* Force logo replacement in EcomSend Popup */
    [class*="ecomsend"] img[src*="logo"],
    [class*="ecomsend"] [class*="logo"] img,
    [class*="ecomsend"] [class*="Logo"] img {
      content: url("/images/logo.png") !important;
    }
  `;
  document.head.appendChild(ecomsendStyle);

  // Run customized EcomSend check periodically to override any dynamic layouts
  setInterval(() => {
    // Find all images inside EcomSend elements
    const ecomsendElements = document.querySelectorAll('[class*="ecomsend"], [class*="react-responsive-modal"]');
    ecomsendElements.forEach(el => {
      // Find logo image
      const imgs = el.querySelectorAll('img');
      imgs.forEach(img => {
        // If it's a logo or the first image of the popup (which is usually the logo)
        if (img.src && (img.src.includes('logo') || img.src.includes('Sem_titulo') || img.src.includes('Sem%20titulo') || img.src.includes('cdn.shopify.com/files') || img.classList.toString().includes('logo') || img.classList.toString().includes('Logo'))) {
          if (img.src !== '/images/logo.png') {
            img.src = '/images/logo.png';
            img.srcset = '/images/logo.png 80w, /images/logo.png 130w';
          }
        }
      });
      
      // Find all elements inside EcomSend modal
      const children = el.querySelectorAll('*');
      children.forEach(child => {
        const style = window.getComputedStyle(child);
        const bg = style.backgroundColor;
        const color = style.color;
        const border = style.borderColor;

        // Helper to check if a color is a shade of yellow
        const isYellow = (rgbStr) => {
          const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            // Yellow has high Red and Green, low Blue
            return (r > 200 && g > 170 && b < 130);
          }
          return false;
        };

        if (isYellow(bg)) {
          child.style.setProperty('background-color', '#FD8670', 'important');
          child.style.setProperty('background', '#FD8670', 'important');
          child.style.setProperty('--bg-color', '#FD8670', 'important');
        }
        if (isYellow(color)) {
          child.style.setProperty('color', '#FD8670', 'important');
        }
        if (isYellow(border)) {
          child.style.setProperty('border-color', '#FD8670', 'important');
        }
      });
    });
  }, 500);
});
