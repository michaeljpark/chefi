document.addEventListener('DOMContentLoaded', () => {
  const pagesContainer = document.getElementById('pages');
  const navButtons = document.querySelectorAll('.nav-btn');
  const pager = document.getElementById('pager');
  
  // State
  let currentPageIndex = 0; // 0: Feed, 1: Reels, 2: Profile
  const totalPages = 3;

  // --- ONBOARDING LOGIC ---
  window.nextStep = function(step) {
    document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
    const nextEl = document.getElementById(`step-${step}`);
    if (nextEl) nextEl.classList.add('active');
  };

  window.skipOnboarding = function() {
    document.getElementById('onboarding').classList.add('hidden');
  };

  window.finishOnboarding = function() {
    document.getElementById('onboarding').classList.add('hidden');
    // Could save preferences here
  };

  window.togglePref = function(btn) {
    btn.classList.toggle('selected');

    // Handle image grid shrinking effect
    const imageGrid = btn.closest('.preference-grid-images');
    if (imageGrid) {
      const hasSelection = imageGrid.querySelector('.selected');
      if (hasSelection) {
        imageGrid.classList.add('has-selection');
      } else {
        imageGrid.classList.remove('has-selection');
      }
    }
  };

  // --- TINDER FEED LOGIC ---
  const cardStack = document.getElementById('card-stack');
  let cards = Array.from(document.querySelectorAll('.tinder-card'));

  function initCards() {
    cards.forEach((card, index) => {
      card.style.zIndex = cards.length - index;
      // Reset transform
      card.style.transform = '';
      
      // Add listeners only to the top card
      if (index === 0) {
        addSwipeListeners(card);
      }
    });
  }

  function addSwipeListeners(card) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const threshold = 100; // px to trigger swipe

    const onDown = (e) => {
      startX = e.clientX || e.touches[0].clientX;
      isDragging = true;
      card.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const x = (e.clientX || e.touches[0].clientX);
      currentX = x - startX;
      
      // Rotate based on X movement
      const rotate = currentX * 0.1;
      card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

      // Show overlays
      const likeOverlay = card.querySelector('.overlay-like');
      const nopeOverlay = card.querySelector('.overlay-nope');
      
      if (currentX > 0) {
        likeOverlay.style.opacity = Math.min(currentX / 100, 1);
        nopeOverlay.style.opacity = 0;
      } else {
        nopeOverlay.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
        likeOverlay.style.opacity = 0;
      }
    };

    const onUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = 'transform 0.3s ease-out';

      if (currentX > threshold) {
        // Swipe Right (Like)
        card.style.transform = `translateX(${window.innerWidth}px) rotate(30deg)`;
        setTimeout(() => removeCard(card), 300);
      } else if (currentX < -threshold) {
        // Swipe Left (Nope)
        card.style.transform = `translateX(-${window.innerWidth}px) rotate(-30deg)`;
        setTimeout(() => removeCard(card), 300);
      } else {
        // Snap back
        card.style.transform = '';
        card.querySelector('.overlay-like').style.opacity = 0;
        card.querySelector('.overlay-nope').style.opacity = 0;
      }
    };

    card.addEventListener('mousedown', onDown);
    card.addEventListener('touchstart', onDown);
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    
    // Store cleanup function on card to remove listeners later if needed
    card._cleanup = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }

  function removeCard(card) {
    if (card._cleanup) card._cleanup();
    card.remove();
    cards.shift(); // Remove from array
    
    if (cards.length > 0) {
      initCards(); // Re-init next card
    } else {
      // No more cards
      cardStack.innerHTML = '<div style="color:white; text-align:center;"><h3>No more food nearby! 😭</h3><button onclick="location.reload()" style="margin-top:10px; padding:10px; border-radius:8px; border:none;">Refresh</button></div>';
    }
  }

  window.swipeCard = function(direction) {
    if (cards.length === 0) return;
    const card = cards[0];
    card.style.transition = 'transform 0.5s ease-out';
    if (direction === 'right') {
      card.style.transform = `translateX(${window.innerWidth}px) rotate(30deg)`;
    } else {
      card.style.transform = `translateX(-${window.innerWidth}px) rotate(-30deg)`;
    }
    setTimeout(() => removeCard(card), 500);
  };

  // Initialize Tinder Cards
  initCards();
  
  // Navigation Logic
  function navigateTo(index) {
    if (index < 0 || index >= totalPages) return;
    
    currentPageIndex = index;
    
    // Slide pages
    pagesContainer.style.transform = `translateX(-${index * 33.333}%)`;
    
    // Update Bottom Nav
    navButtons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Handle Reels Playback
    handleReelsPlayback(index === 1);
  }

  // Click Listeners for Nav
  navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      navigateTo(index);
    });
  });

  // Swipe Logic (Pointer Events for Desktop/Mobile compatibility)
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let isHorizontalDrag = false;

  pager.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
    isHorizontalDrag = false;
    // Don't prevent default yet, we need to know direction
  });

  pager.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Determine direction once
    if (!isHorizontalDrag) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        isHorizontalDrag = true;
        // Disable vertical scroll if horizontal swipe detected
        // e.preventDefault(); // This might be tricky with pointer events, usually touch-action: pan-y handles it in CSS
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        // Vertical scroll, ignore swipe
        isDragging = false;
        return;
      }
    }

    if (isHorizontalDrag) {
      e.preventDefault(); // Stop browser back/forward gestures
      const currentTranslate = -currentPageIndex * 33.333;
      const percentMove = (dx / window.innerWidth) * 33.333;
      pagesContainer.style.transition = 'none';
      pagesContainer.style.transform = `translateX(${currentTranslate + percentMove}%)`;
    }
  });

  const endDrag = (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    if (isHorizontalDrag) {
      const dx = e.clientX - startX;
      const threshold = window.innerWidth * 0.2; // 20% swipe to change

      pagesContainer.style.transition = 'transform 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000)';

      if (dx < -threshold && currentPageIndex < totalPages - 1) {
        navigateTo(currentPageIndex + 1);
      } else if (dx > threshold && currentPageIndex > 0) {
        navigateTo(currentPageIndex - 1);
      } else {
        navigateTo(currentPageIndex); // Snap back
      }
    }
    isHorizontalDrag = false;
  };

  pager.addEventListener('pointerup', endDrag);
  pager.addEventListener('pointercancel', endDrag);
  pager.addEventListener('pointerleave', endDrag);

  // Reels Logic
  const reelsContainer = document.getElementById('reels-container');
  const videos = document.querySelectorAll('.reel-video');

  function handleReelsPlayback(isActive) {
    if (!isActive) {
      videos.forEach(v => v.pause());
      return;
    }
    
    // Play the visible reel
    checkVisibleReel();
  }

  function checkVisibleReel() {
    // Simple intersection check or center check
    // Since we use scroll-snap, one is usually dominant
    // Let's use IntersectionObserver for robustness
  }

  const observer = new IntersectionObserver((entries) => {
    // Only play if we are on the reels page
    if (currentPageIndex !== 1) return;

    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (!video) return;

      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        video.play().catch(e => console.log("Autoplay prevented", e));
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.6 });

  document.querySelectorAll('.reel-item').forEach(item => {
    observer.observe(item);
  });

  // Profile Tabs Logic
  const profileTabs = document.querySelectorAll('.profile-tabs .tab-btn');
  profileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      profileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Initialize
  navigateTo(0);
});
