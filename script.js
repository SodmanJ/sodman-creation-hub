(function() {
    'use strict';


    const html = document.documentElement;
    const body = document.body;
    const header = document.getElementById('siteHeader');
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const themeToggle = document.getElementById('themeToggle');
    const backToTopBtn = document.getElementById('backToTop');
    const yearSpan = document.getElementById('year');
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const masonryGrid = document.getElementById('masonryGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const revealEls = document.querySelectorAll('[data-reveal]');
    const statNums = document.querySelectorAll('.stat-num[data-count]');
    const allNavLinks = document.querySelectorAll('a[href^="#"]');


    let ticking = false;
    let countersAnimated = false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


    function throttleRAF(cb) {
        return function() {
            if (!ticking) {
                requestAnimationFrame(() => { cb(); ticking = false; });
                ticking = true;
            }
        };
    }


    /* Theme toggle */
    function setTheme(theme) {
        if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
            themeToggle.setAttribute('aria-pressed', 'true');
        } else {
            html.removeAttribute('data-theme');
            themeToggle.setAttribute('aria-pressed', 'false');
        }
    }
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });


    /* Mobile nav */
    function openMobileNav() {
        menuToggle.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close menu');
        mobileNav.classList.add('is-open');
        body.style.overflow = 'hidden';
    }
    function closeMobileNav() {
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
        mobileNav.classList.remove('is-open');
        body.style.overflow = '';
    }
    menuToggle.addEventListener('click', () => {
        mobileNav.classList.contains('is-open') ? closeMobileNav() : openMobileNav();
    });
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileNav);
    }
    mobileNav.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', closeMobileNav));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileNav.classList.contains('is-open')) closeMobileNav();
    });


    /* Header scroll */
    function updateHeaderState() { header.classList.toggle('scrolled', window.scrollY > 60); }
    function updateBackToTop() { backToTopBtn.classList.toggle('is-visible', window.scrollY > 500); }


    /* Portfolio filter */
    function filterPortfolio(category) {
        masonryGrid.querySelectorAll('.proj-card').forEach(card => {
            const cat = card.getAttribute('data-cat');
            card.classList.toggle('hidden-item', !(category === 'all' || cat === category));
        });
        filterBtns.forEach(btn => {
            const active = btn.getAttribute('data-filter') === category;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => filterPortfolio(btn.getAttribute('data-filter')));
    });


    /* Image loading */
    document.querySelectorAll('img[src]').forEach(img => {
        if (!img.getAttribute('src')) return;
        if (img.complete && img.naturalWidth > 0) img.classList.add('has-img');
        else {
            img.addEventListener('load', () => img.classList.add('has-img'));
            img.addEventListener('error', () => img.classList.remove('has-img'));
        }
    });


    /* Reveal on scroll */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
    setTimeout(() => {
        revealEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('is-visible');
                revealObserver.unobserve(el);
            }
        });
    }, 100);


    /* Animated counters */
    function animateCounters() {
        if (countersAnimated) return;
        const statsSection = document.getElementById('why');
        if (!statsSection) return;
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > 0) {
            countersAnimated = true;
            statNums.forEach(el => {
                const target = parseInt(el.getAttribute('data-count'), 10);
                const suffix = el.getAttribute('data-suffix') || '';
                const duration = 1600;
                const startTime = performance.now();
                function updateCounter(now) {
                    const progress = Math.min((now - startTime) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (progress < 1) requestAnimationFrame(updateCounter);
                    else el.textContent = target + suffix;
                }
                requestAnimationFrame(updateCounter);
            });
        }
    }
    setTimeout(animateCounters, 150);
    window.addEventListener('scroll', throttleRAF(() => {
        updateHeaderState();
        updateBackToTop();
        animateCounters();
    }), { passive: true });


    /* Smooth scroll */
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.getElementById(href.slice(1));
            if (!target) return;
            e.preventDefault();
            const headerHeight = header.getBoundingClientRect().height;
            const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
            window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    });


    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });


    /* Project modal */
    const modal = document.getElementById('projectModal');
    const modalImg = document.getElementById('modalImage');
    const modalMark = document.getElementById('modalMark');
    const modalImageWrap = document.getElementById('modalImageWrap');
    const modalCat = document.getElementById('modalCat');
    const modalCatMeta = document.getElementById('modalCatMeta');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');


    function openModal(card) {
        const title = card.getAttribute('data-title') || '';
        const catLabel = card.getAttribute('data-cat-label') || '';
        const desc = card.getAttribute('data-desc') || '';
        const tone = card.getAttribute('data-tone') || '1';
        const letter = card.getAttribute('data-letter') || '';
        const imgSrc = card.getAttribute('data-img') || '';


        modalImageWrap.className = 'project-modal-image proj-tone-' + tone;
        modalMark.textContent = letter;
        if (imgSrc.trim() !== '') {
            modalImg.src = imgSrc;
            modalImg.alt = title;
            modalImg.classList.add('has-img');
            modalMark.classList.add('hide');
        } else {
            modalImg.removeAttribute('src');
            modalImg.alt = '';
            modalImg.classList.remove('has-img');
            modalMark.classList.remove('hide');
        }
        modalCat.textContent = catLabel;
        modalCatMeta.textContent = catLabel;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
    }
    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
    }
    document.querySelectorAll('.proj-card').forEach(card => card.addEventListener('click', () => openModal(card)));
    modal.querySelector('.project-modal-backdrop').addEventListener('click', closeModal);
    modal.querySelector('.project-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });


    /* Contact form (demo mode) */
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('fName');
            const email = document.getElementById('fEmail');
            const message = document.getElementById('fMessage');
            if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
                formStatus.textContent = 'Please fill in all required fields.';
                formStatus.style.color = '#C0392B';
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.style.color = '#C0392B';
                return;
            }
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending…';
            submitBtn.disabled = true;
            setTimeout(() => {
                formStatus.textContent = '✓ Message sent. I\'ll get back to you within 24 hours.';
                formStatus.style.color = '#1E8E5A';
                contactForm.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 1200);
        });
    }


    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) { closeMobileNav(); menuToggle.focus(); }
    });


    updateHeaderState();
    updateBackToTop();
})();