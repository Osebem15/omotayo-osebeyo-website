document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================
       1. MOBILE NAVIGATION TOGGLE
       ========================================== */
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu on clicking nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    /* ==========================================
       2. ACTIVE NAV LINK HIGHLIGHT ON SCROLL
       ========================================== */
    const sections = document.querySelectorAll('section, footer');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('active');
            }
        });
    });

    /* ==========================================
       3. CONSULTATION MODAL DIALOG
       ========================================== */
    const modal = document.getElementById('consultationModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const serviceSelect = document.getElementById('serviceSelect');

    const openModal = (serviceName = null) => {
        if (modal) {
            modal.classList.add('active');
            if (serviceName && serviceSelect) {
                serviceSelect.value = serviceName;
            }
        }
    };

    const closeModal = () => {
        if (modal) {
            modal.classList.remove('active');
        }
    };

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const service = btn.getAttribute('data-service');
            openModal(service);
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    /* ==========================================
       4. CONSULTATION FORM SUBMISSION
       ========================================== */
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value;
            
            // Simple submission feedback
            alert(`Thank you, ${fullName}! Your consultation request has been received. Our team at Osebeyo & Co. will contact you shortly.`);
            
            consultationForm.reset();
            closeModal();
        });
    }

    /* ==========================================
       5. ANIMATED STATS COUNTER ON SCROLL
       ========================================== */
    const statNumbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const runCounterAnimation = () => {
        statNumbers.forEach(counter => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const suffix = counter.getAttribute('data-suffix') || '';
            const decimals = parseInt(counter.getAttribute('data-decimals')) || 0;
            let current = 0;
            const duration = 2000; // 2 seconds
            const stepTime = 20;
            const steps = duration / stepTime;
            const increment = target / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.innerText = current.toFixed(decimals) + suffix;
            }, stepTime);
        });
    };

    // IntersectionObserver to trigger animation when stats section is visible
    const statsSection = document.querySelector('.stats-strip');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    runCounterAnimation();
                    animated = true;
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }
});