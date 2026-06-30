// ============================================
// LOHAUSE CLONE — APPLICATION LOGIC
// ============================================

(function () {
  'use strict';

  // --- State ---
  let cart = [];

  function loadCart() {
    let raw = JSON.parse(localStorage.getItem('oriviz_cart') || '[]');
    let sanitized = false;
    raw = raw.map(item => {
      if (typeof CONFIG !== 'undefined' && CONFIG.products) {
        const p = CONFIG.products.find(pr => pr.id === item.id);
        if (p && (!item.price || !item.name || !item.image)) {
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
      localStorage.setItem('oriviz_cart', JSON.stringify(raw));
    }
    cart = raw;
    return cart;
  }
  
  // Initial load
  loadCart();

  // --- DOM Refs ---
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // --- Helpers ---
  function formatPrice(price) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + CONFIG.brand.currency;
  }

  function saveCart() {
    localStorage.setItem('oriviz_cart', JSON.stringify(cart));
  }

  // --- MARQUEE ---
  function buildMarquee(container) {
    const text = CONFIG.marqueeText;
    let html = '';
    for (let i = 0; i < 50; i++) {
      html += `<span>${text}</span>`;
    }
    const isReverse = container.classList.contains('marquee-container--reverse');
    const trackClass = isReverse ? 'marquee-track marquee-track--reverse' : 'marquee-track';
    container.innerHTML = `<div class="${trackClass}">${html}</div>`;
  }

  // --- HERO SLIDER ---
  function initHeroSlider() {
    const slider = $('#hero-slider');
    if (!slider) return;

    CONFIG.heroImages.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
      slide.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="${i === 0 ? 'eager' : 'lazy'}"><div class="hero-overlay"></div>`;
      slider.appendChild(slide);
    });

    let current = 0;
    const slides = $$('.hero-slide', slider);
    if (slides.length > 1) {
      setInterval(() => {
        slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
      }, 5000);
    }
  }

  // --- PRODUCT GRID RENDERER ---
  function renderProducts(containerId, category, limit) {
    const container = $(`#${containerId}`);
    if (!container) return;

    const products = CONFIG.products
      .filter(p => p.category === category)
      .slice(0, limit || 999);

    container.innerHTML = products.map(p => {
      const imgPrimary = p.image.startsWith('/') ? p.image : '/' + p.image;
      const imgHover = p.imageAlt.startsWith('/') ? p.imageAlt : '/' + p.imageAlt;
      return `
        <div class="product-card" data-product-id="${p.id}">
          <div class="product-card-image">
            <img class="img-primary" src="${imgPrimary}" alt="${p.alt}" loading="lazy">
            <img class="img-hover" src="${imgHover}" alt="${p.alt}" loading="lazy">
          </div>
          <div class="product-card-info">
            <div class="product-card-name">${p.name}</div>
            <div class="product-card-price">${formatPrice(p.price)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Event: Quick Add
    $$('.quick-add-btn', container).forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(btn.dataset.id);
      });
    });

    // Event: Navigate to product page
    $$('.product-card', container).forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `/products/${card.dataset.productId}`;
      });
    });
  }

  // --- BANNER IMAGES ---
  function renderBanners() {
    CONFIG.bannerImages.forEach((img, i) => {
      const el = $(`#banner-${i}`);
      if (el) {
        el.innerHTML = `<img src="${img.src}" alt="${img.alt}" loading="lazy">`;
      }
    });
  }

  // --- ACCORDION ---
  function initAccordions() {
    // Materials
    const materialsContainer = $('#accordion-materials');
    if (materialsContainer) {
      materialsContainer.innerHTML = CONFIG.materials.map(m => `
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>${m.title}</span>
            <span class="icon-plus"></span>
          </button>
          <div class="accordion-content">
            <div class="accordion-content-inner">${m.description}</div>
          </div>
        </div>
      `).join('');
    }

    // Lenses info
    const lensesContainer = $('#lenses-info');
    if (lensesContainer) {
      const li = CONFIG.lensesInfo;
      lensesContainer.innerHTML = `
        <div class="accordion-item">
          <button class="accordion-trigger">
            <span>${li.title}</span>
            <span class="icon-plus"></span>
          </button>
          <div class="accordion-content">
            <div class="accordion-content-inner">
              <p>${li.description}</p>
              <p style="margin-top:0.75rem">${li.cta}</p>
            </div>
          </div>
        </div>
      `;
    }

    // Toggle logic
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.accordion-trigger');
      if (!trigger) return;

      const item = trigger.parentElement;
      const content = item.querySelector('.accordion-content');
      const isOpen = item.classList.contains('open');

      if (isOpen) {
        content.style.maxHeight = '0';
        item.classList.remove('open');
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
        item.classList.add('open');
      }
    });
  }

  function addToCart(productId, qty = 1) {
    loadCart();
    const product = CONFIG.products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(c => c.id === productId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty
      });
    }

    saveCart();
    renderCart();
    if (typeof Cart !== 'undefined') {
      Cart.updateBadge();
    }
    openCartDrawer();
    showToast('Ajouté au panier !');
  }

  function removeFromCart(productId) {
    loadCart();
    cart = cart.filter(c => c.id !== productId);
    saveCart();
    renderCart();
    if (typeof Cart !== 'undefined') {
      Cart.updateBadge();
    }
  }

  function updateQty(productId, delta) {
    loadCart();
    const item = cart.find(c => c.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(productId);
      return;
    }

    saveCart();
    renderCart();
    if (typeof Cart !== 'undefined') {
      Cart.updateBadge();
    }
  }

  function getCartTotal() {
    loadCart();
    return cart.reduce((sum, item) => {
      const product = CONFIG.products.find(p => p.id === item.id) || item;
      const price = product ? parseFloat(product.price) || 0 : 0;
      return sum + (price * item.qty);
    }, 0);
  }

  function getCartCount() {
    loadCart();
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function renderCart() {
    loadCart();
    const itemsContainer = $('#cart-items');
    const subtotalEl = $('#cart-subtotal-amount');
    const countEl = $('#cart-count');
    const countHeader = $('#header-cart-count');
    const emptyMsg = $('#cart-empty');
    const footerEl = $('#cart-footer-section');

    if (!itemsContainer) return;

    const count = getCartCount();

    // Header badge
    if (countHeader) {
      countHeader.textContent = count;
      countHeader.style.display = count > 0 ? 'inline-flex' : 'none';
    }

    // Cart count in title
    if (countEl) {
      countEl.textContent = count;
    }

    if (cart.length === 0) {
      itemsContainer.innerHTML = '';
      if (emptyMsg) emptyMsg.style.display = 'block';
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';

    itemsContainer.innerHTML = cart.map(item => {
      const p = CONFIG.products.find(pr => pr.id === item.id) || item;
      if (!p) return '';
      let imgUrl = p.image || '';
      if (imgUrl && !imgUrl.startsWith('/') && !imgUrl.startsWith('http') && !imgUrl.startsWith('//')) {
        imgUrl = '/' + imgUrl;
      }
      const priceVal = parseFloat(p.price) || 0;
      return `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${imgUrl}" alt="${p.alt || p.name}" loading="lazy">
          </div>
          <div class="cart-item-details">
            <div>
              <div class="cart-item-name">${p.name}</div>
              <div class="cart-item-price">${formatPrice(priceVal)}</div>
            </div>
            <div class="cart-item-actions">
              <button class="qty-btn" onclick="window.__updateQty('${p.id}', -1)">−</button>
              <span class="cart-item-qty">${item.qty}</span>
              <button class="qty-btn" onclick="window.__updateQty('${p.id}', 1)">+</button>
              <button class="cart-item-remove" onclick="window.__removeFromCart('${p.id}')">Supprimer</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (subtotalEl) {
      subtotalEl.textContent = formatPrice(getCartTotal());
    }
  }

  // Expose for inline handlers
  window.__updateQty = updateQty;
  window.__removeFromCart = removeFromCart;
  window.__addToCart = addToCart;
  window.__syncCart = function() {
    loadCart();
    renderCart();
  };

  // --- DRAWERS ---
  function openMenuDrawer() {
    $('.menu-drawer').classList.add('open');
    $('#overlay').classList.add('active');
    document.body.classList.add('drawer-open');
  }

  function closeMenuDrawer() {
    $('.menu-drawer').classList.remove('open');
    $('#overlay').classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  function openCartDrawer() {
    $('.cart-drawer').classList.add('open');
    $('#overlay').classList.add('active');
    document.body.classList.add('drawer-open');
  }

  function closeCartDrawer() {
    $('.cart-drawer').classList.remove('open');
    $('#overlay').classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  function closeAllDrawers() {
    $('.menu-drawer').classList.remove('open');
    $('.cart-drawer').classList.remove('open');
    $('#overlay').classList.remove('active');
    document.body.classList.remove('drawer-open');
    closeSearch();
    closeProductModal();
  }

  // --- SEARCH ---
  function openSearch() {
    const modal = $('#search-modal');
    modal.classList.add('active');
    document.body.classList.add('drawer-open');
    setTimeout(() => $('#search-input').focus(), 100);
  }

  function closeSearch() {
    const modal = $('#search-modal');
    modal.classList.remove('active');
    document.body.classList.remove('drawer-open');
    $('#search-input').value = '';
    $('#search-results').innerHTML = '';
  }

  function handleSearch(query) {
    const results = $('#search-results');
    if (!query.trim()) {
      results.innerHTML = '';
      return;
    }

    const q = query.toLowerCase();
    const matches = CONFIG.products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length === 0) {
      results.innerHTML = '<p style="opacity:0.4;font-size:0.85rem;padding:1rem 0;">Aucun résultat trouvé.</p>';
      return;
    }

    results.innerHTML = matches.map(p => {
      const imgUrl = p.image.startsWith('/') ? p.image : '/' + p.image;
      return `
        <div class="search-result-item" data-id="${p.id}">
          <img src="${imgUrl}" alt="${p.alt}" loading="lazy">
          <div class="search-result-info">
            <div class="name">${p.name}</div>
            <div class="price">${formatPrice(p.price)}</div>
          </div>
        </div>
      `;
    }).join('');

    $$('.search-result-item', results).forEach(item => {
      item.addEventListener('click', () => {
        closeSearch();
        window.location.href = `/products/${item.dataset.id}`;
      });
    });
  }

  // --- PRODUCT MODAL ---
  function openProductModal(productId) {
    const product = CONFIG.products.find(p => p.id === productId);
    if (!product) return;

    const modal = $('#product-modal');
    const imgUrl = product.image.startsWith('/') ? product.image : '/' + product.image;
    $('#modal-product-image').src = imgUrl;
    $('#modal-product-image').alt = product.alt;
    $('#modal-product-name').textContent = product.name;
    $('#modal-product-price').textContent = formatPrice(product.price);
    $('#modal-product-desc').textContent = product.alt;
    $('#modal-add-btn').dataset.id = product.id;

    modal.classList.add('active');
    document.body.classList.add('drawer-open');
  }

  function closeProductModal() {
    $('#product-modal').classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  // --- TOAST ---
  function showToast(message) {
    let toast = $('#toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // --- NAV RENDERER ---
  function renderNav() {
    // Desktop nav
    const desktopNav = $('#desktop-nav');
    if (desktopNav) {
      desktopNav.innerHTML = CONFIG.navigation.map(n =>
        `<a href="${n.href}">${n.label}</a>`
      ).join('');
    }

    // Menu drawer nav
    const drawerNav = $('#drawer-nav');
    if (drawerNav) {
      drawerNav.innerHTML = CONFIG.navigation.map(n =>
        `<a href="${n.href}">${n.label}</a>`
      ).join('');

      $$('a', drawerNav).forEach(a => {
        a.addEventListener('click', () => closeMenuDrawer());
      });
    }

    // Footer links
    const footerLinksEl = $('#footer-links');
    if (footerLinksEl) {
      footerLinksEl.innerHTML = CONFIG.footerLinks.map(l =>
        `<a href="${l.href}">${l.label}</a>`
      ).join('');
    }

    // Logo (text — no img to update)
  }

  // --- FOOTER RENDERER ---
  function renderFooter() {
    const footer = $('.site-footer');
    if (!footer) return;

    footer.innerHTML = `
      <div class="footer-grid">
        <!-- Brand Info -->
        <div class="footer-col" style="display: flex; flex-direction: column; gap: 1rem;">
          <a href="/" class="logo-link" style="padding: 0; display: inline-block; width: fit-content;">
            <img class="logo-img" src="/images/logo.png" alt="${CONFIG.brand.name}" style="height: 30px; width: auto; max-width: 100%; display: block;">
          </a>
          <p style="font-size: 0.85rem; opacity: 0.7; line-height: 1.6; margin: 0; max-width: 320px;">
            ${CONFIG.brand.description}
          </p>
        </div>

        <!-- Boutique -->
        <div class="footer-col">
          <h3>Boutique</h3>
          <a href="/">Accueil</a>
          <a href="/shop">Collection</a>
          <a href="/#frames">Montures optiques</a>
          <a href="/#sunglasses">Lunettes de soleil</a>
        </div>

        <!-- Informations -->
        <div class="footer-col">
          <h3>Informations</h3>
          <a href="/about">À propos de Oriviz</a>
          <a href="/faq">FAQ</a>
          <a href="/retours">Échanges &amp; Retours</a>
          <a href="/privacy">Politique de confidentialité</a>
        </div>

        <!-- Contact & Social -->
        <div class="footer-col" style="display: flex; flex-direction: column; gap: 0.5rem;">
          <h3>Contact</h3>
          <a href="mailto:contact@oriviz.com" style="padding: 0.1rem 0; width: fit-content; text-transform: lowercase;">contact@oriviz.com</a>
          <a href="tel:+212664583896" style="padding: 0.1rem 0; width: fit-content;">+212 664 58 38 96</a>
          <p style="font-size: 0.85rem; opacity: 0.7; margin: 0.25rem 0 0.5rem 0;">Ain Diab, Casablanca</p>
          <div class="footer-social-row" style="display: flex; gap: 16px; margin-top: 6px; align-items: center;">
            <a href="https://www.instagram.com/oriviz.eyewear/" target="_blank" rel="noopener" aria-label="Instagram" style="display: inline-flex; align-items: center; justify-content: center; opacity: 0.6; transition: opacity 0.2s; color: inherit; padding: 0;"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
            <a href="https://www.facebook.com/oriviz.eyewear" target="_blank" rel="noopener" aria-label="Facebook" style="display: inline-flex; align-items: center; justify-content: center; opacity: 0.6; transition: opacity 0.2s; color: inherit; padding: 0;"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href="https://www.tiktok.com/@oriviz.eyewear" target="_blank" rel="noopener" aria-label="TikTok" style="display: inline-flex; align-items: center; justify-content: center; opacity: 0.6; transition: opacity 0.2s; color: inherit; padding: 0;"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .8.11V9.4a6.27 6.27 0 0 0-3.11-.12A6.35 6.35 0 0 0 2 15.63a6.35 6.35 0 0 0 9.21 5.56 6.3 6.3 0 0 0 3.32-5.46V8.66A8.3 8.3 0 0 0 19.59 12V6.69z"/></svg></a>
            <a href="https://www.youtube.com/@oriviz.eyewear" target="_blank" rel="noopener" aria-label="YouTube" style="display: inline-flex; align-items: center; justify-content: center; opacity: 0.6; transition: opacity 0.2s; color: inherit; padding: 0;"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
            <a href="https://www.pinterest.com/oriviz/" target="_blank" rel="noopener" aria-label="Pinterest" style="display: inline-flex; align-items: center; justify-content: center; opacity: 0.6; transition: opacity 0.2s; color: inherit; padding: 0;"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.029-.999 2.321-1.49 3.116C9.937 23.77 10.942 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()}, ${CONFIG.brand.name}. Tous droits réservés.</span>
      </div>
    `;
  }

  // --- NEWSLETTER ---
  function initNewsletter() {
    const form = $('#newsletter-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      if (input.value.trim()) {
        showToast('Inscription réussie ! Merci.');
        input.value = '';
      }
    });
  }

  // --- EVENTS ---
  function bindEvents() {
    // Menu
    $('#btn-menu').addEventListener('click', openMenuDrawer);
    $('#btn-menu-close').addEventListener('click', closeMenuDrawer);

    // Cart
    $('#btn-cart').addEventListener('click', openCartDrawer);
    $('#btn-cart-close').addEventListener('click', closeCartDrawer);
    const contShop = $('#cart-continue-shopping');
    if (contShop) contShop.addEventListener('click', (e) => { e.preventDefault(); closeCartDrawer(); });

    // Overlay
    $('#overlay').addEventListener('click', closeAllDrawers);

    // Search
    $('#btn-search').addEventListener('click', openSearch);
    const searchClose = $('#search-close');
    if (searchClose) searchClose.addEventListener('click', closeSearch);
    $('#search-input').addEventListener('input', (e) => handleSearch(e.target.value));
    $('#search-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeSearch();
    });

    // Product modal
    $('#modal-close').addEventListener('click', closeProductModal);
    $('#product-modal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeProductModal();
    });
    $('#modal-add-btn').addEventListener('click', () => {
      const id = $('#modal-add-btn').dataset.id;
      addToCart(id);
      closeProductModal();
    });

    // Checkout
    const checkoutBtn = $('#btn-checkout');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        loadCart();
        if (cart.length > 0) {
          window.location.href = '/checkout.html';
        }
      });
    }

    // Virtual Try-on click event
    const tryonWrapper = $('#tryon-wrapper');
    if (tryonWrapper) {
      const tryonBtn = tryonWrapper.querySelector('.virtual-tryon-btn');
      if (tryonBtn) {
        tryonBtn.addEventListener('click', () => {
          tryonWrapper.classList.add('active');
          setTimeout(() => {
            tryonWrapper.classList.remove('active');
          }, 2000);
        });
      }
    }

    // ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDrawers();
    });
  }

  function updateStaticFooterLinks() {
    $$('footer a').forEach(a => {
      const text = a.textContent.trim().toLowerCase();
      if (text.includes('échanges') || text.includes('retours')) {
        a.href = '/retours';
      } else if (text.includes('faq')) {
        a.href = '/faq';
      } else if (text.includes('confidentialité') || text.includes('privacy')) {
        a.href = '/privacy';
      }
    });
  }

  // --- UGC CAROUSEL ---
  function initUgcCarousel() {
    const track = $('#ugc-carousel');
    const prev = $('#ugc-prev');
    const next = $('#ugc-next');
    if (!track || !prev || !next) return;

    prev.addEventListener('click', () => {
      const card = track.querySelector('.ugc-card');
      if (card) {
        track.scrollBy({ left: -(card.clientWidth + 20), behavior: 'smooth' });
      }
    });

    next.addEventListener('click', () => {
      const card = track.querySelector('.ugc-card');
      if (card) {
        track.scrollBy({ left: card.clientWidth + 20, behavior: 'smooth' });
      }
    });
  }

  // --- TRUSTPILOT CAROUSEL ---
  function initTpCarousel() {
    const track = $('#tp-carousel');
    const prev = $('#tp-prev');
    const next = $('#tp-next');
    if (!track || !prev || !next) return;

    prev.addEventListener('click', () => {
      const card = track.querySelector('.tp-card');
      if (card) {
        track.scrollBy({ left: -(card.clientWidth + 20), behavior: 'smooth' });
      }
    });

    next.addEventListener('click', () => {
      const card = track.querySelector('.tp-card');
      if (card) {
        track.scrollBy({ left: card.clientWidth + 20, behavior: 'smooth' });
      }
    });
  }

  // --- PRODUCT CAROUSEL ---
  function initProductCarousel() {
    const slider = $('#product-slider');
    if (!slider) return;

    slider.innerHTML = CONFIG.products.map(p => {
      const imgPrimary = p.image.startsWith('/') ? p.image : '/' + p.image;
      const imgHover = p.imageAlt.startsWith('/') ? p.imageAlt : '/' + p.imageAlt;
      
      return `
        <div class="product-card" data-product-id="${p.id}">
          <div class="product-card-image">
            <img class="img-primary" src="${imgPrimary}" alt="${p.alt}" loading="lazy">
            <img class="img-hover" src="${imgHover}" alt="${p.alt}" loading="lazy">
          </div>
          <div class="product-card-info">
            <div class="product-card-name">${p.name}</div>
            <div class="product-card-price">${formatPrice(p.price)}</div>
          </div>
        </div>
      `;
    }).join('');

    const prev = $('#prod-prev');
    const next = $('#prod-next');
    if (prev && next) {
      prev.addEventListener('click', () => {
        const card = slider.querySelector('.product-card');
        if (card) {
          slider.scrollBy({ left: -(card.clientWidth + 20), behavior: 'smooth' });
        }
      });
      next.addEventListener('click', () => {
        const card = slider.querySelector('.product-card');
        if (card) {
          slider.scrollBy({ left: card.clientWidth + 20, behavior: 'smooth' });
        }
      });
    }

    slider.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        window.location.href = `/products/${card.dataset.productId}`;
      });
    });
  }

  // --- WHATSAPP BUTTON ---
  function initWhatsAppButton() {
    let waBtn = document.getElementById('whatsapp-float');
    if (!waBtn) {
      waBtn = document.createElement('a');
      waBtn.id = 'whatsapp-float';
      waBtn.href = 'https://web.whatsapp.com/send?phone=212664583896&text=';
      waBtn.target = '_blank';
      waBtn.rel = 'noopener';
      waBtn.setAttribute('aria-label', 'Contactez-nous sur WhatsApp');
      waBtn.innerHTML = `
        <img src="https://img.icons8.com/?size=100&id=16733&format=png&color=FFFFFF" alt="WhatsApp" style="width: 32px; height: 32px; display: block;">
      `;
      document.body.appendChild(waBtn);
    }
  }

  // --- INIT ---
  function init() {
    renderNav();
    renderFooter();
    $$('.marquee-container').forEach(buildMarquee);
    initHeroSlider();
    renderProducts('grid-frames', 'frames');
    renderProducts('grid-sunglasses', 'sunglasses');
    renderProducts('grid-special', 'special');
    renderBanners();
    initAccordions();
    initNewsletter();
    initProductCarousel();
    initUgcCarousel();
    initTpCarousel();
    renderCart();
    bindEvents();
    updateStaticFooterLinks();
    initWhatsAppButton();
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
