/* =============================================
   PORTFOLIO - Matias Iglesias
   Main JavaScript - Animations & Interactions
============================================= */

// ─── Aurora Mouse Interaction ───────────────────────────────────
(function initAuroraInteraction() {
  const blobs = document.querySelectorAll('.aurora-blob');

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;

    blobs.forEach((blob, i) => {
      const factor = (i + 1) * 0.4;
      blob.style.translate = `${x * factor}px ${y * factor}px`;
    });
  });
})();


// ─── Typewriter Effect ──────────────────────────────────────────
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  const words = ['Full-Stack', 'Frontend', 'Backend', 'de Software'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  type();
})();


// ─── Scroll Reveal Animations ───────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  elements.forEach(el => observer.observe(el));
})();


// ─── Stat Counter Animation ─────────────────────────────────────
(function initCounters() {
  const stats = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function animateCounter(el, target) {
    let current = 0;
    const step = target / 40;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(interval);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 40);
  }

  stats.forEach(s => observer.observe(s));
})();


// ─── Navbar Scroll Effects ──────────────────────────────────────
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section');
  const toggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-links');

  // Scroll background
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Active section highlight
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => sectionObserver.observe(s));

  // Mobile toggle
  toggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();


// ─── Smooth Scroll ──────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const navHeight = document.getElementById('navbar').offsetHeight;
      const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }
  });
});


// ─── Project Filters ────────────────────────────────────────────
(function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projects.forEach(project => {
        if (filter === 'all' || project.dataset.category === filter) {
          project.style.display = '';
          requestAnimationFrame(() => {
            project.style.opacity = '1';
            project.style.transform = 'translateY(0)';
          });
        } else {
          project.style.opacity = '0';
          project.style.transform = 'translateY(20px)';
          setTimeout(() => { project.style.display = 'none'; }, 300);
        }
      });
    });
  });
})();


// ─── Skill Tag Hover Glow ───────────────────────────────────────
document.querySelectorAll('.skill-tag').forEach(tag => {
  tag.addEventListener('mouseenter', function() {
    this.style.setProperty('--glow-opacity', '1');
  });
  tag.addEventListener('mouseleave', function() {
    this.style.setProperty('--glow-opacity', '0');
  });
});
