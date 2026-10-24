/* ===========================================================================
   CAFE LANDING PAGE - STATIC PUBLIC FRONTEND CORE ENGINE
   =========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initStaticStoreStatus();
  initHeroBannerSlider();
  initStaticMenuSystem();
  initItemDetailModal();
  initAboutCarousel();
  initAboutStatsCounter();
  initPromoForm();
  initPrivacyModal();
});

/* ===========================================================================
   1. NAVBAR & NAVIGATION
   =========================================================================== */
function initNavbar() {
  const hamburger = document.getElementById('hamburger-btn');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
    });

    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        navLinks.classList.remove('active');
      }
    });
  }

  const sections = document.querySelectorAll('section, header');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      if (section.id) {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          current = section.id;
        }
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

/* ===========================================================================
   2. STATIC STORE STATUS
   =========================================================================== */
function initStaticStoreStatus() {
  const badge = document.getElementById('store-status-badge') || document.getElementById('store-status');
  if (badge) {
    badge.className = 'status-badge open';
    badge.textContent = 'OPEN NOW';
  }
}

/* ===========================================================================
   3. HERO BANNER SLIDER (With Touch/Swipe Support for Mobile)
   =========================================================================== */
let currentSlideIndex = 0;
let slideInterval = null;

function initHeroBannerSlider() {
  const track = document.getElementById('hero-slider-track');
  const sliderContainer = document.querySelector('.hero-slider');
  if (!track) return;
  
  const totalSlides = track.children.length;
  if (totalSlides > 1) {
    startAutoSlide(totalSlides);
  }

  // --- SWIPE GESTURE SUPPORT ---
  if (sliderContainer) {
    let startX = 0;
    let endX = 0;

    sliderContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    sliderContainer.addEventListener('touchmove', (e) => {
      endX = e.touches[0].clientX;
    }, { passive: true });

    sliderContainer.addEventListener('touchend', () => {
      if (!startX || !endX) return;
      const diffX = startX - endX;
      
      // Minimum drag distance required (50px)
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swiped left -> Next slide
          setSlide(currentSlideIndex + 1);
        } else {
          // Swiped right -> Previous slide
          setSlide(currentSlideIndex - 1);
        }
      }
      startX = 0;
      endX = 0;
    });
  }
}

function setSlide(index) {
  const track = document.getElementById('hero-slider-track');
  const dots = document.querySelectorAll('.slider-dots .dot, #hero-dots .dot');
  const total = track ? track.children.length : 0;
  
  if (total === 0) return;
  currentSlideIndex = (index + total) % total;

  if (track) {
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  }

  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlideIndex);
  });
  
  startAutoSlide(total);
}

function startAutoSlide(total) {
  if (slideInterval) clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    currentSlideIndex = (currentSlideIndex + 1) % total;
    setSlide(currentSlideIndex);
  }, 5000);
}

/* ===========================================================================
   4. STATIC MENU SYSTEM
   =========================================================================== */
function initStaticMenuSystem() {
  const searchInput = document.getElementById('menu-search');
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterStaticCards(query, getCurrentActiveCategory());
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.getAttribute('data-category');
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      filterStaticCards(query, category);
    });
  });
  
  const cards = document.querySelectorAll('#menu-grid .card');
  cards.forEach((card, idx) => {
    card.setAttribute('data-id', idx);
    card.addEventListener('click', () => {
      const name = card.querySelector('h4')?.textContent || 'Specialty Item';
      const desc = card.querySelector('p')?.textContent || '';
      const price = card.querySelector('.price')?.textContent || '₱100';
      const imgSrc = card.querySelector('img')?.src || 'images/Logo.jpg';
      const cat = card.getAttribute('data-category') || 'Specialty';
      
      openStaticItemModal({ name, desc, price, imgSrc, category: cat });
    });
  });
}

function getCurrentActiveCategory() {
  const activeBtn = document.querySelector('.filter-btn.active');
  return activeBtn ? activeBtn.getAttribute('data-category') : 'all';
}

