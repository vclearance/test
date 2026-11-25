/* Анимация появления контента при прокрутке.
   Заголовки появляются по словам, остальные блоки — плавно снизу, с каскадом.
   Без JS или при prefers-reduced-motion всё просто видно сразу. */
(function () {
    'use strict';
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var TEXT_SEL = '.page-head h1, .hero h1, .section-title, .block-head h2, .join-text h2, .cta-band h3, .hero-statement';
    var BLOCK_SEL = [
        '.lead', '.block-lead', '.hero-btn-group', '.hero-logos-container',
        '.fact', '.cell', '.step', '.spec-row', '.feature-item', '.faq-item', '.faq-aside',
        '.cta-band', '.join-container', '.note', '.about-photo', '.livemap-legend',
        '.roster-sidebar', '.top-active-card', '.carousel-container',
        '.footer-col', '.footer-bottom'
    ].join(',');

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    // Разбиваем заголовок на слова (только если внутри чистый текст)
    function splitWords(el) {
        if (el.children.length || !el.textContent.trim()) return false;
        var words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        words.forEach(function (w, i) {
            var outer = document.createElement('span');
            outer.className = 'rv-word';
            var inner = document.createElement('span');
            inner.style.transitionDelay = (i * 130) + 'ms';
            inner.textContent = w;
            outer.appendChild(inner);
            el.appendChild(outer);
            if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        });
        return true;
    }

    function init() {
        // Заголовки
        document.querySelectorAll(TEXT_SEL).forEach(function (el) {
            if (el.dataset.rv) return;
            el.dataset.rv = '1';
            if (splitWords(el)) el.classList.add('rv-text');
            else el.classList.add('rv');
            io.observe(el);
        });

        // Блоки: каскад внутри одного родителя
        document.querySelectorAll(BLOCK_SEL).forEach(function (el) {
            if (el.dataset.rv || el.closest('.rv-text')) return;
            el.dataset.rv = '1';
            var siblings = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) {
                return c.matches(BLOCK_SEL);
            }) : [];
            var idx = Math.max(0, siblings.indexOf(el));
            el.style.setProperty('--rv-delay', Math.min(idx, 8) * 170 + 'ms');
            el.classList.add('rv');
            io.observe(el);
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
