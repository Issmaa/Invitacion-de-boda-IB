(function () {
    'use strict';

    function initScrollReveal() {
        var revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        if (!('IntersectionObserver' in window)) {
            revealElements.forEach(function (el) {
                el.classList.add('visible');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(function (el) {
            observer.observe(el);
        });
    }

    function initVenueCardReveal() {
        var cards = document.querySelectorAll('.venue-card');
        if (!cards.length) return;

        if (!('IntersectionObserver' in window)) {
            cards.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        cards.forEach(function (card) { observer.observe(card); });
    }

    function initGalleryReveal() {
        var items = document.querySelectorAll('.gallery__item');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        items.forEach(function (item) { observer.observe(item); });
    }

    function initGuidelineCardReveal() {
        var cards = document.querySelectorAll('.guideline-card');
        if (!cards.length) return;

        if (!('IntersectionObserver' in window)) {
            cards.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        cards.forEach(function (card) { observer.observe(card); });
    }

    function initTimelineReveal() {
        var items = document.querySelectorAll('.timeline__item');
        if (!items.length) return;

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        items.forEach(function (item) { observer.observe(item); });
    }

    function initSwatchReveal() {
        var swatches = document.querySelectorAll('.dress-code__swatch');
        if (!swatches.length) return;

        if (!('IntersectionObserver' in window)) {
            swatches.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var swatchesInView = entry.target.parentElement.querySelectorAll('.dress-code__swatch');
                    swatchesInView.forEach(function (swatch, index) {
                        setTimeout(function () {
                            swatch.classList.add('visible');
                        }, index * 80);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        swatches.forEach(function (swatch) { observer.observe(swatch); });
    }

    function init() {
        initScrollReveal();
        initVenueCardReveal();
        initGalleryReveal();
        initGuidelineCardReveal();
        initTimelineReveal();
        initSwatchReveal();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();