function filterStaticCards(searchQuery, category) {
  const cards = document.querySelectorAll('#menu-grid .card');
  cards.forEach(card => {
    const cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
    const text = card.textContent.toLowerCase();

    const matchesSearch = text.includes(searchQuery);
    let matchesCategory = (category === 'all');

    if (!matchesCategory) {
      const cleanFilter = category.toLowerCase().replace(/-/g, ' ');
      if (cleanFilter === 'iced coffee') {
        matchesCategory = cardCategory.includes('iced');
      } else if (cleanFilter === 'hot coffee') {
        matchesCategory = cardCategory.includes('hot');
      } else {
        matchesCategory = cardCategory.includes(cleanFilter);
      }
    }

    if (matchesSearch && matchesCategory) {
      card.classList.remove('hide');
    } else {
      card.classList.add('hide');
    }
  });
}

/* ===========================================================================
   5. MENU ITEM DETAIL MODAL
   =========================================================================== */
function initItemDetailModal() {
  const modal = document.getElementById('item-detail-modal');
  const closeBtn = document.getElementById('close-item-modal-btn');
  const closeActionBtn = document.getElementById('modal-close-action-btn');
  const grabBtn = document.getElementById('modal-order-grab-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeItemDetailModal);
  if (closeActionBtn) closeActionBtn.addEventListener('click', closeItemDetailModal);

  if (grabBtn) {
    grabBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeItemDetailModal();
      const grabSection = document.getElementById('grab');
      if (grabSection) grabSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeItemDetailModal();
    });
  }
}

function openStaticItemModal(item) {
  const modal = document.getElementById('item-detail-modal');
  if (!modal) return;

  const catLower = (item.category || '').toLowerCase();
  const isFood = catLower.includes('pasta') || catLower.includes('croffle');

  document.getElementById('modal-item-img').src = item.imgSrc;
  document.getElementById('modal-item-category').textContent = item.category.toUpperCase();
  document.getElementById('modal-item-name').textContent = item.name;
  document.getElementById('modal-item-desc').textContent = item.desc;
  
  const priceEl = document.getElementById('modal-item-price');
  if (priceEl) priceEl.textContent = item.price;

  const optionsBox = document.getElementById('modal-options-container');
  if (optionsBox) {
    if (isFood) {
      optionsBox.innerHTML = `
        <h5 class="options-heading"><i class="fa-solid fa-utensils"></i> Serving & Portion</h5>
        <div class="size-options-list">
          <div class="size-option-pill active">
            <span>Standard Serving</span>
            <strong>${item.price}</strong>
          </div>
        </div>
      `;
    } else {
      optionsBox.innerHTML = `
        <h5 class="options-heading"><i class="fa-solid fa-mug-hot"></i> Sizes & Pricing</h5>
        <div class="size-options-list" id="modal-size-list">
          <div class="size-option-pill active">
            <span>Regular (16oz)</span>
            <strong id="modal-item-price">${item.price}</strong>
          </div>
          <div class="size-option-pill">
            <span>Large / Up-Size (22oz)</span>
            <strong>+₱15</strong>
          </div>
        </div>
      `;
    }
  }

  const allergenList = document.getElementById('modal-allergen-list');
  if (allergenList) {
    if (isFood) {
      allergenList.innerHTML = `
        <li><i class="fa-solid fa-circle-check"></i> Prepared fresh from our kitchen daily</li>
        <li><i class="fa-solid fa-circle-check"></i> Best served warm & crisp</li>
      `;
    } else {
      allergenList.innerHTML = `
        <li><i class="fa-solid fa-circle-check"></i> Freshly brewed upon order</li>
        <li><i class="fa-solid fa-circle-check"></i> Customizable sweetness & dairy options available</li>
      `;
    }
  }

  modal.classList.remove('hide');
}

function closeItemDetailModal() {
  const modal = document.getElementById('item-detail-modal');
  if (modal) modal.classList.add('hide');
}

/* ===========================================================================
   6. ABOUT CAROUSEL & STATS COUNTER (With Touch/Swipe Support)
   =========================================================================== */
let currentAboutSlide = 0;

