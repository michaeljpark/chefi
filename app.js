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
  let currentPageIndex = 0; // 0: Feed, 1: Reels, 2: Profile, 3: Journey
  const totalPages = 4;

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

  // --- FEED LOGIC (Vertical Scroll) ---
  // No complex JS needed for CSS Scroll Snap
  
  // Navigation Logic
  function navigateTo(index) {
    if (index < 0 || index >= totalPages) return;
    
    currentPageIndex = index;
    
    // Slide pages
    pagesContainer.style.transform = `translateX(-${index * 25}%)`;

    // Hide FAB on Daily Recap (Journey Page - Index 3)
    const fabBtn = document.getElementById('fabBtn');
    if (fabBtn) {
      if (index === 3) {
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
