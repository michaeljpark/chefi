document.addEventListener('DOMContentLoaded', () => {
  const pagesContainer = document.getElementById('pages');
  const navButtons = document.querySelectorAll('.nav-btn');
  const pager = document.getElementById('pager');
  
  // --- MODAL LOGIC ---
  const reviewModalOverlay = document.getElementById('reviewModalOverlay');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnThankYou = document.getElementById('btnThankYou');
  const btnRemix = document.getElementById('btnRemix');
  let activeCardForModal = null; // Track which card opened the modal

  const closeReviewModal = () => {
      if (reviewModalOverlay) reviewModalOverlay.classList.add('hidden');
      
      // Auto-flip back the card
      if (activeCardForModal) {
          activeCardForModal.classList.remove('flipped');
          activeCardForModal = null;
      }
  };

  const openReviewModal = (card) => {
      activeCardForModal = card;
      if (reviewModalOverlay) reviewModalOverlay.classList.remove('hidden');
  };

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeReviewModal);
  if (btnThankYou) btnThankYou.addEventListener('click', closeReviewModal);
  if (btnRemix) btnRemix.addEventListener('click', () => {
      // Mockup action
      closeReviewModal();
  });
  if (reviewModalOverlay) {
      reviewModalOverlay.addEventListener('click', (e) => {
          if (e.target === reviewModalOverlay) closeReviewModal();
      });
  }

  // --- STAR RATING LOGIC ---
  const starContainer = document.getElementById('starRating');
  if (starContainer) {
    const stars = starContainer.querySelectorAll('.star-btn');
    let currentRating = 0;

    stars.forEach(star => {
      // Hover effect
      star.addEventListener('mouseenter', () => {
        const value = parseInt(star.dataset.value);
        stars.forEach(s => {
          if (parseInt(s.dataset.value) <= value) {
            s.classList.add('hover');
          } else {
            s.classList.remove('hover');
          }
        });
      });

      // Click effect
      star.addEventListener('click', () => {
        currentRating = parseInt(star.dataset.value);
        stars.forEach(s => {
          if (parseInt(s.dataset.value) <= currentRating) {
            s.classList.add('active');
          } else {
            s.classList.remove('active');
          }
        });
      });
    });

    // Reset hover on mouse leave
    starContainer.addEventListener('mouseleave', () => {
      stars.forEach(s => {
        s.classList.remove('hover');
      });
    });
  }

  // State
  let currentPageIndex = 0; // 0: Feed, 1: Reels, 2: Profile, 3: Journey, 4: Journal Entry
  const totalPages = 5;

  // --- ONBOARDING LOGIC ---
  window.nextStep = function(step) {
    document.querySelectorAll('.onboarding-step').forEach(el => el.classList.remove('active'));
    const nextEl = document.getElementById(`step-${step}`);
    if (nextEl) nextEl.classList.add('active');

    // Update indicators
    document.querySelectorAll('.indicator').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.step == step) {
        el.classList.add('active');
      }
    });
  };

  window.skipOnboarding = function() {
    document.getElementById('onboarding').classList.add('hidden');
  };

  window.finishOnboarding = function() {
    document.getElementById('onboarding').classList.add('hidden');
    // Force update nav state to ensure labels are visible
    navigateTo(currentPageIndex);
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

  // --- FEED LOGIC (Vertical Scroll) ---
  // No complex JS needed for CSS Scroll Snap
  
  // Navigation Logic
  function navigateTo(index) {
    if (index < 0 || index >= totalPages) return;
    
    currentPageIndex = index;
    
    // Slide pages
    pagesContainer.style.transform = `translateX(-${index * 20}%)`;

    // Hide FAB on Daily Recap (Journey Page - Index 3) or Journal Entry (Index 4)
    const fabBtn = document.getElementById('fabBtn');
    if (fabBtn) {
      if (index === 3 || index === 4) {
        fabBtn.style.display = 'none';
      } else {
        fabBtn.style.display = 'flex';
      }
    }
    
    // Update Bottom Nav
    navButtons.forEach((btn, i) => {
      // Special handling for Journey Mode (Index 3)
      // When on Journey page, the Profile button (Index 2) should be active but in 'journey-mode'
      if (index === 3) {
        if (i === 2) {
          btn.classList.add('active');
          btn.classList.add('journey-mode');
        } else {
          btn.classList.remove('active');
          btn.classList.remove('journey-mode');
        }
      } else if (index === 4) {
         // Keep Profile active for Journal Entry too, or maybe no nav active?
         // Let's keep Profile active as it's part of the journal flow
         if (i === 2) {
          btn.classList.add('active');
          btn.classList.add('journey-mode');
        } else {
          btn.classList.remove('active');
          btn.classList.remove('journey-mode');
        }
      } else {
        // Normal behavior
        btn.classList.remove('journey-mode'); // Ensure journey mode is off
        if (i === index) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });

    // Handle Reels Playback
    handleReelsPlayback(index === 1);
  }

  // Click Listeners for Nav
  navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      // Special toggle for Profile/Journey (Index 2)
      if (index === 2) {
        if (currentPageIndex === 2) {
          navigateTo(3); // Toggle to Journey
        } else {
          navigateTo(2); // Go to Profile (or back from Journey)
        }
      } else {
        navigateTo(index);
      }
    });
  });

  // Check My Food Journey Button
  const btnCheckJourney = document.querySelector('.btn-check-journey');
  if (btnCheckJourney) {
    btnCheckJourney.addEventListener('click', () => {
      navigateTo(3);
    });
  }

  // Swipe Logic (Pointer Events for Desktop/Mobile compatibility)
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isDragging = false;
  let isHorizontalDrag = false;
  let currentPointerId = null;

  pager.addEventListener('pointerdown', (e) => {
    if (isDragging) return;
    
    startX = e.clientX;
    startY = e.clientY;
    startTime = Date.now();
    isDragging = true;
    isHorizontalDrag = false;
    currentPointerId = e.pointerId;
    try {
      pager.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
    }
    // Don't prevent default yet, we need to know direction
  });

  pager.addEventListener('pointermove', (e) => {
    if (!isDragging || e.pointerId !== currentPointerId) return;

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
        currentPointerId = null;
        try { pager.releasePointerCapture(e.pointerId); } catch(err) {}
        return;
      }
    }

    if (isHorizontalDrag) {
      e.preventDefault(); // Stop browser back/forward gestures
      const currentTranslate = -currentPageIndex * 20;
      const percentMove = (dx / window.innerWidth) * 20;
      pagesContainer.style.transition = 'none';
      pagesContainer.style.transform = `translateX(${currentTranslate + percentMove}%)`;
    }
  });

  const endDrag = (e) => {
    if (!isDragging || e.pointerId !== currentPointerId) return;
    isDragging = false;
    currentPointerId = null;
    try { pager.releasePointerCapture(e.pointerId); } catch(err) {}
    
    if (isHorizontalDrag) {
      const dx = e.clientX - startX;
      const dt = Date.now() - startTime;
      const velocity = Math.abs(dx) / dt;
      const threshold = window.innerWidth * 0.2; // 20% swipe to change

      pagesContainer.style.transition = 'transform 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000)';

      if ((dx < -threshold || (dx < -30 && velocity > 0.3)) && currentPageIndex < totalPages - 1) {
        navigateTo(currentPageIndex + 1);
      } else if ((dx > threshold || (dx > 30 && velocity > 0.3)) && currentPageIndex > 0) {
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
    // Find the reel item that is most visible
    let maxRatio = 0;
    let visibleVideo = null;

    document.querySelectorAll('.reel-item').forEach(item => {
      const rect = item.getBoundingClientRect();
      const video = item.querySelector('video');
      if (!video) return;

      // Calculate intersection ratio manually
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = Math.max(0, visibleHeight / rect.height);

      if (ratio > 0.6 && ratio > maxRatio) {
        maxRatio = ratio;
        visibleVideo = video;
      } else {
        video.pause();
      }
    });

    if (visibleVideo) {
      visibleVideo.play().catch(e => console.log("Autoplay prevented", e));
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (!video) return;

      // Force pause if not on reels page
      if (currentPageIndex !== 1) {
        video.pause();
        return;
      }

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

  // --- FLIP CARD & TIMER LOGIC ---
  document.querySelectorAll('.food-card').forEach(card => {
    // 1. Card Flip
    card.addEventListener('click', (e) => {
      const isFlipped = card.classList.contains('flipped');

      // Case 1: Clicking the "Back" button on the back of the card
      if (e.target.closest('.btn-flip-back')) {
          card.classList.remove('flipped');
          e.stopPropagation();
          return;
      }

      // Case 2: Clicking any other interactive element (buttons, tags, panels)
      if (e.target.closest('button') || 
          e.target.closest('.ingredient-tag') || 
          e.target.closest('.timer-control-panel') || 
          e.target.closest('.step-nav-panel')) {
          return;
      }

      // Case 3: Clicking on the card background
      if (!isFlipped) {
          // If showing front, flip to back
          card.classList.add('flipped');
      }
      // If showing back, DO NOTHING (User must use the Back button)
    });

    // State for this card
    let currentStep = 0;
    const steps = card.querySelectorAll('.step-item');
    const totalSteps = steps.length;
    const stepIndicator = card.querySelector('.step-indicator');
    const timerDisplay = card.querySelector('.timer-display');
    const btnTimerToggle = card.querySelector('.btn-timer-toggle');
    let timerInterval = null;
    let isTimerRunning = false;
    let timeRemaining = 0; // in seconds

    // Helper: Parse time string "MM:SS" to seconds
    const parseTime = (str) => {
      if (!str) return 0;
      const [m, s] = str.split(':').map(Number);
      return m * 60 + s;
    };

    // Helper: Format seconds to "MM:SS"
    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    // Initialize timer from HTML
    if (timerDisplay) {
        timeRemaining = parseTime(timerDisplay.textContent);
    }

    // Navigation Buttons
    const btnPrev = card.querySelector('.btn-step.prev');
    const btnNext = card.querySelector('.btn-step.next');

    // Update Step UI
    const updateStepUI = () => {
      steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < currentStep) {
          step.classList.add('completed');
        } else if (index === currentStep) {
          step.classList.add('active');
        }
      });
      if (stepIndicator) {
        stepIndicator.textContent = `Step ${currentStep + 1}/${totalSteps}`;
      }

      // Handle Last Step Button
      if (btnNext) {
        if (currentStep === totalSteps - 1) {
          btnNext.textContent = "Bon Appétit!";
          btnNext.classList.add('finish');
        } else {
          btnNext.textContent = "Next";
          btnNext.classList.remove('finish');
        }
      }
    };

    // Randomize Timer (5-60 mins)
    const randomizeTimer = () => {
        // Random multiple of 5 between 5 and 60
        const minutes = (Math.floor(Math.random() * 12) + 1) * 5; 
        timeRemaining = minutes * 60;
        if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
        
        // Reset timer state if running
        if (isTimerRunning) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            if (btnTimerToggle) {
                btnTimerToggle.textContent = 'Start';
                btnTimerToggle.classList.remove('running');
            }
        }
    };

    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop bubbling to card
        if (currentStep > 0) {
          currentStep--;
          updateStepUI();
          randomizeTimer(); // Randomize timer on step change
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop bubbling to card
        
        // If it's the last step (Bon Appétit button)
        if (currentStep === totalSteps - 1) {
            openReviewModal(card); // Pass the card reference
            return;
        }

        if (currentStep < totalSteps - 1) {
          currentStep++;
          updateStepUI();
          randomizeTimer(); // Randomize timer on step change
        }
      });
    }

    // Timer Adjustment Buttons
    const btnMinus = card.querySelector('.btn-adjust.minus');
    const btnPlus = card.querySelector('.btn-adjust.plus');

    if (btnMinus) {
      btnMinus.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop bubbling to card
        if (timeRemaining >= 300) { 
             timeRemaining = Math.max(0, timeRemaining - 300);
             if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
        }
      });
    }

    if (btnPlus) {
      btnPlus.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop bubbling to card
        timeRemaining += 300; // Add 5 mins
        if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
      });
    }

    // Timer Toggle Button
    if (btnTimerToggle) {
      btnTimerToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop bubbling to card
        if (isTimerRunning) {
          // Stop
          clearInterval(timerInterval);
          isTimerRunning = false;
          btnTimerToggle.textContent = 'Start';
          btnTimerToggle.classList.remove('running');
        } else {
          // Start
          if (timeRemaining <= 0) return;
          isTimerRunning = true;
          btnTimerToggle.textContent = 'Pause';
          btnTimerToggle.classList.add('running');
          
          timerInterval = setInterval(() => {
            if (timeRemaining > 0) {
              timeRemaining--;
              if (timerDisplay) timerDisplay.textContent = formatTime(timeRemaining);
            } else {
              clearInterval(timerInterval);
              isTimerRunning = false;
              btnTimerToggle.textContent = 'Done';
              btnTimerToggle.classList.remove('running');
            }
          }, 1000);
        }
      });
    }
    
    // Initial UI setup
    updateStepUI();
  });

  // --- FRIDGE FRESHNESS LOGIC ---
  const fridgeVal = document.getElementById('fridgeFreshness');
  const fridgeContainer = document.querySelector('.fridge-image-container');

  if (fridgeVal) {
    let freshness = 82.5;
    fridgeVal.textContent = freshness.toFixed(1);
    setInterval(() => {
      freshness -= 0.1;
      if (freshness < 0) freshness = 0;
      fridgeVal.textContent = freshness.toFixed(1);
    }, 5000);
  }

  // --- JOURNEY DASHBOARD TOGGLE ---
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const journeyTitle = document.querySelector('.journey-title-group h2');
  const calorieVal = document.querySelector('.calorie-display .big-number');
  const calorieSub = document.querySelector('.calorie-card .sub-text');
  const sugarVal = document.querySelector('.nutrient-split-card .n-val.warning');
  const sodiumVal = document.querySelector('.nutrient-split-card .n-val.good');

  if (toggleBtns.length > 0) {
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Remove active from all
        toggleBtns.forEach(b => b.classList.remove('active'));
        // Add active to clicked
        btn.classList.add('active');

        const mode = btn.textContent.trim();
        if (mode === 'Weekly') {
          if (journeyTitle) journeyTitle.textContent = 'Weekly Recap';
          if (calorieVal) calorieVal.textContent = '13,450'; // Total weekly
          if (calorieSub) calorieSub.textContent = 'Avg 1,921 kcal / day';
          if (sugarVal) { sugarVal.textContent = '210g'; sugarVal.nextElementSibling.textContent = 'Avg 30g'; }
          if (sodiumVal) { sodiumVal.textContent = '9.5g'; sodiumVal.nextElementSibling.textContent = 'Avg 1.3g'; }
        } else {
          if (journeyTitle) journeyTitle.textContent = 'Daily Recap';
          if (calorieVal) calorieVal.textContent = '1,850';
          if (calorieSub) calorieSub.textContent = '240 kcal remaining';
          if (sugarVal) { sugarVal.textContent = '32g'; sugarVal.nextElementSibling.textContent = 'High'; }
          if (sodiumVal) { sodiumVal.textContent = '1.2g'; sodiumVal.nextElementSibling.textContent = 'Good'; }
        }
      });
    });
  }

  // --- AI CAMERA & FAB LOGIC ---
  const btnIdentify = document.getElementById('btnIdentify');
  const btnCameraCapture = document.getElementById('btnCameraCapture');
  const fileInput = document.getElementById('fileInput');
  const aiResult = document.getElementById('aiResult');
  const aiLoading = document.getElementById('aiLoading');
  const aiContent = document.getElementById('aiContent');
  const cameraViewport = document.getElementById('cameraViewport');
  const cameraFeed = document.getElementById('cameraFeed');
  const capturedImage = document.getElementById('capturedImage');
  const btnCameraToggle = document.getElementById('btnCameraToggle');
  const fabBtn = document.getElementById('fabBtn');
  
  let stream = null;
  let isCameraActive = false;
  const API_KEY = 'YOUR_GEMINI_API_KEY'; 

  // FAB Toggle
  if (fabBtn) {
    fabBtn.addEventListener('click', () => {
      fabBtn.classList.toggle('active');
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.classList.toggle('hidden');
      }
      
      // Toggle Journal Overlay
      const journalOverlay = document.getElementById('journalOverlay');
      if (journalOverlay) {
        journalOverlay.classList.toggle('visible');
      }
    });
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (cameraFeed) {
        cameraFeed.srcObject = stream;
        cameraFeed.style.display = 'block';
      }
      isCameraActive = true;
      if (btnCameraToggle) btnCameraToggle.classList.add('active');
      if (capturedImage) capturedImage.style.display = 'none';
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera');
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (cameraFeed) cameraFeed.srcObject = null;
    isCameraActive = false;
    if (btnCameraToggle) btnCameraToggle.classList.remove('active');
  }

  if (btnCameraToggle) {
    btnCameraToggle.addEventListener('click', () => {
      if (isCameraActive) {
        stopCamera();
      } else {
        startCamera();
        if (capturedImage) capturedImage.style.display = 'none';
        if (cameraFeed) cameraFeed.style.display = 'block';
        if (aiResult) aiResult.classList.add('hidden');
      }
    });
  }

  // Capture Button (White)
  if (btnCameraCapture) {
    btnCameraCapture.addEventListener('click', () => {
      if (isCameraActive && cameraFeed && cameraFeed.readyState === 4) {
        const canvas = document.createElement('canvas');
        canvas.width = cameraFeed.videoWidth;
        canvas.height = cameraFeed.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraFeed, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (capturedImage) {
          capturedImage.src = imageData;
          capturedImage.style.display = 'block';
        }
        cameraFeed.style.display = 'none';
        stopCamera();
      }
    });
  }

  // Identify Button (Red)
  if (btnIdentify) {
    btnIdentify.addEventListener('click', async () => {
      let imageData = null;

      if (isCameraActive && cameraFeed && cameraFeed.readyState === 4) {
        const canvas = document.createElement('canvas');
        canvas.width = cameraFeed.videoWidth;
        canvas.height = cameraFeed.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(cameraFeed, 0, 0);
        imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        if (capturedImage) {
          capturedImage.src = imageData;
          capturedImage.style.display = 'block';
        }
        cameraFeed.style.display = 'none';
        stopCamera();
      } else if (capturedImage && capturedImage.src && capturedImage.style.display !== 'none') {
        imageData = capturedImage.src;
      } else {
        alert('Please start camera or upload an image first');
        return;
      }

      analyzeImage(imageData);
    });
  }

  // File Upload
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result;
          if (capturedImage) {
            capturedImage.src = imageData;
            capturedImage.style.display = 'block';
          }
          if (cameraFeed) cameraFeed.style.display = 'none';
          stopCamera();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  async function analyzeImage(base64Data) {
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') {
      alert('Please set your Gemini API Key in app.js');
      return;
    }

    if (aiResult) aiResult.classList.remove('hidden');
    if (aiLoading) aiLoading.classList.remove('hidden');
    if (aiContent) aiContent.innerHTML = '';
    if (cameraViewport) cameraViewport.classList.add('scanning');

    try {
      const base64Image = base64Data.split(',')[1];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Identify this food. Return a short title, estimated calories, and 3 key ingredients. Format: <strong>Title</strong><br>Calories: ...<br>Ingredients: ...' },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
            ]
          }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.candidates[0].content.parts[0].text;
      if (aiContent) aiContent.innerHTML = text;

    } catch (err) {
      console.error('AI Error:', err);
      if (aiContent) aiContent.innerHTML = 'Failed to identify food. Please try again.';
    } finally {
      if (aiLoading) aiLoading.classList.add('hidden');
      if (cameraViewport) cameraViewport.classList.remove('scanning');
    }
  }

  // --- JOURNAL ONBOARDING LOGIC ---
  const btnJournalStart = document.getElementById('btnJournalStart');
  const journalTextGroup = document.querySelector('.journal-text-group');
  const journalCameraBox = document.getElementById('journalCameraBox');
  const btnJournalCameraEnable = document.getElementById('btnJournalCameraEnable');
  const btnJournalCapture = document.getElementById('btnJournalCapture');
  const journalCameraFeed = document.getElementById('journalCameraFeed');
  const journalCapturedImg = document.getElementById('journalCapturedImg');
  const cameraStatusText = document.getElementById('cameraStatusText');
  const btnJournalUpload = document.getElementById('btnJournalUpload');
  const journalFileInput = document.getElementById('journalFileInput');
  
  let journalStream = null;
  let journalDraft = null; // { image: base64 }

  async function animateTextChange(element, newText) {
    let currentText = element.innerText;
    // Backspace effect
    while (currentText.length > 0) {
      currentText = currentText.slice(0, -1);
      element.innerText = currentText;
      await new Promise(r => setTimeout(r, 30)); // Speed of backspace
    }
    // Typing effect
    for (let i = 0; i < newText.length; i++) {
      element.innerText += newText[i];
      await new Promise(r => setTimeout(r, 50)); // Speed of typing
    }
  }

  function setJournalPhotoState(hasPhoto) {
    if (hasPhoto) {
      btnJournalStart.classList.add('has-photo');
    } else {
      btnJournalStart.classList.remove('has-photo');
    }
  }

  // FAB Toggle Logic Update
  if (fabBtn) {
    // Remove old listener to avoid duplicates if re-run (though in this context it's fine)
    // We need to replace the previous logic completely.
    // Since I can't easily remove anonymous listeners, I'll assume this block replaces the previous one in the file.
    // But wait, I'm editing the file. I should replace the FAB logic block earlier in the file or just update the logic here if I can access it.
    // The FAB logic is at line 570. I am editing lines 740+.
    // I will add a new function `toggleJournalOverlay` and call it from the FAB listener.
    // But I can't change the FAB listener easily from here without reading that part again.
    // Let's just handle the "Close" logic here by listening to the overlay click or re-implementing the FAB click if possible.
    // Actually, the user asked for "x or margin" to close.
    // I'll add a listener to the overlay background.
  }
  
  const journalOverlay = document.getElementById('journalOverlay');
  // Background click close removed as per request


  // We need to hook into the FAB click to handle Draft Logic.
  // Since I cannot easily modify the existing FAB listener which is far above, 
  // I will add a MutationObserver to watch for visibility changes on the overlay?
  // Or just add another click listener to FAB that runs AFTER the toggle.
  
  fabBtn.addEventListener('click', () => {
    const isClosing = !fabBtn.classList.contains('active'); // It was just toggled, so if it's NOT active now, it means we just closed it.
    // Wait, the previous listener toggles 'active'.
    // If I add this listener, it runs after.
    // If 'active' is present, we just opened it. If not, we closed it.
    
    if (fabBtn.classList.contains('active')) {
      // OPENING
      if (journalDraft && journalDraft.image) {
        // Restore Draft
        if (journalCapturedImg) {
          journalCapturedImg.src = journalDraft.image;
          journalCapturedImg.style.display = 'block';
        }
        if (journalTextGroup) journalTextGroup.classList.add('slide-out');
        btnJournalStart.classList.add('camera-mode');
        btnJournalStart.innerText = "Analysis";
        setJournalPhotoState(true);
        if (journalCameraBox) journalCameraBox.classList.add('active');
        if (cameraStatusText) cameraStatusText.classList.add('visible');
      } else {
        // Reset / Start Fresh
        // The CSS transitions might need a reset if we just closed it.
        // But usually "Start Fresh" means showing the "Hey there" text.
        // The default HTML state is "Hey there".
        // We just need to ensure classes are removed.
        if (journalTextGroup) journalTextGroup.classList.remove('slide-out');
        btnJournalStart.classList.remove('camera-mode');
        btnJournalStart.innerText = "Let's start!";
        setJournalPhotoState(false);
        if (journalCameraBox) journalCameraBox.classList.remove('active');
        if (cameraStatusText) cameraStatusText.classList.remove('visible');
        if (journalCapturedImg) {
            journalCapturedImg.style.display = 'none';
            journalCapturedImg.src = '';
        }
      }
    } else {
      // CLOSING
      // Save Draft if image exists
      if (journalCapturedImg && journalCapturedImg.style.display === 'block' && journalCapturedImg.src) {
        journalDraft = { image: journalCapturedImg.src };
      } else {
        journalDraft = null;
      }
      
      // Stop Camera if running
      if (journalStream) {
        journalStream.getTracks().forEach(track => track.stop());
        journalStream = null;
        if (btnJournalCameraEnable) btnJournalCameraEnable.classList.remove('active');
        if (btnJournalCapture) btnJournalCapture.style.display = 'none';
      }
    }
  });


  if (btnJournalStart) {
    btnJournalStart.addEventListener('click', () => {
      // Check if it's in Analysis mode
      if (btnJournalStart.innerText === "Analysis") {
          // 1. Slide out button (Left)
          btnJournalStart.classList.add('slide-out-left');
          
          // 2. Slide out "Let's see..." (Right)
          const cameraStatusText = document.getElementById('cameraStatusText');
          if (cameraStatusText) cameraStatusText.classList.add('slide-out-right');

          // Hide "Or upload" text
          const btnJournalUpload = document.getElementById('btnJournalUpload');
          if (btnJournalUpload) btnJournalUpload.classList.add('slide-out-right');

          // Hide Red Ring (Camera Enable Button)
          const btnJournalCameraEnable = document.getElementById('btnJournalCameraEnable');
          if (btnJournalCameraEnable) btnJournalCameraEnable.classList.add('hidden');
          
          // 3. Show "This is..."
          const analysisPrompt = document.getElementById('analysisPrompt');
          if (analysisPrompt) {
              analysisPrompt.classList.remove('hidden');
              setTimeout(() => analysisPrompt.classList.add('visible'), 50);
          }
          
          // 4. Show Input
          const analysisInput = document.getElementById('analysisInput');
          if (analysisInput) {
              analysisInput.classList.remove('hidden');
              setTimeout(() => {
                  analysisInput.classList.add('visible');
                  analysisInput.focus();
              }, 50);
          }
          return;
      }

      // Slide out text
      if (journalTextGroup) journalTextGroup.classList.add('slide-out');
      
      // Move button down
      btnJournalStart.classList.add('camera-mode');
      
      // Animate text change
      animateTextChange(btnJournalStart, "Analysis");
      
      // Slide in camera box
      if (journalCameraBox) journalCameraBox.classList.add('active');
      
      // Show status text
      if (cameraStatusText) cameraStatusText.classList.add('visible');
    });
  }

  if (btnJournalCameraEnable) {
    btnJournalCameraEnable.addEventListener('click', async () => {
      try {
        journalStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (journalCameraFeed) {
          journalCameraFeed.srcObject = journalStream;
          btnJournalCameraEnable.classList.add('active');
          if (btnJournalCapture) btnJournalCapture.style.display = 'block';
        }
      } catch (err) {
        console.error("Camera Error:", err);
        alert("Could not access camera.");
      }
    });
  }

  if (btnJournalCapture) {
    btnJournalCapture.addEventListener('click', () => {
      if (!journalStream) return;
      
      // Capture logic
      const canvas = document.createElement('canvas');
      canvas.width = journalCameraFeed.videoWidth;
      canvas.height = journalCameraFeed.videoHeight;
      const ctx = canvas.getContext('2d');
      
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(journalCameraFeed, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      if (journalCapturedImg) {
        journalCapturedImg.src = dataUrl;
        journalCapturedImg.style.display = 'block';
      }
      
      setJournalPhotoState(true); // Update button color

      // Stop stream
      journalStream.getTracks().forEach(track => track.stop());
      journalStream = null;
      
      // UI Updates
      btnJournalCameraEnable.classList.remove('active');
      btnJournalCapture.style.display = 'none';
    });
  }
  
  // Upload Logic
  if (btnJournalUpload && journalFileInput) {
    btnJournalUpload.addEventListener('click', () => {
      journalFileInput.click();
    });
    
    journalFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (journalCapturedImg) {
            journalCapturedImg.src = evt.target.result;
            journalCapturedImg.style.display = 'block';
            setJournalPhotoState(true); // Update button color
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Initialize
  navigateTo(0);
});

  // --- Reels Interactions (Event Delegation) ---
  const reelsContainer = document.getElementById('reels-container');
  const commentSheetOverlay = document.getElementById('commentSheetOverlay');
  const shareSheetOverlay = document.getElementById('shareSheetOverlay');

  if (reelsContainer) {
    // Single Click Delegation (Like, Comment, Share)
    reelsContainer.addEventListener('click', (e) => {
      const target = e.target;
      
      // Like Button
      const likeBtn = target.closest('.btn-reel-like');
      if (likeBtn) {
        e.stopPropagation();
        likeBtn.classList.toggle('filled');
        return;
      }

      // Comment Button
      const commentBtn = target.closest('.btn-reel-comment');
      if (commentBtn) {
        e.stopPropagation();
        if (commentSheetOverlay) commentSheetOverlay.classList.add('visible');
        return;
      }

      // Share Button
      const shareBtn = target.closest('.btn-reel-share');
      if (shareBtn) {
        e.stopPropagation();
        if (shareSheetOverlay) shareSheetOverlay.classList.add('visible');
        return;
      }
    });

    // Double Click Delegation (Heart Animation)
    reelsContainer.addEventListener('dblclick', (e) => {
      const reelItem = e.target.closest('.reel-item');
      if (reelItem) {
        const likeBtn = reelItem.querySelector('.btn-reel-like');
        const heartOverlay = reelItem.querySelector('.double-tap-heart');
        
        if (likeBtn && !likeBtn.classList.contains('filled')) {
          likeBtn.classList.add('filled');
        }
        
        if (heartOverlay) {
          heartOverlay.classList.remove('animate');
          void heartOverlay.offsetWidth; // Trigger reflow
          heartOverlay.classList.add('animate');
        }
      }
    });
    
    // Initialize Heart Overlays for existing items
    document.querySelectorAll('.reel-item').forEach(item => {
      if (!item.querySelector('.double-tap-heart')) {
        const heartOverlay = document.createElement('div');
        heartOverlay.className = 'double-tap-heart';
        heartOverlay.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
        item.appendChild(heartOverlay);
      }
    });

    // Infinite Scroll Logic for Reels
    // Capture original items to cycle through
    const originalReels = Array.from(reelsContainer.querySelectorAll('.reel-item'));
    let nextReelIndex = 0;

    reelsContainer.addEventListener('scroll', () => {
      // Check if scrolled to bottom
      if (reelsContainer.scrollTop + reelsContainer.clientHeight >= reelsContainer.scrollHeight - 50) {
        // Clone the next reel in the sequence
        const reelToClone = originalReels[nextReelIndex];
        if (reelToClone) {
          const clone = reelToClone.cloneNode(true);
          reelsContainer.appendChild(clone);
          
          // Update index for next time (cycle 0 to length-1)
          nextReelIndex = (nextReelIndex + 1) % originalReels.length;
        }
      }
    });
  }

  if (commentSheetOverlay) {
    commentSheetOverlay.addEventListener('click', (e) => {
      if (e.target === commentSheetOverlay) {
        commentSheetOverlay.classList.remove('visible');
      }
    });

    // Comment Posting Logic
    const commentInput = document.getElementById('commentInput');
    const btnPostComment = document.getElementById('btnPostComment');
    const commentList = document.getElementById('commentList');

    if (commentInput && btnPostComment && commentList) {
      // Enable/Disable button based on input
      commentInput.addEventListener('input', () => {
        btnPostComment.disabled = commentInput.value.trim() === '';
      });

      // Post Comment Function
      const postComment = () => {
        const text = commentInput.value.trim();
        if (!text) return;

        // Create new comment element
        const newComment = document.createElement('div');
        newComment.className = 'comment-item';
        newComment.innerHTML = `
          <div class="comment-avatar">Me</div>
          <div class="comment-body">
            <div class="comment-user">You <span class="comment-meta">Just now</span></div>
            <div class="comment-text">${text}</div>
          </div>
        `;

        // Append and scroll
        commentList.appendChild(newComment);
        commentList.scrollTop = commentList.scrollHeight;

        // Reset input
        commentInput.value = '';
        btnPostComment.disabled = true;
      };

      btnPostComment.addEventListener('click', postComment);

      commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          postComment();
        }
      });
    }
  }

  if (shareSheetOverlay) {
    shareSheetOverlay.addEventListener('click', (e) => {
      if (e.target === shareSheetOverlay) {
        shareSheetOverlay.classList.remove('visible');
      }
    });
  }


