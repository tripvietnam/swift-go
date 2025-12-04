(() => {
  const CHAT_IDS = {
    btn: 'ai-chat-open',
    panel: 'ai-chat-panel',
    close: 'ai-chat-close',
    list: 'ai-chat-messages',
    input: 'ai-chat-input',
    send: 'ai-chat-send'
  };

  const state = {
    services: [],
    user: null,
    ready: false
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function loadUser() {
    try {
      const raw = localStorage.getItem('swiftgo_user');
      state.user = raw ? JSON.parse(raw) : null;
    } catch {}
  }

  async function loadServices() {
    try {
      const res = await fetch('/data/services.json');
      const json = await res.json();
      state.services = (json && json.services && json.services.items) ? json.services.items : [];
    } catch (e) {
      state.services = [];
    }
  }

  function ensurePanel() {
    const btn = getEl(CHAT_IDS.btn);
    const panel = getEl(CHAT_IDS.panel);
    const close = getEl(CHAT_IDS.close);
    const list = getEl(CHAT_IDS.list);
    const input = getEl(CHAT_IDS.input);
    const send = getEl(CHAT_IDS.send);
    return !!(btn && panel && close && list && input && send);
  }

  function openPanel() {
    const panel = getEl(CHAT_IDS.panel);
    if (panel) panel.classList.add('open');
  }
  function closePanel() {
    const panel = getEl(CHAT_IDS.panel);
    if (panel) panel.classList.remove('open');
  }

  function addMessage(role, html) {
    const list = getEl(CHAT_IDS.list);
    if (!list) return;
    const li = document.createElement('li');
    li.className = role === 'user' ? 'msg user' : 'msg ai';
    li.innerHTML = html;
    list.appendChild(li);
    list.scrollTop = list.scrollHeight;
  }

  function sanitize(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function searchHotelsIn(cityKeyword) {
    const kw = (cityKeyword || '').toLowerCase();
    return state.services.filter(s => {
      const loc = (s.location || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const cat = (s.category || '').toLowerCase();
      return (loc.includes('đà nẵng') || loc.includes('da nang') || kw && loc.includes(kw))
        && (cat.includes('khách sạn') || name.includes('khách sạn'));
    }).slice(0, 3);
  }

  function serviceLink(name) {
    const q = encodeURIComponent(name || '');
    // Link to search page with query (static HTML for GitHub Pages)
    return `/page-search.html?q=${q}`;
  }

  function renderHotelCard(s) {
    const name = sanitize(s.name);
    const desc = sanitize(s.description || '');
    const loc = sanitize(s.location || '');
    const price = s.price ? sanitize(s.price) : '';
    const link = serviceLink(s.name);
    const id = `order-${(name || '').toLowerCase().replace(/\s+/g,'-')}`;
    return `
      <div class="chat-card">
        <div class="chat-card-title">${name}</div>
        <div class="chat-card-meta">${loc}${price ? ' • ' + price : ''}</div>
        <div class="chat-card-desc">${desc}</div>
        <div class="chat-card-actions">
          <a class="btn btn-link" href="${link}" target="_self">Xem chi tiết</a>
          <button class="btn btn-primary" data-order="${id}" data-name="${sanitize(s.name)}" data-location="${sanitize(s.location || '')}" data-price="${sanitize(s.price || '')}">Đặt ngay</button>
        </div>
      </div>
    `;
  }

  function respondWithHotels(cityMention) {
    const hotels = searchHotelsIn(cityMention || 'Đà Nẵng');
    if (hotels.length === 0) {
      addMessage('ai', 'Hiện chưa tìm thấy khách sạn phù hợp tại khu vực yêu cầu. Bạn có thể thử tìm tại trang Tìm kiếm.');
      return;
    }
    const html = hotels.map(renderHotelCard).join('');
    addMessage('ai', `<div class="chat-grid">${html}</div>`);
  }

  function requireLogin() {
    loadUser();
    if (!state.user) {
      addMessage('ai', 'Vui lòng đăng nhập để dùng Chat và đặt hàng.');
      return false;
    }
    return true;
  }

  function handleOrderFromChat(btn) {
    if (!requireLogin()) return;
    const name = btn.getAttribute('data-name');
    const location = btn.getAttribute('data-location') || '';
    const price = btn.getAttribute('data-price') || '';
    const item = {
      type: 'hotel',
      name,
      location,
      price,
      email: state.user && state.user.email || ''
    };
    try {
      if (window.SwiftGoAuth && typeof window.SwiftGoAuth.addToCart === 'function') {
        window.SwiftGoAuth.addToCart(item);
        addMessage('ai', `Đã thêm "${sanitize(name)}" vào giỏ hàng của bạn. Bạn có thể xem tại trang Giỏ hàng.`);
      } else {
        addMessage('ai', 'Không thể thêm vào giỏ lúc này. Vui lòng thử lại sau.');
      }
    } catch (e) {
      addMessage('ai', 'Có lỗi khi đặt từ chat. Vui lòng thử lại.');
    }
  }

  function wireActions() {
    const btn = getEl(CHAT_IDS.btn);
    const close = getEl(CHAT_IDS.close);
    const send = getEl(CHAT_IDS.send);
    const input = getEl(CHAT_IDS.input);
    const panel = getEl(CHAT_IDS.panel);
    const list = getEl(CHAT_IDS.list);
    if (!btn || !close || !send || !input || !panel || !list) return;

    btn.addEventListener('click', () => {
      if (!requireLogin()) return;
      openPanel();
    });
    close.addEventListener('click', closePanel);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        send.click();
      }
    });
    send.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      addMessage('user', sanitize(text));
      input.value = '';
      // Simple intent: hotels in Đà Nẵng
      const lower = text.toLowerCase();
      const askHotels = lower.includes('khách sạn') || lower.includes('hotel');
      const hasDanang = lower.includes('đà nẵng') || lower.includes('da nang');
      if (askHotels && hasDanang) {
        respondWithHotels('Đà Nẵng');
      } else if (askHotels) {
        // Try to extract last word as city
        const city = (text.match(/tại\s+(.+)/i) || [])[1] || '';
        respondWithHotels(city);
      } else {
        // Generic fallback: suggest how to ask
        addMessage('ai', 'Bạn có thể hỏi: "Khách sạn ở Đà Nẵng" để xem gợi ý và đặt ngay trong chat.');
      }
    });

    // Delegate order buttons
    list.addEventListener('click', (e) => {
      const target = e.target;
      if (target && target.matches('button[data-order]')) {
        handleOrderFromChat(target);
      }
    });
  }

  async function init() {
    // Wait for header/footer components if they dispatch an event
    const start = async () => {
      await loadServices();
      loadUser();
      if (!ensurePanel()) return; // panel must exist in footer component
      wireActions();
      state.ready = true;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => start());
    } else {
      start();
    }

    // Also listen for custom components-loaded event if present
    window.addEventListener('components-loaded', () => {
      if (!state.ready) init();
    });
  }

  init();
})();
// Swift Go AI Chat Widget
(function() {
  'use strict';

  // ⚠️ PROXY_URL: Update this to your Vercel deployment URL after deploying
  // Example: const PROXY_URL = 'https://your-vercel-app.vercel.app/api/chat';
  const PROXY_URL = '/api/chat'; // Local development or same-origin proxy
  const MODEL = 'llama-3.3-70b-versatile';
  const STORAGE_KEY = 'swiftgo_chat_history';

  let chatHistory = [];
  let isOpen = false;

  // DOM elements
  let widget, toggleBtn, panel, closeBtn, messages, form, input, clearBtn;

  // Initialize DOM references
  function initDOM() {
    widget = document.getElementById('ai-chat-widget');
    toggleBtn = document.getElementById('ai-chat-toggle');
    panel = document.getElementById('ai-chat-panel');
    closeBtn = document.getElementById('ai-chat-close');
    messages = document.getElementById('ai-chat-messages');
    form = document.getElementById('ai-chat-form');
    input = document.getElementById('ai-chat-input');
    clearBtn = document.getElementById('ai-chat-clear');

    return widget && toggleBtn && panel && messages && form && input;
  }

  // Check if user is logged in
  function isLoggedIn() {
    return window.SwiftGoAuth && window.SwiftGoAuth.getCurrentUser && window.SwiftGoAuth.getCurrentUser();
  }

  // Show/hide chat panel
  function togglePanel() {
    if (!isLoggedIn()) {
      alert('Vui lòng đăng nhập để sử dụng Chat AI!');
      if (window.SwiftGoAuth && window.SwiftGoAuth.openLogin) {
        window.SwiftGoAuth.openLogin();
      }
      return;
    }

    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', isOpen);
    
    if (isOpen && input) {
      input.focus();
    }
  }

  // Add message to chat
  function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-msg';

    const avatar = document.createElement('div');
    avatar.className = `ai-avatar ${role}`;
    avatar.textContent = role === 'user' ? 'Bạn' : 'AI';

    const bubble = document.createElement('div');
    bubble.className = `ai-bubble ${role}`;
    bubble.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messages.appendChild(messageDiv);

    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;

    // Save to history
    if (role !== 'system') {
      chatHistory.push({ role, content });
      saveHistory();
    }
  }

  // Add loading message
  function addLoading() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'ai-msg';
    messageDiv.id = 'loading-msg';

    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar assistant';
    avatar.textContent = 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble assistant loading';
    bubble.textContent = 'Đang suy nghĩ...';

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;

    return messageDiv;
  }

  // Remove loading message
  function removeLoading() {
    const loading = document.getElementById('loading-msg');
    if (loading) {
      loading.remove();
    }
  }

  // Send message to AI via secure proxy
  async function sendMessage(userMessage) {
    addMessage('user', userMessage);
    const loading = addLoading();

    try {
      // Call secure backend proxy (no API key exposed)
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          history: chatHistory.slice(-10), // Last 10 messages for context
          message: userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();
      removeLoading();

      if (data.reply) {
        addMessage('assistant', data.reply);
      } else {
        addMessage('assistant', 'Xin lỗi, tôi không thể trả lời lúc này.');
      }
    } catch (error) {
      removeLoading();
      console.error('Chat error:', error);
      addMessage('assistant', 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }

  // Save chat history to localStorage
  function saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory.slice(-50)));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }

  // Load chat history from localStorage
  function loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        chatHistory = JSON.parse(saved);
        chatHistory.forEach(msg => {
          if (msg.role !== 'system') {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-msg';

            const avatar = document.createElement('div');
            avatar.className = `ai-avatar ${msg.role}`;
            avatar.textContent = msg.role === 'user' ? 'Bạn' : 'AI';

            const bubble = document.createElement('div');
            bubble.className = `ai-bubble ${msg.role}`;
            bubble.textContent = msg.content;

            messageDiv.appendChild(avatar);
            messageDiv.appendChild(bubble);
            messages.appendChild(messageDiv);
          }
        });
        messages.scrollTop = messages.scrollHeight;
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
  }

  // Clear chat history
  function clearHistory() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      chatHistory = [];
      messages.innerHTML = '';
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Handle form submit
  function handleSubmit(e) {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    sendMessage(message);
  }

  // Setup event listeners
  function setupEvents() {
    if (toggleBtn) {
      toggleBtn.addEventListener('click', togglePanel);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        isOpen = false;
        panel.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', clearHistory);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        isOpen = false;
        panel.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Initialize chat widget
  function init() {
    if (!initDOM()) {
      console.warn('Chat widget elements not found, retrying...');
      return false;
    }

    console.log('✅ Chat widget initialized');
    setupEvents();
    loadHistory();
    return true;
  }

  // Try to initialize
  function tryInit() {
    if (init()) return;

    // Retry after components loaded
    document.addEventListener('components-loaded', () => {
      setTimeout(init, 100);
    });

    // Fallback retry
    setTimeout(() => {
      if (!widget) init();
    }, 1000);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
