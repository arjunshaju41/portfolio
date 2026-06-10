document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuToggle = document.getElementById('menu-toggle-btn');
    const navbar = document.getElementById('navbar');
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    // --- Smooth Scroll Navigation Clicks ---
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http')) {
                return;
            }

            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                closeMobileMenu();
                targetSection.scrollIntoView({ behavior: 'smooth' });
                // Update URL hash quietly without jumping
                history.pushState(null, null, href);
            }
        });
    });

    // Smooth scroll logo click
    const logoLink = document.getElementById('header-logo');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById('home');
            if (targetSection) {
                closeMobileMenu();
                targetSection.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, '#home');
            }
        });
    }

    // --- Scroll Reveal & Nav Highlight Observer ---
    const observerOptions = {
        root: null,
        rootMargin: '-25% 0px -25% 0px', // Trigger when section occupies the active middle zone of viewport
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class for scroll reveal transition
                entry.target.classList.add('visible');

                // Highlight corresponding nav link
                const sectionId = entry.target.id;
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${sectionId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });

                // Trigger skills animation when skills section enters viewport
                if (sectionId === 'skills') {
                    animateSkills();
                }
            }
        });
    }, observerOptions);

    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });

    // Initial scroll to hash on page load
    if (window.location.hash) {
        const targetSection = document.querySelector(window.location.hash);
        if (targetSection) {
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }

    // --- Mobile Menu Toggle ---
    if (menuToggle && navbar) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('open');
            navbar.classList.toggle('open');
        });
    }

    function closeMobileMenu() {
        if (menuToggle && navbar) {
            menuToggle.classList.remove('open');
            navbar.classList.remove('open');
        }
    }

    // --- Skills Animations ---
    function animateSkills() {
        const skillBars = document.querySelectorAll('.skill-bar-fill');
        // Use setTimeout to allow browser DOM transition buffer
        setTimeout(() => {
            skillBars.forEach(bar => {
                const percent = bar.getAttribute('data-percent');
                bar.style.width = percent;
            });
        }, 150);
    }

    function resetSkills() {
        const skillBars = document.querySelectorAll('.skill-bar-fill');
        skillBars.forEach(bar => {
            bar.style.width = '0';
        });
    }

    // --- Web3Forms Configuration ---
    // Get your FREE access key in 30 seconds:
    // 1. Go to https://web3forms.com/
    // 2. Enter arjunshaju410@gmail.com → click "Create Access Key"
    // 3. Check your Gmail inbox and copy the key
    // 4. Paste it below replacing YOUR_ACCESS_KEY_HERE
    const WEB3FORMS_KEY = '397ab362-c053-4253-94be-8de36f6387a4';

    // --- Contact Form Submission Handling ---
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Form validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showToast('Please fill out all fields.', 'error');
                return;
            }

            // Enter loading state
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" style="animation: spin 1s linear infinite; width:16px; height:16px; fill:currentColor;">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" stroke-width="4" fill="none"></circle>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
        </svg>
        SENDING...
      `;

            if (!document.getElementById('spin-keyframes')) {
                const style = document.createElement('style');
                style.id = 'spin-keyframes';
                style.innerHTML = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }

            // Send via Web3Forms
            try {
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_KEY,
                        name: name,
                        email: email,
                        message: message,
                        subject: `New Portfolio Message from ${name}`
                    })
                });
                const data = await res.json();

                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;

                if (data.success) {
                    contactForm.reset();
                    showToast('Message sent successfully!', 'success');
                } else {
                    showToast('Failed to send. Please try again.', 'error');
                }
            } catch (err) {
                console.error('Web3Forms error:', err);
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnContent;
                showToast('Failed to send. Please check your connection.', 'error');
            }
        });
    }

    // --- Toast Notification ---
    let toastTimeout;
    function showToast(message, type = 'success') {
        clearTimeout(toastTimeout);

        toastMessage.textContent = message;

        // Change style based on type if necessary
        const iconContainer = toast.querySelector('.toast-success-icon');
        if (type === 'error') {
            iconContainer.style.color = '#ef4444'; // Red for errors
            iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:currentColor;">
          <path d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z" />
        </svg>
      `;
            toast.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        } else {
            iconContainer.style.color = '#10b981'; // Green for success
            iconContainer.innerHTML = `
        <svg viewBox="0 0 24 24" style="width:18px; height:18px; fill:currentColor;">
          <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
        </svg>
      `;
            toast.style.borderColor = 'rgba(14, 165, 233, 0.5)';
        }

        toast.classList.add('show');

        // Fade out after 4 seconds
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // --- Project Details Data (from Resume) ---
    const projectDetails = {
        sportsweb: {
            badge: "Academic Project",
            title: "Sports Website",
            tagline: "College Sports Portal with Real-Time Updates",
            bullets: [
                "Developed a sports website for the college featuring real-time updates about events happening on campus.",
                "Built a dynamic event listing interface that displays live sports event information to students and faculty.",
                "Implemented a clean, responsive UI to ensure seamless browsing across devices.",
                "Provided administrators the ability to post and manage sports events directly through the platform."
            ],
            tags: ["HTML", "CSS", "JavaScript"],
            github: "https://github.com",
            live: "#"
        },
        genesage: {
            badge: "AI / Bioinformatics",
            title: "GeneSage",
            tagline: "AI-Driven DNA Mutation Analysis Platform",
            bullets: [
                "Built an AI-driven genomic analysis and decision-support platform to analyze DNA mutations and link them to disease risks and drug responses.",
                "Designed the platform to bridge the gap between raw genomic data and actionable medical insights in a clear, clinically inspired manner.",
                "Made advanced genomics more accessible to researchers, clinicians, and future precision-medicine systems.",
                "Integrated AI models to identify mutation patterns and provide data-driven treatment and risk insights."
            ],
            tags: ["AI / ML", "Genomics", "Python", "React.js"],
            github: "https://github.com",
            live: "#"
        }
    };

    // --- Project Details Modal Handling ---
    const modalOverlay = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalBadge = document.getElementById('modal-project-badge');
    const modalTitle = document.getElementById('modal-project-title');
    const modalTagline = document.getElementById('modal-project-tagline');
    const modalBullets = document.getElementById('modal-project-bullets');
    const modalTagsContainer = document.getElementById('modal-project-tags');
    const modalBtnGithub = document.getElementById('modal-btn-github');
    const modalBtnLive = document.getElementById('modal-btn-live');

    // Trigger Modal
    document.querySelectorAll('.btn-read-more').forEach(btn => {
        btn.addEventListener('click', () => {
            const projectId = btn.getAttribute('data-project-id');
            const data = projectDetails[projectId];

            if (data) {
                // Populate modal data
                modalBadge.textContent = data.badge;
                modalTitle.textContent = data.title;
                modalTagline.textContent = data.tagline;

                // Populate bullets
                modalBullets.innerHTML = '';
                data.bullets.forEach(bullet => {
                    const li = document.createElement('li');
                    li.textContent = bullet;
                    modalBullets.appendChild(li);
                });

                // Populate tech tags
                modalTagsContainer.innerHTML = '';
                data.tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.className = 'project-tag';
                    span.textContent = tag;
                    modalTagsContainer.appendChild(span);
                });

                // Setup links
                modalBtnGithub.setAttribute('href', data.github);
                modalBtnLive.setAttribute('href', data.live);

                // Open modal with smooth transitions
                modalOverlay.classList.add('open');
                document.body.style.overflow = 'hidden'; // Stop background scrolling
            }
        });
    });

    // Close Modal trigger
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Escape key closure support
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('open');
            document.body.style.overflow = ''; // Re-enable background scrolling
        }
    }
});