function initAboutCarousel() {
  const prevBtn = document.getElementById('about-prev');
  const nextBtn = document.getElementById('about-next');
  const aboutContainer = document.querySelector('.about-carousel');

  if (prevBtn) prevBtn.addEventListener('click', () => changeAboutSlide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeAboutSlide(1));

  // --- SWIPE GESTURE SUPPORT FOR ABOUT CAROUSEL ---
  if (aboutContainer) {
    let startX = 0;
    let endX = 0;

    aboutContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    aboutContainer.addEventListener('touchmove', (e) => {
      endX = e.touches[0].clientX;
    }, { passive: true });

    aboutContainer.addEventListener('touchend', () => {
      if (!startX || !endX) return;
      const diffX = startX - endX;

      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          changeAboutSlide(1);  // Swiped left -> Next
        } else {
          changeAboutSlide(-1); // Swiped right -> Prev
        }
      }
      startX = 0;
      endX = 0;
    });
  }
}

function changeAboutSlide(direction) {
  const slides = document.querySelectorAll('.about-slide');
  const dots = document.querySelectorAll('.about-dot');
  if (slides.length === 0) return;

  currentAboutSlide = (currentAboutSlide + direction + slides.length) % slides.length;

  slides.forEach((slide, idx) => {
    slide.classList.toggle('active', idx === currentAboutSlide);
  });
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentAboutSlide);
  });
}

function setAboutSlide(index) {
  const slides = document.querySelectorAll('.about-slide');
  const dots = document.querySelectorAll('.about-dot');
  if (slides.length === 0) return;

  currentAboutSlide = index;
  slides.forEach((slide, idx) => slide.classList.toggle('active', idx === currentAboutSlide));
  dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentAboutSlide));
}

function initAboutStatsCounter() {
  const stats = document.querySelectorAll('.stat-number');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        stats.forEach(stat => {
          const target = parseInt(stat.getAttribute('data-target') || '0', 10);
          let current = 0;
          const increment = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.textContent = target;
              clearInterval(timer);
            } else {
              stat.textContent = current;
            }
          }, 30);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) observer.observe(statsSection);
}

/* ===========================================================================
   7. PROMO VOUCHER
   =========================================================================== */
function initPromoForm() {
  const followLinks = document.querySelectorAll('.social-follow-link');
  const claimBtn = document.getElementById('claim-promo-btn');
  const claimBtnText = document.getElementById('claim-btn-text');
  const claimBtnIcon = document.getElementById('claim-btn-icon');
  const promoForm = document.getElementById('promo-form');

  followLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (claimBtn) {
        claimBtn.removeAttribute('disabled');
        if (claimBtnText) claimBtnText.textContent = 'Claim Your Free Drink Up-Size Voucher!';
        if (claimBtnIcon) claimBtnIcon.className = 'fa-solid fa-gift';
      }
    });
  });

  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      if (promoForm) {
        promoForm.classList.remove('hide');
        claimBtn.style.display = 'none';
        promoForm.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (promoForm) {
    promoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('promo-name').value.trim();
      if (!nameInput) {
        alert('Please enter your name.');
        return;
      }
      promoForm.classList.add('hide');
      const ticket = document.getElementById('digital-ticket');
      const codeDisplay = document.getElementById('ticket-code-display');
      if (codeDisplay) codeDisplay.textContent = 'OWLS-DEMO-2026';
      if (ticket) ticket.classList.remove('hide');
    });
  }
}

/* ===========================================================================
   8. PRIVACY MODAL & UTILITIES
   =========================================================================== */
function initPrivacyModal() {
  const privacyModal = document.getElementById('privacy-modal');
  const closeBtn = document.getElementById('close-modal-btn');
  const agreeBtn = document.getElementById('modal-agree-btn');
  const openTermsLink = document.getElementById('open-terms-link');
  const openPrivacyLink = document.getElementById('open-privacy-link');

  const openModal = () => { if (privacyModal) privacyModal.classList.remove('hide'); };
  const closeModal = () => { if (privacyModal) privacyModal.classList.add('hide'); };

  if (openTermsLink) openTermsLink.addEventListener('click', openModal);
  if (openPrivacyLink) openPrivacyLink.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (agreeBtn) agreeBtn.addEventListener('click', closeModal);
}