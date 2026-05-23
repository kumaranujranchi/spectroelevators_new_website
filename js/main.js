// Interactivity and Interlock Logic for Spectro Elevators
document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header Control
  const header = document.getElementById('main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('shadow-xl', 'py-3');
        header.classList.remove('py-5');
      } else {
        header.classList.remove('shadow-xl', 'py-3');
        header.classList.add('py-5');
      }
    });
  }

  // 2. Mobile Drawer Menu Control
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeMenuBtn = document.getElementById('close-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full');
      document.body.classList.add('overflow-hidden');
    });
  }

  if (closeMenuBtn && mobileMenu) {
    closeMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.classList.remove('overflow-hidden');
    });
  }

  // Close mobile menu on clicking links
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('translate-x-full');
      document.body.classList.remove('overflow-hidden');
    });
  });

  // 3. FAQ Accordion Control
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const button = item.querySelector('.faq-button');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (button && answer) {
      button.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        
        // Close all other FAQs
        faqItems.forEach(otherItem => {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherIcon = otherItem.querySelector('.faq-icon');
          if (otherAnswer && otherAnswer !== answer) {
            otherAnswer.classList.add('hidden');
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          }
        });

        // Toggle current FAQ
        if (isOpen) {
          answer.classList.add('hidden');
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          answer.classList.remove('hidden');
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    }
  });

  // 4. Dynamic Gallery Filter Control
  const filterButtons = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterButtons.forEach(b => b.classList.remove('bg-yellow-400', 'text-slate-900'));
      filterButtons.forEach(b => b.classList.add('bg-slate-800', 'text-white'));
      
      // Add active class to clicked button
      btn.classList.remove('bg-slate-800', 'text-white');
      btn.classList.add('bg-yellow-400', 'text-slate-900');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.classList.remove('hidden');
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 50);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.classList.add('hidden');
          }, 300);
        }
      });
    });
  });

  // 5. Toast Notification System
  window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container') || (() => {
      const el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-3 pointer-events-none';
      document.body.appendChild(el);
      return el;
    })();

    const toast = document.createElement('div');
    toast.className = `transform translate-y-5 opacity-0 transition-all duration-300 pointer-events-auto px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 text-white max-w-sm ${
      type === 'success' ? 'bg-emerald-600 border-l-4 border-emerald-400' : 'bg-rose-600 border-l-4 border-rose-400'
    }`;
    
    const icon = document.createElement('span');
    icon.innerHTML = type === 'success' 
      ? '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
      : '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    
    const text = document.createElement('span');
    text.className = 'font-medium';
    text.innerText = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);

    // Trigger Entrance animation
    setTimeout(() => {
      toast.classList.remove('translate-y-5', 'opacity-0');
    }, 10);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.add('translate-y-5', 'opacity-0');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  };

  // 6. Lead Capture Form and WhatsApp Redirection
  const forms = document.querySelectorAll('.inquiry-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const name = formData.get('name') || 'Anonymous';
      const phone = formData.get('phone') || '';
      const email = formData.get('email') || '';
      const type = formData.get('lift_type') || 'General Inquiry';
      const msg = formData.get('message') || '';
      const source = form.getAttribute('data-source') || window.location.pathname;

      if (!phone) {
        showToast('Please provide a valid phone number.', 'error');
        return;
      }

      // Archive Lead locally in localStorage
      const newLead = {
        name,
        phone,
        email,
        type,
        message: msg,
        source,
        timestamp: new Date().toISOString()
      };

      try {
        const storedLeads = JSON.parse(localStorage.getItem('spectro_leads') || '[]');
        storedLeads.push(newLead);
        localStorage.setItem('spectro_leads', JSON.stringify(storedLeads));
      } catch (err) {
        console.error('Failed to store lead:', err);
      }

      // Format WhatsApp Message
      const waNumber = '919608461829'; // New Target Company Contact Phone Number
      const waText = `*Spectro Elevators - New Inquiry*\n` +
                     `-------------------------\n` +
                     `*Name:* ${name}\n` +
                     `*Phone:* ${phone}\n` +
                     `*Email:* ${email}\n` +
                     `*Lift Type:* ${type}\n` +
                     `*Message:* ${msg}\n` +
                     `*Page Source:* ${source}`;

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      // Submit to Netlify via Ajax
      const netlifyData = {
        "form-name": "inquiry-leads",
        name,
        phone,
        email,
        lift_type: type,
        message: msg,
        source
      };

      showToast('Submitting inquiry... Please wait.');

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(netlifyData).toString()
      })
      .then(() => {
        showToast('Inquiry registered! Opening WhatsApp...');
        form.reset();
        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, 1000);
      })
      .catch(err => {
        console.error('Netlify Form submission failed:', err);
        // Fallback: still open WhatsApp even if Netlify fails
        showToast('Opening WhatsApp...');
        setTimeout(() => {
          window.open(waUrl, '_blank');
        }, 1000);
      });
    });
  });

  // 9. WhatsApp Lead Capture Popup Modal
  const injectWhatsAppModal = () => {
    if (document.getElementById('whatsapp-modal')) return;

    const modalHtml = `
      <div id="whatsapp-modal" class="fixed inset-0 z-[9999] hidden flex items-center justify-center p-4">
        <!-- Backdrop overlay -->
        <div class="absolute inset-0 bg-[#0B192C]/85 backdrop-blur-md" id="whatsapp-modal-overlay"></div>
        
        <!-- Content Box -->
        <div class="relative w-full max-w-md bg-[#0B192C] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl text-white transform scale-95 opacity-0 transition-all duration-300">
          <button id="close-whatsapp-modal" class="absolute top-4 right-4 text-slate-400 hover:text-accent transition-colors" aria-label="Close Modal">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <h3 class="text-xl font-bold font-heading mb-2 text-white flex items-center gap-2">
            <svg class="w-6 h-6 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            Connect on WhatsApp
          </h3>
          <p class="text-xs text-slate-300 mb-6 font-medium">Please enter your details to start chatting with our lift engineering team.</p>
          
          <form id="whatsapp-modal-form" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" for="wa-modal-name">Your Name</label>
              <input id="wa-modal-name" type="text" name="name" required placeholder="e.g. Anuj Kumar" class="w-full bg-[#0B192C]/40 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm">
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" for="wa-modal-phone">Phone Number</label>
              <input id="wa-modal-phone" type="tel" name="phone" required placeholder="e.g. 96084 XXXXX" class="w-full bg-[#0B192C]/40 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm">
            </div>
            <button type="submit" class="w-full bg-accent hover:bg-accentHover text-primary font-bold py-3.5 rounded-lg transition-custom text-sm shadow-md mt-2 flex items-center justify-center gap-2">
              <span>Proceed to Chat</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </form>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);

    const modal = document.getElementById('whatsapp-modal');
    const box = modal.querySelector('.relative');
    const overlay = document.getElementById('whatsapp-modal-overlay');
    const closeBtn = document.getElementById('close-whatsapp-modal');

    const hideModal = () => {
      box.classList.remove('scale-100', 'opacity-100');
      box.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        modal.classList.add('hidden');
      }, 300);
    };

    closeBtn.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);

    window.showWhatsAppModal = (originalUrl) => {
      modal.classList.remove('hidden');
      setTimeout(() => {
        box.classList.remove('scale-95', 'opacity-0');
        box.classList.add('scale-100', 'opacity-100');
      }, 50);

      const form = document.getElementById('whatsapp-modal-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('wa-modal-name').value;
        const phone = document.getElementById('wa-modal-phone').value;

        if (!phone) {
          showToast('Please enter a valid phone number', 'error');
          return;
        }

        const source = window.location.pathname;

        const bodyData = {
          "form-name": "whatsapp-leads",
          name,
          phone,
          message: "Clicked WhatsApp link",
          source
        };

        showToast('Saving details... Redirecting to WhatsApp...');
        hideModal();

        const waNumber = '919608461829';
        let customText = `Hello Spectro Elevators, my name is ${name} (${phone}). I would like to chat with you.`;
        if (originalUrl) {
          try {
            const urlObj = new URL(originalUrl);
            const textParam = urlObj.searchParams.get('text');
            if (textParam) {
              customText = `*Inquirer:* ${name} (${phone})\n*Message:* ${textParam}`;
            }
          } catch(e) {}
        }
        
        const finalWaUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(customText)}`;

        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(bodyData).toString()
        })
        .then(() => {
          form.reset();
          setTimeout(() => {
            window.open(finalWaUrl, '_blank');
          }, 500);
        })
        .catch(err => {
          console.error('Netlify Form submission failed:', err);
          setTimeout(() => {
            window.open(finalWaUrl, '_blank');
          }, 500);
        });
      };
    };
  };

  injectWhatsAppModal();

  // 10. Intercept WhatsApp Clicks
  const interceptWhatsAppClicks = () => {
    document.body.addEventListener('click', (e) => {
      const anchor = e.target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href') || '';
        if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp.com/send')) {
          e.preventDefault();
          window.showWhatsAppModal(href);
        }
      }
    });
  };

  interceptWhatsAppClicks();

  // 7. Counter Animation (Simple JS Interval)
  const counters = document.querySelectorAll('.stat-counter');
  const runCounters = () => {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target') || '0');
      const suffix = counter.getAttribute('data-suffix') || '';
      let count = 0;
      const speed = target / 50; // speed divider

      const updateCount = () => {
        if (count < target) {
          count += Math.ceil(speed);
          if (count > target) count = target;
          counter.innerText = count + suffix;
          setTimeout(updateCount, 30);
        } else {
          counter.innerText = target + suffix;
        }
      };
      updateCount();
    });
  };

  // Trigger counters when in view using Intersection Observer
  if (counters.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    // Observe the first counter element
    observer.observe(counters[0]);
  }

  // 8. Scroll-triggered Text Reveal Animation for Hero Heading
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    const heroH1 = document.querySelector('#hero-section h1');
    if (heroH1) {
      const originalText = heroH1.innerText.trim();
      const words = originalText.split(/\s+/);
      
      heroH1.innerHTML = words.map(word => {
        const cleanWord = word.replace(/[^a-zA-Z&]/g, '');
        if (cleanWord === 'Residential') {
          return `<span class="reveal-word text-accent opacity-20 inline-block mr-2 sm:mr-3 transition-opacity">Residential</span>`;
        }
        return `<span class="reveal-word opacity-20 inline-block mr-2 sm:mr-3 transition-opacity">${word}</span>`;
      }).join('');

      // GSAP ScrollTrigger timeline to reveal words as we scroll
      gsap.to(heroH1.querySelectorAll('.reveal-word'), {
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: "#hero-section",
          start: "top top",
          end: "+=300", // complete transition within 300px of scrolling down
          scrub: true,
          markers: false
        }
      });
    }
  }

  // 11. Quick Quote Sticky Widget & Modal Injection
  const injectQuickQuoteWidget = () => {
    if (document.getElementById('sticky-quote-trigger')) return;

    // Create wrapper
    const container = document.createElement('div');
    container.id = 'quick-quote-widget-container';

    const widgetHtml = `
      <!-- Sticky Button -->
      <div class="sticky-quote-btn" id="sticky-quote-trigger">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
        </svg>
        Quick Quote
      </div>

      <!-- Quick Quote Modal -->
      <div id="quick-quote-modal" class="fixed inset-0 z-[9999] hidden flex items-center justify-center p-4">
        <!-- Backdrop with blur -->
        <div class="absolute inset-0 bg-[#0B192C]/85 backdrop-blur-md quick-modal-backdrop" id="quick-quote-modal-overlay"></div>
        
        <!-- Card Container -->
        <div class="relative bg-[#0B192C] border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 sm:p-8 quick-modal-card text-white overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Accent top gradient line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent to-accentHover"></div>
          
          <!-- Close Button -->
          <button id="close-quick-quote-modal" class="absolute top-5 right-5 text-slate-400 hover:text-accent transition-colors" aria-label="Close Modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <!-- Header -->
          <div class="mb-6 flex-shrink-0">
            <h3 class="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
              <span class="text-accent font-extrabold">SPECTRO</span> QUICK QUOTE
            </h3>
            <p class="text-xs text-slate-400 mt-1">Get an instant elevator estimate. Complete the quick inquiry form below.</p>
          </div>
          
          <!-- Form -->
          <form id="quick-quote-modal-form" class="space-y-4 overflow-y-auto pr-1 flex-grow">
            <!-- Form Group Name -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" for="qq-name">Your Name *</label>
              <input id="qq-name" type="text" name="name" required placeholder="e.g. Rahul Sharma" class="w-full bg-[#0B192C]/40 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm">
            </div>
            
            <!-- Form Group Phone -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" for="qq-phone">Phone Number *</label>
              <input id="qq-phone" type="tel" name="phone" required placeholder="e.g. +91 98765 XXXXX" class="w-full bg-[#0B192C]/40 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm">
            </div>
            
            <!-- Form Group Select Lift -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" for="qq-product">Select Lift Type *</label>
              <select id="qq-product" name="product" required class="w-full bg-[#0B192C] border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-sm">
                <option value="" disabled selected>-- Choose Lift Type --</option>
                <option value="Passenger Elevator / Lift">Passenger Elevator / Lift</option>
                <option value="Residential & Home Lift">Residential & Home Lift</option>
                <option value="MRL Elevator">MRL (Machine Room-Less) Elevator</option>
                <option value="Hydraulic Elevator">Hydraulic Elevator</option>
                <option value="Stretcher & Hospital Lift">Stretcher & Hospital Lift</option>
                <option value="Glass Capsule Elevator">Glass Capsule Elevator</option>
                <option value="Goods & Freight Elevator">Goods & Freight Elevator</option>
                <option value="Automobile / Car Elevator">Automobile / Car Elevator</option>
                <option value="Service Lift / Dumbwaiter">Service Lift / Dumbwaiter</option>
                <option value="Outdoor / Exterior Lift">Outdoor / Exterior Lift</option>
                <option value="Stair Lift / Chair Lift">Stair Lift / Chair Lift</option>
                <option value="Pneumatic Vacuum Lift">Pneumatic Vacuum Lift</option>
              </select>
            </div>
            
            <!-- Form Group Message -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1" for="qq-message">Requirements / Details</label>
              <textarea id="qq-message" name="message" rows="3" placeholder="Describe your location, floors, or general requirement..." class="w-full bg-[#0B192C]/40 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm resize-none"></textarea>
            </div>
            
            <!-- Status Notification -->
            <div id="qq-status" class="hidden text-xs py-2 px-3 rounded-lg"></div>
            
            <!-- Submit Button -->
            <button type="submit" class="w-full bg-accent hover:bg-accentHover text-primary font-bold py-3 rounded-lg transition-custom text-sm shadow-md mt-2 relative overflow-hidden btn-quote-hero">
              Send Request
            </button>
          </form>
        </div>
      </div>
    `;

    container.innerHTML = widgetHtml;
    document.body.appendChild(container);

    const trigger = document.getElementById('sticky-quote-trigger');
    const modal = document.getElementById('quick-quote-modal');
    const closeBtn = document.getElementById('close-quick-quote-modal');
    const overlay = document.getElementById('quick-quote-modal-overlay');
    const form = document.getElementById('quick-quote-modal-form');
    const statusDiv = document.getElementById('qq-status');

    const showModal = () => {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const hideModal = () => {
      modal.classList.add('hidden');
      document.body.style.overflow = ''; // Restore background scrolling
      statusDiv.classList.add('hidden');
      statusDiv.innerText = '';
    };

    trigger.addEventListener('click', showModal);
    closeBtn.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        hideModal();
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('qq-name').value.trim();
      const phone = document.getElementById('qq-phone').value.trim();
      const product = document.getElementById('qq-product').value;
      const message = document.getElementById('qq-message').value.trim();
      const source = window.location.pathname.split('/').pop() || 'index.html';

      if (!name || !phone || !product) {
        statusDiv.className = "text-xs py-2 px-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30";
        statusDiv.innerText = "Please fill in all required fields.";
        statusDiv.classList.remove('hidden');
        return;
      }

      // Save to localStorage
      const newLead = {
        name,
        phone,
        type: product,
        email: 'N/A',
        message: message || 'N/A',
        source: source + " (Quick Quote)",
        timestamp: new Date().toISOString()
      };

      try {
        const storedLeads = JSON.parse(localStorage.getItem('spectro_leads') || '[]');
        storedLeads.push(newLead);
        localStorage.setItem('spectro_leads', JSON.stringify(storedLeads));
      } catch (err) {
        console.error('Failed to store lead:', err);
      }

      // Format WhatsApp Message
      const waNumber = '919608461829';
      const waText = `*Spectro Elevators - Quick Quote Request*\n` +
                     `-------------------------\n` +
                     `*Name:* ${name}\n` +
                     `*Phone:* ${phone}\n` +
                     `*Lift Type:* ${product}\n` +
                     `*Message:* ${message || 'N/A'}\n` +
                     `*Page Source:* ${source} (Quick Quote Button)`;

      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;

      // Submit to Netlify via AJAX
      const netlifyData = {
        "form-name": "quick-quote-leads",
        name,
        phone,
        product,
        message,
        source
      };

      statusDiv.className = "text-xs py-2 px-3 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      statusDiv.innerText = "Submitting your quote request...";
      statusDiv.classList.remove('hidden');

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(netlifyData).toString()
      })
      .then(() => {
        statusDiv.className = "text-xs py-2 px-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30";
        statusDiv.innerText = "Request registered! Opening WhatsApp...";
        form.reset();
        setTimeout(() => {
          hideModal();
          window.open(waUrl, '_blank');
        }, 1500);
      })
      .catch(err => {
        console.error('Netlify Form submission failed:', err);
        statusDiv.className = "text-xs py-2 px-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30";
        statusDiv.innerText = "Opening WhatsApp...";
        setTimeout(() => {
          hideModal();
          window.open(waUrl, '_blank');
        }, 1500);
      });
    });
  };

  injectQuickQuoteWidget();
});
