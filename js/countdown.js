(function () {
    'use strict';

    var WEDDING_DATE = new Date('2026-06-20T16:00:00-06:00');

    var daysEl = document.getElementById('countdown-days');
    var hoursEl = document.getElementById('countdown-hours');
    var minutesEl = document.getElementById('countdown-minutes');
    var secondsEl = document.getElementById('countdown-seconds');

    var prevValues = {
        days: null,
        hours: null,
        minutes: null,
        seconds: null
    };

    function updateCountdown() {
        var now = new Date();
        var diff = WEDDING_DATE - now;

        if (diff <= 0) {
            daysEl.textContent = '0';
            hoursEl.textContent = '0';
            minutesEl.textContent = '0';
            secondsEl.textContent = '0';

            var grid = document.getElementById('countdown-grid');
            if (grid) {
                grid.parentElement.querySelector('.section__subtitle').textContent = '¡Es el gran día!';
            }
            return;
        }

        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (prevValues.days !== days) {
            daysEl.textContent = days;
            tickAnimation(daysEl);
            prevValues.days = days;
        }

        if (prevValues.hours !== hours) {
            hoursEl.textContent = String(hours).padStart(2, '0');
            tickAnimation(hoursEl);
            prevValues.hours = hours;
        }

        if (prevValues.minutes !== minutes) {
            minutesEl.textContent = String(minutes).padStart(2, '0');
            tickAnimation(minutesEl);
            prevValues.minutes = minutes;
        }

        if (prevValues.seconds !== seconds) {
            secondsEl.textContent = String(seconds).padStart(2, '0');
            tickAnimation(secondsEl);
            prevValues.seconds = seconds;
        }
    }

    function tickAnimation(el) {
        var card = el.closest('.countdown__card');
        if (!card) return;
        card.classList.remove('tick');
        void card.offsetWidth;
        card.classList.add('tick');
        setTimeout(function () {
            card.classList.remove('tick');
        }, 400);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
})();