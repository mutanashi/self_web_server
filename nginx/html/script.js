$(document).ready(function() {
    // Smooth scrolling for navigation links
    $('.nav-links a, .cta-button').click(function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 80
            }, 1000);
        }
    });

    // Scroll animations
    function animateOnScroll() {
        $('section').each(function() {
            const elementTop = $(this).offset().top;
            const elementBottom = elementTop + $(this).outerHeight();
            const viewportTop = $(window).scrollTop();
            const viewportBottom = viewportTop + $(window).height();

            if (elementBottom > viewportTop && elementTop < viewportBottom) {
                $(this).addClass('visible');
            }
        });
    }

    $(window).scroll(animateOnScroll);
    animateOnScroll(); // Run on page load

    // Header background on scroll
    $(window).scroll(function() {
        if ($(window).scrollTop() > 50) {
            $('header').css('background', 'rgba(255, 255, 255, 0.98)');
        } else {
            $('header').css('background', 'rgba(255, 255, 255, 0.95)');
        }
    });

    // Portfolio item hover effects
    $('.portfolio-item').hover(
        function() {
            $(this).find('.portfolio-img').css('transform', 'scale(1.05)');
        },
        function() {
            $(this).find('.portfolio-img').css('transform', 'scale(1)');
        }
    );

    // Portfolio item click handler (for future API integration)
    $('.portfolio-item').click(function() {
        const projectId = $(this).data('project');
        console.log('Load project details for:', projectId);
        // Here you can add API call to load project details
        // Example: loadProjectDetails(projectId);
    });

    // Skill tags animation
    $('.skill-tag').each(function(index) {
        $(this).css('animation-delay', (index * 0.1) + 's');
    });

    // Create floating particles
    function createParticles() {
        const heroSection = $('.hero');
        for (let i = 0; i < 20; i++) {
            const particle = $('<div class="particle"></div>');
            particle.css({
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 6 + 's',
                animationDuration: (Math.random() * 3 + 3) + 's'
            });
            heroSection.append(particle);
        }
    }

    createParticles();

    // Timeline animation
    $('.timeline-item').each(function(index) {
        $(this).css('animation-delay', (index * 0.2) + 's');
    });

    // API Integration Ready Functions
    window.portfolioAPI = {
        // Load portfolio items from API
        loadPortfolio: function() {
            // Example API call structure
            $.ajax({
                url: '/api/portfolio',
                method: 'GET',
                success: function(data) {
                    updatePortfolioGrid(data);
                },
                error: function(xhr, status, error) {
                    console.error('Error loading portfolio:', error);
                }
            });
        },

        // Load experience data from API
        loadExperience: function() {
            // Example API call structure
            $.ajax({
                url: '/api/experience',
                method: 'GET',
                success: function(data) {
                    updateTimeline(data);
                },
                error: function(xhr, status, error) {
                    console.error('Error loading experience:', error);
                }
            });
        },

        // Load profile information from API
        loadProfile: function() {
            $.ajax({
                url: '/api/profile',
                method: 'GET',
                success: function(data) {
                    updateProfile(data);
                },
                error: function(xhr, status, error) {
                    console.error('Error loading profile:', error);
                }
            });
        },

        // Submit contact form
        submitContact: function(formData) {
            $.ajax({
                url: '/api/contact',
                method: 'POST',
                data: JSON.stringify(formData),
                contentType: 'application/json',
                success: function(response) {
                    alert('訊息已成功發送！');
                },
                error: function(xhr, status, error) {
                    alert('發送失敗，請稍後再試。');
                    console.error('Error submitting contact:', error);
                }
            });
        }
    };

    // Update functions for API data
    function updatePortfolioGrid(data) {
        const portfolioGrid = $('.portfolio-grid');
        portfolioGrid.empty();
        
        data.forEach(function(item) {
            const portfolioItem = `
                <div class="portfolio-item" data-project="${item.id}">
                    <div class="portfolio-img" style="background-image: url('${item.image}')">
                        ${item.image ? '' : '項目預覽圖'}
                    </div>
                    <div class="portfolio-content">
                        <h3 class="portfolio-title">${item.title}</h3>
                        <p class="portfolio-desc">${item.description}</p>
                    </div>
                </div>
            `;
            portfolioGrid.append(portfolioItem);
        });
        
        // Re-bind event handlers
        bindPortfolioEvents();
    }

    function updateTimeline(data) {
        const timeline = $('.timeline');
        timeline.empty();
        
        data.forEach(function(item) {
            const timelineItem = `
                <div class="timeline-item">
                    <div class="timeline-date">${item.period}</div>
                    <h3 class="timeline-title">${item.title}</h3>
                    <p class="timeline-desc">${item.description}</p>
                </div>
            `;
            timeline.append(timelineItem);
        });
    }

    function updateProfile(data) {
        // Update profile information
        $('.logo').text(data.name);
        $('.hero h1').html(`Hello, I'm ${data.name}`);
        $('.hero p').text(data.title);
        
        if (data.profileImage) {
            $('.profile-img').html(`<img src="${data.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`);
        }
        
        if (data.about) {
            $('.about-text p').first().text(data.about);
        }
        
        if (data.skills && data.skills.length > 0) {
            const skillsContainer = $('.skills');
            skillsContainer.empty();
            data.skills.forEach(function(skill) {
                skillsContainer.append(`<span class="skill-tag">${skill}</span>`);
            });
        }
    }

    function bindPortfolioEvents() {
        $('.portfolio-item').off('click hover');
        
        $('.portfolio-item').hover(
            function() {
                $(this).find('.portfolio-img').css('transform', 'scale(1.05)');
            },
            function() {
                $(this).find('.portfolio-img').css('transform', 'scale(1)');
            }
        );

        $('.portfolio-item').click(function() {
            const projectId = $(this).data('project');
            loadProjectDetails(projectId);
        });
    }

    function loadProjectDetails(projectId) {
        $.ajax({
            url: `/api/portfolio/${projectId}`,
            method: 'GET',
            success: function(data) {
                // Display project details in a modal or new page
                showProjectModal(data);
            },
            error: function(xhr, status, error) {
                console.error('Error loading project details:', error);
            }
        });
    }

    function showProjectModal(projectData) {
        // Create and show project detail modal
        const modal = `
            <div class="project-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                <div class="modal-content" style="background: white; padding: 2rem; border-radius: 15px; max-width: 800px; width: 90%; max-height: 80%; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h2>${projectData.title}</h2>
                        <button class="close-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                    </div>
                    <div class="modal-body">
                        <img src="${projectData.image}" alt="${projectData.title}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;">
                        <p>${projectData.fullDescription}</p>
                        <div class="project-links" style="margin-top: 1rem;">
                            ${projectData.liveUrl ? `<a href="${projectData.liveUrl}" target="_blank" class="cta-button" style="margin-right: 1rem;">查看網站</a>` : ''}
                            ${projectData.githubUrl ? `<a href="${projectData.githubUrl}" target="_blank" class="cta-button">查看代碼</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modal);
        
        $('.close-modal, .project-modal').click(function(e) {
            if (e.target === this) {
                $('.project-modal').remove();
            }
        });
    }

    // Contact form handling
    $('#contact-form').on('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            message: $('#message').val()
        };
        
        window.portfolioAPI.submitContact(formData);
    });

    // Initialize on page load
    function initializePortfolio() {
        // Load initial data from API
        // Uncomment these when your API is ready
        // window.portfolioAPI.loadProfile();
        // window.portfolioAPI.loadPortfolio();
        // window.portfolioAPI.loadExperience();
        
        console.log('Portfolio site loaded and ready for API integration!');
        console.log('Available API functions:', Object.keys(window.portfolioAPI));
    }

    function copyEmail() {
        navigator.clipboard.writeText('your.email@gmail.com');
        alert('Email 已複製到剪貼簿！');
    }

    initializePortfolio();
});