document.addEventListener('DOMContentLoaded', () => {
  // --- Random Food Data ---
  const foodItems = [
    { name: 'Double Cheeseburger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Steak & Fries', image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Grilled Salmon', image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Chicken Breast & Rice', image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Pasta Primavera', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { name: 'Caesar Salad', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
  ];

  // Pick Random Food
  const randomFood = foodItems[Math.floor(Math.random() * foodItems.length)];
  
  // Update UI with Random Food
  const foodNameEl = document.getElementById('latestFoodName');
  const foodImageEl = document.getElementById('latestFoodImage');
  
  if (foodNameEl) foodNameEl.textContent = randomFood.name;
  if (foodImageEl) foodImageEl.style.backgroundImage = `url('${randomFood.image}')`;

  // --- Time & Date Logic ---
  const updateLatestFoodTime = () => {
    const timeEl = document.getElementById('latestFoodTime');
    const dateEl = document.getElementById('latestFoodDate');
    if (!timeEl) return;

    const now = new Date();
    // Subtract 1 hour 20 minutes = 80 minutes
    now.setMinutes(now.getMinutes() - 80);

    // Time
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    timeEl.textContent = `${hours}:${strMinutes} ${ampm}`;

    // Date (e.g. Dec 19)
    if (dateEl) {
      const month = now.toLocaleString('default', { month: 'short' });
      const day = now.getDate();
      dateEl.textContent = `${month} ${day}`;
    }
  };

  updateLatestFoodTime();
  setInterval(updateLatestFoodTime, 60000);

  // --- AI Analysis Logic ---
  const analyzeFood = async () => {
    const prompt = `Analyze nutritional info for '${randomFood.name}'. Return ONLY a JSON object (no markdown, no backticks) with the following keys:
    - description (string: Assume the user has diabetes. Provide a short, friendly 2-sentence feedback on this meal. Suggest eating order (e.g. veggies first) or a quick walk if needed.)
    - calories (number)
    - glucose_risk (string: 'Stable', 'Medium', 'High')
    - carbs_pct (number, e.g. 50)
    - protein_pct (number, e.g. 30)
    - fat_pct (number, e.g. 20)
    - sugar (string, e.g. '12g')
    - sugar_status (string: 'Good', 'Moderate', 'High')
    - sodium (string, e.g. '0.5g')
    - sodium_status (string: 'Good', 'Moderate', 'High')`;

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const text = await response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      // Update Description
      const descEl = document.getElementById('latestFoodDesc');
      if (descEl && data.description) {
        descEl.textContent = data.description;
      }

      // Update Bento Grid
      const calVal = document.getElementById('calVal');
      const calBadge = document.getElementById('calBadge');
      const calProgress = document.getElementById('calProgress');
      const calRemaining = document.getElementById('calRemaining');
      
      if (calVal) {
        calVal.textContent = data.calories;
        const dailyGoal = 2000;
        const remaining = dailyGoal - data.calories;
        calRemaining.textContent = `${remaining > 0 ? remaining : 0} kcal remaining`;
        calProgress.style.width = `${Math.min((data.calories / dailyGoal) * 100, 100)}%`;
        
        if (data.calories > 800) {
            calBadge.textContent = 'Heavy';
            calBadge.className = 'badge-good warning';
            calBadge.style.color = '#FF453A';
            calBadge.style.background = 'rgba(255, 69, 58, 0.2)';
        } else {
            calBadge.textContent = 'Good';
            calBadge.className = 'badge-good';
            calBadge.style.color = '#34C759';
            calBadge.style.background = 'rgba(52, 199, 89, 0.2)';
        }
      }

      // Glucose Pill Logic
      const glucosePillFill = document.getElementById('glucosePillFill');
      const glucosePercentage = document.getElementById('glucosePercentage');
      const glucoseTimer = document.getElementById('glucoseTimer');
      
      if (glucosePillFill && glucosePercentage && glucoseTimer) {
        let startPct = 35;
        if (data.glucose_risk === 'High') startPct = 88;
        else if (data.glucose_risk === 'Medium') startPct = 62;
        
        // Initial State
        glucosePillFill.style.width = `${startPct}%`;
        glucosePercentage.textContent = `${startPct}%`;
        
        // Animation Variables
        let currentPct = startPct;
        let totalSeconds = 45 * 60; // 45 minutes countdown
        
        // Clear existing intervals
        if (window.glucoseAnimInterval) clearInterval(window.glucoseAnimInterval);
        
        window.glucoseAnimInterval = setInterval(() => {
          // Decrease Percentage slowly
          if (currentPct > 15) {
            currentPct -= 0.005; // Extremely slow decrease (10x slower)
            glucosePillFill.style.width = `${currentPct}%`;
            glucosePercentage.textContent = `${Math.floor(currentPct)}%`;
          }
          
          // Decrease Timer
          if (totalSeconds > 0) {
            totalSeconds--;
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            glucoseTimer.textContent = `${m}m ${s < 10 ? '0'+s : s}s left`;
          } else {
            clearInterval(window.glucoseAnimInterval);
          }
        }, 1000); // Update every 1 second instead of 100ms
      }

      const carbsVal = document.getElementById('carbsVal');
      const carbsBar = document.getElementById('carbsBar');
      if (carbsVal) {
        carbsVal.textContent = `${data.carbs_pct}%`;
        carbsBar.style.width = `${data.carbs_pct}%`;
      }

      const proteinVal = document.getElementById('proteinVal');
      const proteinBar = document.getElementById('proteinBar');
      if (proteinVal) {
        proteinVal.textContent = `${data.protein_pct}%`;
        proteinBar.style.width = `${data.protein_pct}%`;
      }

      const fatVal = document.getElementById('fatVal');
      const fatBar = document.getElementById('fatBar');
      if (fatVal) {
        fatVal.textContent = `${data.fat_pct}%`;
        fatBar.style.width = `${data.fat_pct}%`;
      }

      const sugarVal = document.getElementById('sugarVal');
      const sugarStatus = document.getElementById('sugarStatus');
      if (sugarVal) {
        sugarVal.textContent = data.sugar;
        sugarStatus.textContent = data.sugar_status;
        if (data.sugar_status === 'High') {
            sugarVal.className = 'n-val warning';
        } else {
            sugarVal.className = 'n-val good';
        }
      }

      const sodiumVal = document.getElementById('sodiumVal');
      const sodiumStatus = document.getElementById('sodiumStatus');
      if (sodiumVal) {
        sodiumVal.textContent = data.sodium;
        sodiumStatus.textContent = data.sodium_status;
         if (data.sodium_status === 'High') {
            sodiumVal.className = 'n-val warning';
        } else {
            sodiumVal.className = 'n-val good';
        }
      }

    } catch (error) {
      console.error('Error fetching nutritional info:', error);
      const descEl = document.getElementById('latestFoodDesc');
      if (descEl) descEl.textContent = "Could not analyze food data.";
    }
  };

  analyzeFood();
});


  // --- Glucose Notification Logic ---
  const btnGlucoseNotify = document.getElementById('btnGlucoseNotify');
  const notificationToast = document.getElementById('notificationToast');
  let toastTimeout;

  if (btnGlucoseNotify && notificationToast) {
    btnGlucoseNotify.addEventListener('click', () => {
      // Toggle Active State
      const isActive = btnGlucoseNotify.classList.toggle('active');
      
      if (isActive) {
        // Show Toast
        notificationToast.classList.remove('hidden');
        
        // Hide after 2 seconds
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
          notificationToast.classList.add('hidden');
        }, 2000);
      } else {
        // Optional: Show 'Notification disabled' or just do nothing
        notificationToast.classList.add('hidden');
      }
    });
  }


  // --- User Analysis Logic ---
  const resetJournalOverlay = () => {
      const btnJournalStart = document.getElementById('btnJournalStart');
      const cameraStatusText = document.getElementById('cameraStatusText');
      const analysisPrompt = document.getElementById('analysisPrompt');
      const analysisInput = document.getElementById('analysisInput');
      const btnJournalUpload = document.getElementById('btnJournalUpload');
      const btnJournalCameraEnable = document.getElementById('btnJournalCameraEnable');
      const btnWriteJournal = document.getElementById('btnWriteJournal');
      
      if(btnJournalStart) {
          btnJournalStart.classList.remove('slide-out-left', 'camera-mode');
          btnJournalStart.innerText = "Let's start!";
          btnJournalStart.style.opacity = '';
          btnJournalStart.style.pointerEvents = '';
      }
      if(cameraStatusText) cameraStatusText.classList.remove('slide-out-right');
      if(btnJournalCameraEnable) btnJournalCameraEnable.classList.remove('hidden');
      if(analysisPrompt) {
          analysisPrompt.classList.remove('visible');
          analysisPrompt.classList.add('hidden');
      }
      if(analysisInput) {
          analysisInput.classList.remove('visible');
          analysisInput.classList.add('hidden');
          analysisInput.value = '';
          analysisInput.disabled = false;
      }
      if(btnJournalUpload) btnJournalUpload.classList.remove('slide-out-right');
      if(btnWriteJournal) {
          btnWriteJournal.classList.remove('visible');
          btnWriteJournal.classList.add('hidden');
      }
  };

  const analyzeUserFood = async (foodName) => {
    const prompt = `Analyze nutritional info for '${foodName}'. Return ONLY a JSON object (no markdown, no backticks) with the following keys:
    - description (string: Assume the user has diabetes. Provide a short, friendly 2-sentence feedback on this meal IN ENGLISH. Suggest eating order (e.g. veggies first) or a quick walk if needed.)
    - calories (number)
    - glucose_risk (string: 'Stable', 'Medium', 'High')
    - carbs_pct (number, e.g. 50)
    - protein_pct (number, e.g. 30)
    - fat_pct (number, e.g. 20)
    - sugar (string, e.g. '12g')
    - sugar_status (string: 'Good', 'Moderate', 'High')
    - sodium (string, e.g. '0.5g')
    - sodium_status (string: 'Good', 'Moderate', 'High')
    - ingredients (array of strings)`;

    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const response = await fetch(`https://text.pollinations.ai/${encodedPrompt}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const text = await response.text();
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(jsonStr);

      // Update Description
      const descEl = document.getElementById('latestFoodDesc');
      if (descEl && data.description) {
        descEl.textContent = data.description;
      }

      // Update Bento Grid
      const calVal = document.getElementById('calVal');
      const calBadge = document.getElementById('calBadge');
      const calProgress = document.getElementById('calProgress');
      const calRemaining = document.getElementById('calRemaining');
      
      if (calVal) {
        calVal.textContent = data.calories;
        const dailyGoal = 2000;
        const remaining = dailyGoal - data.calories;
        calRemaining.textContent = `${remaining > 0 ? remaining : 0} kcal remaining`;
        calProgress.style.width = `${Math.min((data.calories / dailyGoal) * 100, 100)}%`;
        
        if (data.calories > 800) {
            calBadge.textContent = 'Heavy';
            calBadge.className = 'badge-good warning';
            calBadge.style.color = '#FF453A';
            calBadge.style.background = 'rgba(255, 69, 58, 0.2)';
        } else {
            calBadge.textContent = 'Good';
            calBadge.className = 'badge-good';
            calBadge.style.color = '#34C759';
            calBadge.style.background = 'rgba(52, 199, 89, 0.2)';
        }
      }

      // Glucose Pill Logic
      const glucosePillFill = document.getElementById('glucosePillFill');
      const glucosePercentage = document.getElementById('glucosePercentage');
      const glucoseTimer = document.getElementById('glucoseTimer');
      
      if (glucosePillFill && glucosePercentage && glucoseTimer) {
        let startPct = 35;
        if (data.glucose_risk === 'High') startPct = 88;
        else if (data.glucose_risk === 'Medium') startPct = 62;
        
        // Initial State
        glucosePillFill.style.width = `${startPct}%`;
        glucosePercentage.textContent = `${startPct}%`;
        
        // Animation Variables
        let currentPct = startPct;
        let totalSeconds = 45 * 60; // 45 minutes countdown
        
        // Clear existing intervals
        if (window.glucoseAnimInterval) clearInterval(window.glucoseAnimInterval);
        
        window.glucoseAnimInterval = setInterval(() => {
          // Decrease Percentage slowly
          if (currentPct > 15) {
            currentPct -= 0.005; // Extremely slow decrease (10x slower)
            glucosePillFill.style.width = `${currentPct}%`;
            glucosePercentage.textContent = `${Math.floor(currentPct)}%`;
          }
          
          // Decrease Timer
          if (totalSeconds > 0) {
            totalSeconds--;
            const m = Math.floor(totalSeconds / 60);
            const s = totalSeconds % 60;
            glucoseTimer.textContent = `${m}m ${s < 10 ? '0'+s : s}s left`;
          } else {
            clearInterval(window.glucoseAnimInterval);
          }
        }, 1000); // Update every 1 second instead of 100ms
      }

      const carbsVal = document.getElementById('carbsVal');
      const carbsBar = document.getElementById('carbsBar');
      if (carbsVal) {
        carbsVal.textContent = `${data.carbs_pct}%`;
        carbsBar.style.width = `${data.carbs_pct}%`;
      }

      const proteinVal = document.getElementById('proteinVal');
      const proteinBar = document.getElementById('proteinBar');
      if (proteinVal) {
        proteinVal.textContent = `${data.protein_pct}%`;
        proteinBar.style.width = `${data.protein_pct}%`;
      }

      const fatVal = document.getElementById('fatVal');
      const fatBar = document.getElementById('fatBar');
      if (fatVal) {
        fatVal.textContent = `${data.fat_pct}%`;
        fatBar.style.width = `${data.fat_pct}%`;
      }

      const sugarVal = document.getElementById('sugarVal');
      const sugarStatus = document.getElementById('sugarStatus');
      if (sugarVal) {
        sugarVal.textContent = data.sugar;
        sugarStatus.textContent = data.sugar_status;
        if (data.sugar_status === 'High') {
            sugarVal.className = 'n-val warning';
        } else {
            sugarVal.className = 'n-val good';
        }
      }

      const sodiumVal = document.getElementById('sodiumVal');
      const sodiumStatus = document.getElementById('sodiumStatus');
      if (sodiumVal) {
        sodiumVal.textContent = data.sodium;
        sodiumStatus.textContent = data.sodium_status;
         if (data.sodium_status === 'High') {
            sodiumVal.className = 'n-val warning';
        } else {
            sodiumVal.className = 'n-val good';
        }
      }

      // Show Analysis Result Text
      const analysisTextDisplay = document.getElementById('analysisTextDisplay');
      if (analysisTextDisplay) {
          analysisTextDisplay.innerHTML = `
            ${data.description}<br><br>
            <span style="font-size: 14px; color: #666;">
            Estimated Calories: <strong>${data.calories} kcal</strong><br>
            Estimated Sugar: <strong>${data.sugar}</strong>
            </span>
          `;
          analysisTextDisplay.classList.remove('hidden');
          setTimeout(() => {
              analysisTextDisplay.classList.add('visible');
          }, 50);
      }

      // Show Write Journal Button
      const btnWriteJournal = document.getElementById('btnWriteJournal');
      if (btnWriteJournal) {
          btnWriteJournal.classList.remove('hidden');
          setTimeout(() => btnWriteJournal.classList.add('visible'), 100);
      }

    } catch (error) {
      console.error('Error fetching nutritional info:', error);
      alert("Could not analyze food data. Please try again.");
      const analysisInput = document.getElementById('analysisInput');
      if(analysisInput) analysisInput.disabled = false;
    }
  };

  const analysisInput = document.getElementById('analysisInput');
  if (analysisInput) {
      analysisInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              const val = analysisInput.value.trim();
              if (val) {
                  // Do not disable input so user can edit
                  // analysisInput.disabled = true; 
                  analyzeUserFood(val);
              }
          }
      });
  }

  const btnWriteJournal = document.getElementById('btnWriteJournal');
  if (btnWriteJournal) {
      btnWriteJournal.addEventListener('click', () => {
          // document.getElementById('journalOverlay').classList.remove('active');
          // resetJournalOverlay();
          // navigateTo(4);
      });
  }

  // --- Update Recap Date ---
  const recapDateEl = document.getElementById('recapDate');
  if (recapDateEl) {
    const now = new Date();
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    recapDateEl.textContent = now.toLocaleDateString('en-US', options);
  }

