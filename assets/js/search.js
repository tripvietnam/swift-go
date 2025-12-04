(function(){
  const qs = new URLSearchParams(location.search);
  const dest = qs.get('destination') || '';
  const dates = qs.get('dates') || '';
  const adults = Number(qs.get('adults') || '2');
  const children = Number(qs.get('children') || '0');
  const rooms = Number(qs.get('rooms') || '1');

  const title = document.getElementById('results-title');
  const sub = document.getElementById('results-sub');
  if (title) title.textContent = dest ? `Chỗ nghỉ tại ${dest}` : 'Tất cả chỗ nghỉ';
  if (sub) sub.textContent = `${adults} người lớn · ${children} trẻ em · ${rooms} phòng`;

  let items = [];
  const list = document.getElementById('results-list');

  // Load data from services.json
  async function loadData() {
    try {
      const response = await fetch('data/services.json');
      const data = await response.json();
      
      if (data.services) {
        const accomService = data.services.find(s => s.category === 'accommodation');
        if (accomService && accomService.items) {
          items = accomService.items.map(item => ({
            id: item.id,
            name: item.name,
            city: item.location,
            type: item.name.toLowerCase().includes('resort') ? 'resort' : 
                  item.name.toLowerCase().includes('villa') ? 'villa' :
                  item.name.toLowerCase().includes('homestay') ? 'homestay' : 'hotel',
            rating: item.rating,
            price: item.price,
            img: item.image,
            reviews: item.reviews || 0,
            amenities: item.amenities || [],
            description: item.description || ''
          }));
          
          // Filter by destination if specified
          if (dest) {
            const destLower = dest.toLowerCase().trim();
            items = items.filter(item => {
              const cityLower = item.city.toLowerCase();
              const nameLower = item.name.toLowerCase();
              
              // Remove diacritics for better matching
              const removeDiacritics = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              const cityNorm = removeDiacritics(cityLower);
              const destNorm = removeDiacritics(destLower);
              
              return cityLower.includes(destLower) || 
                     nameLower.includes(destLower) ||
                     cityNorm.includes(destNorm);
            });
          }
          
          apply();
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      if (list) {
        list.innerHTML = '<div class="empty">Không thể tải dữ liệu. Vui lòng thử lại sau.</div>';
      }
    }
  }

  function formatVND(n){
    return n.toLocaleString('vi-VN') + '₫';
  }

  function render(data){
    if (!list) return;
    list.innerHTML = '';
    if (!data.length){
      list.innerHTML = '<div class="empty" style="text-align:center;padding:60px 20px;color:#6B6B6B;">Không tìm thấy kết quả phù hợp. Vui lòng thử từ khóa khác hoặc điều chỉnh bộ lọc.</div>';
      return;
    }
    for (const it of data){
      const amenitiesHtml = it.amenities && it.amenities.length > 0 
        ? `<div class="result-amenities" style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0;">${it.amenities.slice(0,3).map(a => `<span style="font-size:12px;padding:4px 8px;background:#f5f5f5;border-radius:4px;">${a}</span>`).join('')}</div>`
        : '';
      
      const a = document.createElement('article');
      a.className = 'result-card';
      a.setAttribute('data-price', String(it.price));
      a.setAttribute('data-rating', String(it.rating));
      a.setAttribute('data-type', String(it.type));
      a.setAttribute('data-item-id', String(it.id));
      a.style.cursor = 'pointer';
      a.innerHTML = `
        <img src="${it.img}" alt="${it.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" />
        <div class="result-body">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div style="flex:1;">
              <div class="result-title">${it.name}</div>
              <div class="result-sub">${it.city}</div>
            </div>
            <div style="text-align:right;">
              <span class="badge rating" style="font-size:14px;padding:4px 8px;">${it.rating.toFixed(1)}</span>
              <div style="font-size:12px;color:#6B6B6B;margin-top:4px;">${it.reviews} đánh giá</div>
            </div>
          </div>
          ${it.description ? `<p style="font-size:13px;color:#6B6B6B;margin:8px 0;line-height:1.5;">${it.description}</p>` : ''}
          ${amenitiesHtml}
          <div class="result-price" style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid #eee;">
            <div>
              <div style="font-size:12px;color:#6B6B6B;">Giá mỗi đêm từ</div>
              <strong style="font-size:18px;color:#003B95;">${formatVND(it.price)}</strong>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="btn btn-ghost" onclick="window.showBookingModal && window.showBookingModal(${it.id})">Xem phòng</button>
              <button class="btn btn-primary btn-book" data-name="${it.name}" data-location="${it.city}" data-price="${it.price}">Đặt ngay</button>
            </div>
          </div>
        </div>
      `;
      list.appendChild(a);
    }
  }

  const priceMax = document.getElementById('priceMax');
  const priceMaxVal = document.getElementById('priceMaxVal');
  const ratingChecks = Array.from(document.querySelectorAll('.rating-check'));
  const typeChecks = Array.from(document.querySelectorAll('.type-check'));

  function priceText(v){ return Number(v).toLocaleString('vi-VN') + '₫'; }

  function getFilters(){
    const maxPrice = Number(priceMax.value);
    const minRating = ratingChecks.reduce((acc, el) => el.checked ? Math.max(acc, Number(el.value)) : acc, 0);
    const types = typeChecks.filter(el => el.checked).map(el => el.value);
    return { maxPrice, minRating, types };
  }

  function apply(){
    const { maxPrice, minRating, types } = getFilters();
    let data = items.filter(it => it.price <= maxPrice && it.rating >= minRating);
    if (types.length) data = data.filter(it => types.includes(it.type));

    const sortSel = document.getElementById('sort');
    switch (sortSel.value){
      case 'price-asc': data.sort((a,b) => a.price - b.price); break;
      case 'price-desc': data.sort((a,b) => b.price - a.price); break;
      case 'rating-desc': data.sort((a,b) => b.rating - a.rating); break;
      default: break;
    }
    render(data);
  }

    // Enhance search results: add booking button per item and handle add to cart
    (function(){
      function handleBookingClick(e){
        const btn = e.target.closest('.btn-book');
        if(!btn) return;
        e.preventDefault();
        try{
          const raw = localStorage.getItem('swiftgo_user');
          const user = raw ? JSON.parse(raw) : null;
          if(!user || !user.email){
            alert('Vui lòng đăng nhập trước khi đặt phòng.');
            if(window.SwiftGoAuth && typeof window.SwiftGoAuth.openLogin==='function'){
              window.SwiftGoAuth.openLogin();
            }
            return;
          }
          const item = {
            type: 'hotel',
            name: btn.getAttribute('data-name') || 'Khách sạn',
            location: btn.getAttribute('data-location') || '',
            price: Number(btn.getAttribute('data-price')||0),
            email: user.email
          };
          if(window.SwiftGoAuth && typeof window.SwiftGoAuth.addToCart==='function'){
            window.SwiftGoAuth.addToCart(item);
            alert(`Đã thêm "${item.name}" vào giỏ hàng của bạn.`);
          } else {
            const key='swiftgo_cart';
            const rawCart=localStorage.getItem(key);
            const cart= rawCart? JSON.parse(rawCart):[];
            cart.push(item);
            localStorage.setItem(key, JSON.stringify(cart));
            alert(`Đã thêm "${item.name}" vào giỏ hàng của bạn.`);
          }
        }catch(err){
          console.error('Search booking error:', err);
          alert('Có lỗi khi thêm vào giỏ. Vui lòng thử lại.');
        }
      }

      document.addEventListener('click', handleBookingClick);
    })();

  if (priceMax && priceMaxVal){
    priceMax.addEventListener('input', () => {
      priceMaxVal.textContent = priceText(priceMax.value);
      apply();
    });
    priceMaxVal.textContent = priceText(priceMax.value);
  }
  ratingChecks.forEach(el => el.addEventListener('change', apply));
  typeChecks.forEach(el => el.addEventListener('change', apply));
  document.getElementById('sort') && document.getElementById('sort').addEventListener('change', apply);

  // Load data from JSON
  loadData();
})();

