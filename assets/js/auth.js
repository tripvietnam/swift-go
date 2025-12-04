// Authentication System
(function() {
  'use strict';

  // Create auth modals HTML
  function createAuthModals() {
    const loginModal = `
      <div id="login-modal" class="modal-overlay">
        <div class="modal auth-modal">
          <div class="modal-header">
            <h3>Đăng nhập</h3>
            <button class="modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="modal-body">
            <form id="login-form" class="auth-form">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required placeholder="email@example.com" autocomplete="email">
              </div>
              <div class="form-group">
                <label>Mật khẩu *</label>
                <input type="password" name="password" required placeholder="Nhập mật khẩu" autocomplete="current-password">
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" name="remember"> Ghi nhớ đăng nhập
                </label>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Đăng nhập</button>
            </form>
            <div class="auth-divider">Hoặc</div>
            <button type="button" class="btn btn-ghost btn-block" id="show-register">Chưa có tài khoản? Đăng ký</button>
          </div>
        </div>
      </div>
    `;

    const registerModal = `
      <div id="register-modal" class="modal-overlay">
        <div class="modal auth-modal">
          <div class="modal-header">
            <h3>Đăng ký tài khoản</h3>
            <button class="modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="modal-body">
            <form id="register-form" class="auth-form">
              <div class="form-group">
                <label>Họ và tên *</label>
                <input type="text" name="fullname" required placeholder="Nguyễn Văn A" autocomplete="name">
              </div>
              <div class="form-group">
                <label>Email *</label>
                <input type="email" name="email" required placeholder="email@example.com" autocomplete="email">
              </div>
              <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" name="phone" placeholder="0912345678" autocomplete="tel">
              </div>
              <div class="form-group">
                <label>Mật khẩu *</label>
                <input type="password" name="password" required placeholder="Tối thiểu 6 ký tự" autocomplete="new-password" minlength="6">
              </div>
              <div class="form-group">
                <label>Xác nhận mật khẩu *</label>
                <input type="password" name="confirm_password" required placeholder="Nhập lại mật khẩu" autocomplete="new-password" minlength="6">
              </div>
              <div class="form-group">
                <label class="checkbox-label">
                  <input type="checkbox" name="agree" required> Tôi đồng ý với điều khoản sử dụng
                </label>
              </div>
              <button type="submit" class="btn btn-primary btn-block">Đăng ký</button>
            </form>
            <div class="auth-divider">Hoặc</div>
            <button type="button" class="btn btn-ghost btn-block" id="show-login">Đã có tài khoản? Đăng nhập</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', loginModal + registerModal);
  }

  // Get current user
  function getCurrentUser() {
    const userStr = localStorage.getItem('swiftgo_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Save user
  function saveUser(user) {
    localStorage.setItem('swiftgo_user', JSON.stringify(user));
    updateHeaderUI();
  }

  // Logout
  function logout() {
    localStorage.removeItem('swiftgo_user');
    updateHeaderUI();
    window.location.reload();
  }

  // Update header UI based on auth state
  function updateHeaderUI() {
    const user = getCurrentUser();
    const authBtns = document.querySelector('.auth');
    
    if (!authBtns) return;

    if (user) {
      const displayName = (user.fullname && user.fullname.trim()) ? user.fullname : (user.email || '').split('@')[0];
      const avatarChar = displayName ? displayName.charAt(0).toUpperCase() : 'U';
      // User logged in - show user menu
      authBtns.innerHTML = `
        <div class="user-menu">
          <button class="user-toggle" id="user-toggle">
            <span class="user-avatar">${avatarChar}</span>
            <span class="user-name">${displayName}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="user-dropdown" id="user-dropdown">
            <div class="user-info">
              <strong>${displayName}</strong>
              <small>${user.email}</small>
            </div>
            <hr>
            <a href="page-my-account.html" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2"/>
              </svg>
              Tài khoản của tôi
            </a>
            <a href="page-cart.html" class="dropdown-item" id="cart-dropdown-toggle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="21" r="1" fill="currentColor"/>
                <circle cx="20" cy="21" r="1" fill="currentColor"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" stroke-width="2"/>
              </svg>
              Giỏ hàng <span class="cart-badge" id="cart-count">0</span>
            </a>
            <div class="cart-preview" id="cart-preview" style="display:none;">
              <div class="cart-preview-header">Giỏ hàng của bạn</div>
              <div class="cart-preview-items" id="cart-preview-items"></div>
              <div class="cart-preview-footer">
                <a href="page-cart.html" class="btn btn-primary btn-block">Xem giỏ hàng</a>
              </div>
            </div>
            <hr>
            <button class="dropdown-item" id="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2"/>
              </svg>
              Đăng xuất
            </button>
          </div>
        </div>
      `;

      // Attach dropdown toggle
      const userToggle = document.getElementById('user-toggle');
      const userDropdown = document.getElementById('user-dropdown');
      
      if (userToggle && userDropdown) {
        userToggle.addEventListener('click', (e) => {
          e.stopPropagation();
          userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
          if (!userDropdown.contains(e.target) && e.target !== userToggle) {
            userDropdown.classList.remove('active');
          }
        });
      }

      // Logout button
      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Bạn có chắc muốn đăng xuất?')) {
            logout();
          }
        });
      }

      // Update cart count
      updateCartCount();
      
      // Attach cart preview toggle
      const cartToggle = document.getElementById('cart-dropdown-toggle');
      if (cartToggle) {
        cartToggle.addEventListener('click', toggleCartPreview);
      }
      
      // Close cart preview when clicking outside
      document.addEventListener('click', (e) => {
        const preview = document.getElementById('cart-preview');
        const toggle = document.getElementById('cart-dropdown-toggle');
        if (preview && toggle && !preview.contains(e.target) && !toggle.contains(e.target)) {
          preview.style.display = 'none';
        }
      });
    } else {
      // Not logged in - show login/register buttons
      authBtns.innerHTML = `
        <button class="btn btn-ghost" id="header-login-btn">Đăng nhập</button>
        <button class="btn btn-primary" id="header-register-btn">Đăng ký</button>
      `;

      // Attach click handlers
      document.getElementById('header-login-btn')?.addEventListener('click', () => openModal('login-modal'));
      document.getElementById('header-register-btn')?.addEventListener('click', () => openModal('register-modal'));
    }
  }

  // Open modal
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Close modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Handle login
  function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Get stored users
    const usersStr = localStorage.getItem('swiftgo_users') || '[]';
    const users = JSON.parse(usersStr);

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Login success
      const { password, ...userWithoutPassword } = user;
      saveUser(userWithoutPassword);
      closeModal('login-modal');
      e.target.reset();
      
      // Show success message
      setTimeout(() => {
        alert('Đăng nhập thành công! Chào mừng bạn trở lại.');
        // If chat toggle exists, enable it
        try {
          const toggleBtn = document.getElementById('ai-chat-toggle');
          if (toggleBtn) {
            toggleBtn.disabled = false;
          }
        } catch(_){}
      }, 300);
    } else {
      alert('Email hoặc mật khẩu không đúng!');
    }
  }

  // Handle register
  function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fullname = formData.get('fullname');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');

    // Validate
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Get stored users
    const usersStr = localStorage.getItem('swiftgo_users') || '[]';
    const users = JSON.parse(usersStr);

    // Check if email exists
    if (users.some(u => u.email === email)) {
      alert('Email đã được sử dụng!');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      fullname,
      email,
      phone: phone || '',
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('swiftgo_users', JSON.stringify(users));

    // Auto login
    const { password: _, ...userWithoutPassword } = newUser;
    saveUser(userWithoutPassword);
    closeModal('register-modal');
    e.target.reset();

    // Show success message
    setTimeout(() => {
      alert('Đăng ký thành công! Chào mừng bạn đến với Swift Go.');
      try {
        const toggleBtn = document.getElementById('ai-chat-toggle');
        if (toggleBtn) {
          toggleBtn.disabled = false;
        }
      } catch(_){}
    }, 300);
  }

  // Check if user is logged in
  function requireAuth(callback) {
    const user = getCurrentUser();
    if (!user) {
      alert('Vui lòng đăng nhập để sử dụng tính năng này!');
      openModal('login-modal');
      return false;
    }
    if (callback) callback(user);
    return true;
  }

  // Cart functions
  function getCart() {
    const cartStr = localStorage.getItem('swiftgo_cart') || '[]';
    return JSON.parse(cartStr);
  }

  function addToCart(item) {
    const user = getCurrentUser();
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }
    
    const cart = getCart();
    cart.push({
      id: Date.now(),
      ...item,
      email: user.email, // Link item to user
      addedAt: new Date().toISOString()
    });
    localStorage.setItem('swiftgo_cart', JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const user = getCurrentUser();
    const cart = getCart();
    // Filter cart by current user's email
    const userCart = user ? cart.filter(item => item.email === user.email) : [];
    
    const badge = document.getElementById('cart-count');
    if (badge) {
      badge.textContent = userCart.length;
      badge.style.display = userCart.length > 0 ? 'inline-flex' : 'none';
    }
    
    // Update cart preview
    renderCartPreview(userCart);
  }

  function renderCartPreview(userCart) {
    const previewItems = document.getElementById('cart-preview-items');
    if (!previewItems) return;
    
    if (userCart.length === 0) {
      previewItems.innerHTML = '<div class="cart-empty">Chưa có sản phẩm nào</div>';
      return;
    }
    
    previewItems.innerHTML = userCart.slice(0, 3).map(item => `
      <div class="cart-preview-item">
        <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}">
        <div class="cart-preview-info">
          <div class="cart-preview-name">${item.name}</div>
          <div class="cart-preview-meta">${item.checkIn} - ${item.checkOut}</div>
          <div class="cart-preview-price">${item.price.toLocaleString('vi-VN')}₫</div>
        </div>
      </div>
    `).join('');
    
    if (userCart.length > 3) {
      previewItems.innerHTML += `<div class="cart-more">+${userCart.length - 3} sản phẩm khác</div>`;
    }
  }

  function toggleCartPreview(e) {
    e.preventDefault();
    e.stopPropagation();
    const preview = document.getElementById('cart-preview');
    if (preview) {
      const isVisible = preview.style.display === 'block';
      preview.style.display = isVisible ? 'none' : 'block';
    }
  }

  // Initialize
  function init() {
    createAuthModals();

    // Modal close buttons
    document.querySelectorAll('#login-modal .modal-close, #register-modal .modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        closeModal(modal.id);
      });
    });

    // Click outside to close
    document.querySelectorAll('#login-modal, #register-modal').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay.id);
        }
      });
    });

    // Show register from login
    document.getElementById('show-register')?.addEventListener('click', () => {
      closeModal('login-modal');
      setTimeout(() => openModal('register-modal'), 200);
    });

    // Show login from register
    document.getElementById('show-login')?.addEventListener('click', () => {
      closeModal('register-modal');
      setTimeout(() => openModal('login-modal'), 200);
    });

    // Form submissions
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);

    // ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal('login-modal');
        closeModal('register-modal');
      }
    });
  }

  // Run when DOM ready
  function runInit() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  // Wait for components to load before updating UI
  function waitForComponents() {
    if (document.getElementById('header-placeholder')) {
      // Page uses components system - wait for them to load
      document.addEventListener('components-loaded', () => {
        updateHeaderUI();
      });
    } else {
      // Page has inline header - update immediately after init
      setTimeout(updateHeaderUI, 0);
    }
  }

  runInit();
  waitForComponents();

  // Export for external use
  window.SwiftGoAuth = {
    getCurrentUser,
    requireAuth,
    openLogin: () => openModal('login-modal'),
    openRegister: () => openModal('register-modal'),
    logout,
    getCart,
    addToCart,
    updateCartCount
  };
})();

