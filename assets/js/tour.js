(function(){
  function fmt(n){ return new Intl.NumberFormat('vi-VN').format(n); }
  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return document.querySelectorAll(sel); }

  // Booking form on single tour
  var form = q('#tour-booking-form');
  if (form){
    var price = parseFloat(form.getAttribute('data-price') || '0');
    var adultsEl = q('#bk-adults');
    var childrenEl = q('#bk-children');
    var totalEl = q('#bk-total');
    var submitBtn = q('#bk-submit');

    function calc(){
      var a = Math.max(1, parseInt(adultsEl.value||'1',10));
      var c = Math.max(0, parseInt(childrenEl.value||'0',10));
      var total = price * a + price * 0.5 * c;
      totalEl.textContent = fmt(total) + '₫';
      return total;
    }
    adultsEl.addEventListener('input', calc);
    childrenEl.addEventListener('input', calc);
    calc();

    form.addEventListener('submit', function(e){
      e.preventDefault();
      submitBtn.disabled = true;
      submitBtn.textContent = 'Đang gửi...';
      var payload = new URLSearchParams({
        action: 'book_tour',
        nonce: (window.swiftgoTour && window.swiftgoTour.nonce) ? window.swiftgoTour.nonce : '',
        tourId: form.getAttribute('data-tour-id') || '',
        name: q('#bk-name').value.trim(),
        email: q('#bk-email').value.trim(),
        phone: q('#bk-phone').value.trim(),
        adults: adultsEl.value,
        children: childrenEl.value,
        startDate: q('#bk-start').value,
        payment: q('#bk-payment').value,
      });
      fetch((window.swiftgoTour && window.swiftgoTour.ajaxUrl) ? window.swiftgoTour.ajaxUrl : '/wp-admin/admin-ajax.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: payload
      }).then(function(r){ return r.json(); }).then(function(data){
        if (data && data.success){
          alert('Đặt tour thành công! Tổng: ' + fmt(data.data.total) + '₫');
          form.reset();
          calc();
        } else {
          alert('Lỗi: ' + (data && data.data && data.data.message ? data.data.message : 'Không rõ'));
        }
      }).catch(function(err){
        alert('Lỗi mạng: ' + err.message);
      }).finally(function(){
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đặt tour ngay';
      });
    });
  }

  // Filters on archive
  var filterForm = q('#tour-filters');
  if (filterForm){
    filterForm.addEventListener('submit', function(e){
      // allow default GET submit
    });
  }

  // Favorite toggle
  var favBtn = q('#fav-btn');
  if (favBtn){
    favBtn.addEventListener('click', function(){
      var tourId = favBtn.getAttribute('data-tour-id');
      var payload = new URLSearchParams({
        action: 'toggle_favorite_tour',
        nonce: (window.swiftgoTour && window.swiftgoTour.nonce) ? window.swiftgoTour.nonce : '',
        tourId: tourId,
      });
      fetch((window.swiftgoTour && window.swiftgoTour.ajaxUrl) ? window.swiftgoTour.ajaxUrl : '/wp-admin/admin-ajax.html', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: payload
      }).then(function(r){ return r.json(); }).then(function(data){
        if (data && data.success){
          favBtn.textContent = data.data.favorited ? '❤ Đã yêu thích' : '❤ Yêu thích';
        } else {
          alert('Cần đăng nhập để lưu yêu thích');
        }
      }).catch(function(err){ alert('Lỗi mạng: ' + err.message); });
    });
  }
})();
