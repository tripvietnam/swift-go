// Modal Manager - Booking & Details
(function() {
  'use strict';

  // Sample data for rooms/stays
  const sampleData = {
    'skyline-hcm': {
      name: 'Khách sạn Skyline',
      location: 'Quận 1, TP. HCM',
      price: 1250000,
      rating: 9.0,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      description: 'Khách sạn 4 sao sang trọng tại trung tâm Sài Gòn, view đẹp, tiện nghi hiện đại, gần các điểm tham quan nổi tiếng.',
      amenities: ['Wi-Fi miễn phí', 'Hồ bơi', 'Phòng gym', 'Nhà hàng', 'Bar', 'Dịch vụ phòng 24/7', 'Bãi đỗ xe', 'Spa']
    },
    'bienxanh-nhatrang': {
      name: 'Resort Biển Xanh',
      location: 'Nha Trang, Khánh Hòa',
      price: 2050000,
      rating: 8.7,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
      description: 'Resort nghỉ dưỡng bên bờ biển, bãi tắm riêng, không gian yên tĩnh, lý tưởng cho kỳ nghỉ gia đình.',
      amenities: ['Bãi biển riêng', 'Hồ bơi ngoài trời', 'Nhà hàng hải sản', 'Kids club', 'Spa & Massage', 'Dịch vụ đưa đón sân bay']
    },
    'doithong-dalat': {
      name: 'Villa Đồi Thông',
      location: 'Đà Lạt, Lâm Đồng',
      price: 3450000,
      rating: 9.3,
      image: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1200&q=80',
      description: 'Villa sang trọng giữa rừng thông, view núi tuyệt đẹp, không gian riêng tư cho nhóm bạn và gia đình.',
      amenities: ['3 phòng ngủ', 'Bếp đầy đủ', 'BBQ ngoài trời', 'Sân vườn', 'Lò sưởi', 'Netflix', 'Máy giặt', 'View núi']
    },
    'room-1': {
      name: 'Phòng mẫu 1',
      location: 'TP. Hồ Chí Minh',
      price: 990000,
      rating: 8.5,
      image: 'https://via.placeholder.com/400x300?text=Ph%C3%B2ng+1',
      description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi, sạch sẽ, thoải mái, phù hợp cho khách du lịch.',
      amenities: ['Wi-Fi', 'Máy lạnh', 'TV', 'Tủ lạnh mini', 'Nước nóng']
    }
  };

  // Create modal HTML
  function createModalHTML() {
    const bookingModal = `
      <div id="booking-modal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>Đặt phòng</h3>
            <button class="modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="modal-body">
            <form id="booking-form" class="booking-form">
              <input type="hidden" id="booking-item-id" name="item_id">
              <div class="form-group">
                <label>Họ và tên *</label>
                <input type="text" name="full_name" required placeholder="Nguyễn Văn A">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required placeholder="email@example.com">
                </div>
                <div class="form-group">
                  <label>Số điện thoại *</label>
                  <input type="tel" name="phone" required placeholder="0912345678">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ngày nhận phòng *</label>
                  <input type="date" name="check_in" required>
                </div>
                <div class="form-group">
                  <label>Ngày trả phòng *</label>
                  <input type="date" name="check_out" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Số người lớn</label>
                  <select name="adults">
                    <option value="1">1 người</option>
                    <option value="2" selected>2 người</option>
                    <option value="3">3 người</option>
                    <option value="4">4 người</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Số trẻ em</label>
                  <select name="children">
                    <option value="0" selected>0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Ghi chú thêm</label>
                <textarea name="notes" placeholder="Yêu cầu đặc biệt, giờ check-in dự kiến..."></textarea>
              </div>
              <div class="price-summary">
                <div class="price-row">
                  <span>Giá phòng/đêm:</span>
                  <span id="room-price-display">-</span>
                </div>
                <div class="price-row">
                  <span>Số đêm:</span>
                  <span id="nights-display">-</span>
                </div>
                <div class="price-row total">
                  <span>Tổng cộng:</span>
                  <span id="total-price-display">-</span>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost modal-cancel">Hủy</button>
            <button type="submit" form="booking-form" class="btn btn-primary">Xác nhận đặt phòng</button>
          </div>
        </div>
      </div>
    `;

    const detailModal = `
      <div id="detail-modal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3 id="detail-title">Chi tiết</h3>
            <button class="modal-close" aria-label="Đóng">&times;</button>
          </div>
          <div class="modal-body">
            <img id="detail-image" class="detail-image" src="" alt="">
            <div class="detail-section">
              <h4>Mô tả</h4>
              <p id="detail-description">-</p>
            </div>
            <div class="detail-section">
              <h4>Địa điểm</h4>
              <p id="detail-location">-</p>
            </div>
            <div class="detail-section">
              <h4>Tiện nghi</h4>
              <div id="detail-amenities" class="amenities-list"></div>
            </div>
            <div class="detail-section">
              <h4>Giá phòng</h4>
              <p style="font-size:20px;font-weight:700;color:#003B95;" id="detail-price">-</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost modal-cancel">Đóng</button>
            <button type="button" class="btn btn-primary" id="detail-book-now">Đặt ngay</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bookingModal + detailModal);
  }

  // Format price
  function formatPrice(price) {
    return price.toLocaleString('vi-VN') + '₫';
  }

  // Calculate nights between dates
  function calculateNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = d2 - d1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Update price summary
  function updatePriceSummary(itemId) {
    const item = sampleData[itemId];
    if (!item) return;

    const checkIn = document.querySelector('[name="check_in"]').value;
    const checkOut = document.querySelector('[name="check_out"]').value;
    const nights = calculateNights(checkIn, checkOut);
    const total = item.price * nights;

    document.getElementById('room-price-display').textContent = formatPrice(item.price);
    document.getElementById('nights-display').textContent = nights + ' đêm';
    document.getElementById('total-price-display').textContent = formatPrice(total);
  }

  // Open booking modal
  function openBookingModal(itemId) {
    const item = sampleData[itemId] || sampleData['room-1'];
    const modal = document.getElementById('booking-modal');
    const form = document.getElementById('booking-form');
    
    document.getElementById('booking-item-id').value = itemId;
    
    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    form.querySelector('[name="check_in"]').min = today;
    form.querySelector('[name="check_in"]').value = today;
    form.querySelector('[name="check_out"]').min = tomorrow;
    form.querySelector('[name="check_out"]').value = tomorrow;

    updatePriceSummary(itemId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Open detail modal
  function openDetailModal(itemId) {
    const item = sampleData[itemId] || sampleData['room-1'];
    const modal = document.getElementById('detail-modal');
    
    document.getElementById('detail-title').textContent = item.name;
    document.getElementById('detail-image').src = item.image;
    document.getElementById('detail-image').alt = item.name;
    document.getElementById('detail-description').textContent = item.description;
    document.getElementById('detail-location').textContent = item.location;
    document.getElementById('detail-price').textContent = formatPrice(item.price) + ' / đêm';
    
    const amenitiesList = document.getElementById('detail-amenities');
    amenitiesList.innerHTML = item.amenities.map(a => 
      `<div class="amenity-item">${a}</div>`
    ).join('');

    // Store itemId for booking
    document.getElementById('detail-book-now').dataset.itemId = itemId;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Handle booking form submit
  function handleBookingSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const itemId = data.item_id;
    const item = sampleData[itemId];
    
    if (!item) return;
    
    console.log('Booking data:', data);
    
    // Add to cart
    const cartItem = {
      itemId: itemId,
      name: item.name,
      location: item.location,
      price: item.price,
      image: item.image,
      checkIn: data.check_in,
      checkOut: data.check_out,
      adults: data.adults,
      children: data.children,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      notes: data.notes
    };
    
    if (window.SwiftGoAuth && window.SwiftGoAuth.addToCart) {
      window.SwiftGoAuth.addToCart(cartItem);
    }
    
    // Show success message
    alert('Đã thêm vào giỏ hàng!\n\nThông tin đặt phòng:\n' +
      `Phòng: ${item.name}\n` +
      `Check-in: ${data.check_in}\n` +
      `Check-out: ${data.check_out}\n` +
      `Khách: ${data.adults} người lớn, ${data.children} trẻ em\n\n` +
      'Bạn có thể xem giỏ hàng và thanh toán sau.'
    );
    
    closeModal('booking-modal');
    e.target.reset();
  }

  // Initialize
  function init() {
    createModalHTML();

    // Close buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        closeModal(modal.id);
      });
    });

    // Click outside to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal(overlay.id);
        }
      });
    });

    // Booking form submit
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);

    // Date change listener
    document.querySelector('[name="check_in"]').addEventListener('change', () => {
      const itemId = document.getElementById('booking-item-id').value;
      updatePriceSummary(itemId);
    });
    document.querySelector('[name="check_out"]').addEventListener('change', () => {
      const itemId = document.getElementById('booking-item-id').value;
      updatePriceSummary(itemId);
    });

    // Detail modal - book now button
    document.getElementById('detail-book-now').addEventListener('click', (e) => {
      const itemId = e.target.dataset.itemId;
      closeModal('detail-modal');
      setTimeout(() => openBookingModal(itemId), 200);
    });

    // Attach to all booking buttons
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Check if clicked on a booking/detail button
      if (target.matches('.btn-primary') || target.closest('.btn-primary')) {
        const btn = target.matches('.btn-primary') ? target : target.closest('.btn-primary');
        const card = btn.closest('.stay-card, .room-card, .tour-card, .result-card');
        
        if (card) {
          e.preventDefault();
          const itemId = card.dataset.itemId || 'room-1';
          
          // If button text contains specific keywords
          const btnText = btn.textContent.toLowerCase();
          if (btnText.includes('chi tiết') || btnText.includes('xem')) {
            openDetailModal(itemId);
          } else {
            // Check login before booking
            if (window.SwiftGoAuth && !window.SwiftGoAuth.requireAuth()) {
              return;
            }
            openBookingModal(itemId);
          }
        }
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
          closeModal(modal.id);
        });
      }
    });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for external use
  window.SwiftGoModal = {
    openBooking: openBookingModal,
    openDetail: openDetailModal,
    close: closeModal
  };
})();

