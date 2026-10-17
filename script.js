document.addEventListener('DOMContentLoaded', () => {
    const $ = (s) => document.querySelector(s);

    /* ==========================================
       0. CONFIG - the only place to edit client details
       ========================================== */
    const CONFIG = {
        firmName: 'Osebeyo & Co.',
        whatsapp: '2348000000000',  // country code, no + or spaces
        email: 'info@osebeyo.com',  // confirm with client
        linkedin: '',               // full URL; empty = icon hidden
        formEndpoint: ''            // e.g. 'https://formspree.io/f/xxxx'. Empty = form opens WhatsApp instead
    };
    const wa = (t = '') => `https://wa.me/${CONFIG.whatsapp}${t ? '?text=' + encodeURIComponent(t) : ''}`;

    const newTab = (el) => {
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
        const note = ' (opens in a new tab)';
        if (el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.getAttribute('aria-label') + note);
        else el.insertAdjacentHTML('beforeend', `<span class="sr-only">${note}</span>`);
    };
    document.querySelectorAll('[data-wa]').forEach((a) => { a.href = wa(a.dataset.wa); newTab(a); });
    document.querySelectorAll('[data-mail]').forEach((a) => {
        a.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent('Enquiry from website')}`;
    });
    document.querySelectorAll('[data-social="linkedin"]').forEach((a) => {
        if (CONFIG.linkedin) { a.href = CONFIG.linkedin; newTab(a); } else a.remove();
    });

    /* ==========================================
       1. MOBILE MENU
       ========================================== */
    const menuBtn = $('#mobileToggle');
    const nav = $('#navLinks');
    const setMenu = (open) => {
        nav.classList.toggle('show', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        const icon = menuBtn.querySelector('i');
        icon.classList.toggle('fa-xmark', open);
        icon.classList.toggle('fa-bars', !open);
    };
    menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('show')));
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1100) setMenu(false); });

    /* ==========================================
       2. ACTIVE NAV LINK ON SCROLL
       ========================================== */
    const navItems = document.querySelectorAll('.nav-link');
    const spyEls = ['home', 'services', 'about', 'why-us', 'testimonials', 'contact']
        .map((id) => document.getElementById(id)).filter(Boolean);
    let ticking = false;
    const onScroll = () => {
        const y = window.scrollY + 160;
        let current = 'home';
        spyEls.forEach((el) => { if (el.offsetTop <= y) current = el.id; });
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'contact';
        navItems.forEach((a) => {
            const on = a.getAttribute('href') === `#${current}`;
            a.classList.toggle('active', on);
            if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    /* ==========================================
       3. CONSULTATION MODAL (focus managed, Esc, scroll lock)
       ========================================== */
    const modal = $('#consultationModal');
    const card = $('.modal-card');
    const select = $('#serviceSelect');
    const form = $('#consultationForm');
    const status = $('#formStatus');
    const submitBtn = $('#submitBtn');
    let opener = null;

    const setStatus = (msg, cls = '') => { status.textContent = msg; status.className = `form-status ${cls}`; };

    const openModal = (service, trigger) => {
        opener = trigger;
        select.value = [...select.options].some((o) => o.value === service) ? service : 'General Inquiry';
        setStatus('');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => $('#fullName').focus(), 50);
    };
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (opener) opener.focus();
    };

    document.querySelectorAll('.open-modal-btn').forEach((b) => {
        b.addEventListener('click', () => {
            const fromMenu = b.classList.contains('nav-cta');
            if (fromMenu) setMenu(false);
            openModal(b.dataset.service, fromMenu ? menuBtn : b);
        });
    });
    $('#modalCloseBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) closeModal();
            else if (nav.classList.contains('show')) { setMenu(false); menuBtn.focus(); }
        }
        if (e.key === 'Tab' && modal.classList.contains('active')) { // trap focus in dialog
            const f = [...card.querySelectorAll('button, input, select, textarea, a[href]')].filter((x) => !x.disabled);
            const first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    /* ==========================================
       4. FORM SUBMIT - real delivery, no fake "received" alert
       ========================================== */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(form));

        if (CONFIG.formEndpoint) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
            try {
                const r = await fetch(CONFIG.formEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!r.ok) throw new Error('bad response');
                setStatus(`Thank you, ${data.name}. Your request has been sent and we will be in touch shortly.`, 'ok');
                form.reset();
                setTimeout(() => { if (modal.classList.contains('active')) closeModal(); }, 2500);
            } catch (err) {
                setStatus('Sorry, we could not send your request. Please use WhatsApp or email below.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Consultation Request';
            }
            return;
        }

        // No backend configured: hand the request to WhatsApp so it is never silently lost
        const lines = [
            `Hello ${CONFIG.firmName}, my name is ${data.name}.`,
            `I would like a consultation about: ${data.service}.`,
            `Email: ${data.email}`
        ];
        if (data.phone) lines.push(`Phone: ${data.phone}`);
        if (data.message) lines.push(data.message);
        window.open(wa(lines.join('\n')), '_blank', 'noopener');
        setStatus('Opening WhatsApp so you can send your request…', 'ok');
        form.reset();
    });

    /* ==========================================
       5. STATS COUNTER (screen-reader safe, respects reduced motion)
       ========================================== */
    const counters = [...document.querySelectorAll('.stat-number')];
    counters.forEach((c) => { // HTML holds the real values; screen readers read those, not the animation
        c.setAttribute('aria-hidden', 'true');
        c.insertAdjacentHTML('afterend', `<span class="sr-only">${c.textContent}</span>`);
    });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stats = $('.stats-strip');

    if (stats && !reduce && 'IntersectionObserver' in window) {
        const fmt = (c, v) => v.toFixed(parseInt(c.dataset.decimals) || 0) + (c.dataset.suffix || '');
        counters.forEach((c) => { c.textContent = fmt(c, 0); });
        const run = () => counters.forEach((c) => {
            const target = parseFloat(c.dataset.target);
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min((now - start) / 1800, 1);
                c.textContent = fmt(c, target * (1 - Math.pow(1 - p, 3)));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        });
        const io = new IntersectionObserver((en) => {
            if (en[0].isIntersecting) { run(); io.disconnect(); }
        }, { threshold: 0.3 });
        io.observe(stats);
    }
});
