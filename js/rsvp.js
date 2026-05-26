import { GOOGLE_SCRIPT_URL } from './config.js';
(function () {
    'use strict';

    var state = {
        step: 'search',
        selectedGuest: null,
        searchResults: []
    };

    var searchInput = document.getElementById('rsvp-search-input');
    var searchBtn = document.getElementById('rsvp-search-btn');
    var searchError = document.getElementById('rsvp-search-error');
    var searchPanel = document.getElementById('rsvp-search');
    var resultsPanel = document.getElementById('rsvp-results');
    var resultsList = document.getElementById('rsvp-results-list');
    var detailPanel = document.getElementById('rsvp-detail');
    var detailName = document.getElementById('rsvp-detail-name');
    var detailSubtitle = document.getElementById('rsvp-detail-subtitle');
    var detailGuests = document.getElementById('rsvp-detail-guests');
    var detailAlready = document.getElementById('rsvp-detail-already');
    var detailActions = document.getElementById('rsvp-detail-actions');
    var confirmBtn = document.getElementById('rsvp-confirm-btn');
    var declineBtn = document.getElementById('rsvp-decline-btn');
    var declinePanel = document.getElementById('rsvp-decline');
    var declineMessage = document.getElementById('rsvp-decline-message');
    var sendDeclineBtn = document.getElementById('rsvp-send-decline-btn');
    var backBtn = document.getElementById('rsvp-back-btn');
    var backSearchDetailBtn = document.getElementById('rsvp-back-search-detail-btn');
    var backSearchAlreadyBtn = document.getElementById('rsvp-back-search-already-btn');
    var backSearchDeclineBtn = document.getElementById('rsvp-back-search-decline-btn');
    var successPanel = document.getElementById('rsvp-success');
    var successTitle = document.getElementById('rsvp-success-title');
    var successText = document.getElementById('rsvp-success-text');

    function init() {
        if (!searchInput) return;

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
        searchInput.addEventListener('input', function () {
            searchInput.classList.remove('rsvp__input--error');
            searchError.textContent = '';
        });

        confirmBtn.addEventListener('click', handleConfirm);
        declineBtn.addEventListener('click', handleDecline);
        sendDeclineBtn.addEventListener('click', handleSendDecline);
        backBtn.addEventListener('click', handleBack);
        backSearchDetailBtn.addEventListener('click', handleBackToSearch);
        backSearchAlreadyBtn.addEventListener('click', handleBackToSearch);
        backSearchDeclineBtn.addEventListener('click', handleBackToSearch);
    }

    function showPanel(panelId) {
        var panels = ['rsvp-search', 'rsvp-results', 'rsvp-detail', 'rsvp-decline', 'rsvp-success'];
        panels.forEach(function (id) {
            var el = document.getElementById(id);
            if (id === panelId) {
                el.classList.add('visible');
                el.setAttribute('aria-hidden', 'false');
            } else {
                el.classList.remove('visible');
                el.setAttribute('aria-hidden', 'true');
            }
        });
    }

    function handleSearch() {
        var query = searchInput.value.trim();
        clearError();

        if (!query) {
            showError('Por favor ingresa tu nombre');
            searchInput.classList.add('rsvp__input--error');
            return;
        }

        if (query.length < 2) {
            showError('Escribe al menos 2 letras');
            searchInput.classList.add('rsvp__input--error');
            return;
        }

        searchInput.classList.remove('rsvp__input--error');
        setLoading(searchBtn, true);

        if (GOOGLE_SCRIPT_URL) {
            fetchGuests(query);
        } else {
            setTimeout(function () {
                setLoading(searchBtn, false);
                showDemoResults(query);
            }, 800);
        }
    }

    function fetchGuests(query) {
        var url = GOOGLE_SCRIPT_URL + '?action=search&query=' + encodeURIComponent(query);

        fetch(url)
            .then(function (response) { return response.json(); })
            .then(function (data) {
                setLoading(searchBtn, false);
                if (data.results && data.results.length > 0) {
                    state.searchResults = data.results;
                    showResults(data.results);
                } else {
                    showError('No encontramos ese nombre. Verifica que esté escrito como aparece en tu invitación.');
                }
            })
            .catch(function () {
                setLoading(searchBtn, false);
                showError('Error de conexión. Por favor intenta de nuevo.');
            });
    }

    function normalize(str) {
        if (!str) return '';
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function levenshtein(a, b) {
        var m = a.length;
        var n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        var d = [];
        for (var i = 0; i <= m; i++) { d[i] = [i]; }
        for (var j = 0; j <= n; j++) { d[0][j] = j; }
        for (var i = 1; i <= m; i++) {
            for (var j = 1; j <= n; j++) {
                var cost = a[i - 1] === b[j - 1] ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
            }
        }
        return d[m][n];
    }

    function fuzzyMatch(query, text) {
        var q = normalize(query);
        var t = normalize(text);
        if (!q || !t) return false;

        // Coincidencia parcial exacta (sin acentos)
        if (t.indexOf(q) !== -1) return true;

        // Buscar por palabra con tolerancia a errores
        var words = t.split(/\s+/);
        var maxDist = Math.max(1, Math.floor(q.length / 3));

        for (var i = 0; i < words.length; i++) {
            if (levenshtein(q, words[i]) <= maxDist) return true;
        }

        return false;
    }

    function matchesName(guest, query) {
        return fuzzyMatch(query, guest.nombre);
    }

    function showDemoResults(query) {
        var demoGuests = [
            {
                id: 2,
                nombre: 'Ismael López',
                limiteAcompanantes: 2,
                mesa: '5',
                confirmado: ''
            },
            {
                id: 3,
                nombre: 'Gustavo Hernández',
                limiteAcompanantes: 1,
                mesa: '1',
                confirmado: ''
            }
        ];

        var filtered = demoGuests.filter(function (g) {
            return matchesName(g, query);
        });

        if (filtered.length === 0) {
            showError('No encontramos ese nombre. Verifica que esté escrito como aparece en tu invitación.');
            return;
        }

        state.searchResults = filtered;
        showResults(filtered);
    }

    function showResults(results) {
        resultsList.innerHTML = '';

        results.forEach(function (guest) {
            var totalGuests = 1 + (guest.limiteAcompanantes || 0);
            var item = document.createElement('button');
            item.className = 'rsvp__result-item';
            item.innerHTML =
                '<div>' +
                    '<div class="rsvp__result-item-name">' + escapeHtml(guest.nombre) + '</div>' +
                    '<div class="rsvp__result-item-guests">' + totalGuests + (totalGuests === 1 ? ' pase' : ' pases') + '</div>' +
                '</div>' +
                '<div class="rsvp__result-item-arrow">' +
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>' +
                '</div>';

            item.addEventListener('click', function () {
                selectGuest(guest);
            });

            resultsList.appendChild(item);
        });

        showPanel('rsvp-results');
    }

    function selectGuest(guest) {
        state.selectedGuest = guest;

        detailName.textContent = guest.nombre;

        var totalGuests = 1 + (guest.limiteAcompanantes || 0);
        detailSubtitle.textContent = totalGuests + (totalGuests === 1 ? ' pase' : ' pases') + (guest.mesa ? ' \u00B7 Mesa ' + guest.mesa : '');

        var guestsHTML = '';
        guestsHTML += '<div class="rsvp__detail-guest rsvp__detail-guest--principal">' +
            '<div class="rsvp__detail-guest-icon">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' +
            '</div>' +
            '<span class="rsvp__detail-guest-name">' + escapeHtml(guest.nombre) + '</span>' +
        '</div>';

        if (guest.limiteAcompanantes && guest.limiteAcompanantes > 0) {
            guestsHTML += '<div class="rsvp__detail-companions-selection" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: var(--spacing-xs);">' +
                '<label for="rsvp-companions-select" class="rsvp__detail-guest-name" style="font-size: 0.85rem; color: var(--sage-light); font-weight: 500;">Selecciona el número de acompañantes que asistirán:</label>' +
                '<select id="rsvp-companions-select" class="rsvp__select">';
            
            for (var i = 0; i <= guest.limiteAcompanantes; i++) {
                var selectedAttr = (i === guest.limiteAcompanantes) ? ' selected' : '';
                guestsHTML += '<option value="' + i + '"' + selectedAttr + '>' + i + (i === 1 ? ' acompañante' : ' acompañantes') + '</option>';
            }
            
            guestsHTML += '</select>' +
            '</div>';
        }

        detailGuests.innerHTML = guestsHTML;

        if (guest.confirmado && guest.confirmado.toUpperCase() === 'SI') {
            detailAlready.classList.add('visible');
            detailAlready.setAttribute('aria-hidden', 'false');
            detailActions.classList.add('hidden');
            backSearchAlreadyBtn.classList.add('visible');
        } else {
            detailAlready.classList.remove('visible');
            detailAlready.setAttribute('aria-hidden', 'true');
            detailActions.classList.remove('hidden');
            backSearchAlreadyBtn.classList.remove('visible');
        }

        showPanel('rsvp-detail');
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function handleConfirm() {
        if (!state.selectedGuest) return;
        setLoading(confirmBtn, true);

        var selectEl = document.getElementById('rsvp-companions-select');
        var acompsConfirmados = selectEl ? parseInt(selectEl.value, 10) : 0;

        var data = {
            action: 'confirm',
            id: state.selectedGuest.id,
            confirmado: 'SI',
            acompanantesConfirmados: acompsConfirmados,
            mensaje: '',
            fechaConfirmacion: new Date().toISOString()
        };

        submitResponse(data, function () {
            setLoading(confirmBtn, false);
            successTitle.textContent = '\u00A1Confirmaci\u00F3n Recibida!';
            
            var text = 'Gracias, ' + state.selectedGuest.nombre.split(' ')[0] + '. Nos alegra mucho que nos acompañarás';
            if (acompsConfirmados > 0) {
                text += ' junto con tu' + (acompsConfirmados === 1 ? ' acompañante' : 's ' + acompsConfirmados + ' acompañantes') + '.';
            } else {
                text += '.';
            }
            text += ' ¡Te esperamos!';
            
            successText.textContent = text;
            showPanel('rsvp-success');
            successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function handleDecline() {
        declineMessage.value = '';
        showPanel('rsvp-decline');
        declinePanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function handleSendDecline() {
        if (!state.selectedGuest) return;
        setLoading(sendDeclineBtn, true);

        var data = {
            action: 'decline',
            id: state.selectedGuest.id,
            confirmado: 'NO',
            acompanantesConfirmados: 0,
            mensaje: declineMessage.value.trim(),
            fechaConfirmacion: new Date().toISOString()
        };

        submitResponse(data, function () {
            setLoading(sendDeclineBtn, false);
            successTitle.textContent = 'Respuesta Recibida';
            successText.textContent = 'Lamentamos que no puedas acompañarnos, ' + state.selectedGuest.nombre.split(' ')[0] + '. Te tenemos en nuestros corazones.';
            showPanel('rsvp-success');
            successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    function handleBack() {
        showPanel('rsvp-detail');
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function handleBackToSearch() {
        searchInput.value = '';
        clearError();
        searchInput.classList.remove('rsvp__input--error');
        state.selectedGuest = null;
        showPanel('rsvp-search');
        searchInput.focus();
        searchPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function submitResponse(data, onSuccess) {
        if (GOOGLE_SCRIPT_URL) {
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(function () { onSuccess(); })
            .catch(function () { onSuccess(); });
        } else {
            setTimeout(onSuccess, 1000);
        }
    }

    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    function showError(message) {
        searchError.textContent = message;
    }

    function clearError() {
        searchError.textContent = '';
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();