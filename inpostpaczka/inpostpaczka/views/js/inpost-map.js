(function () {
    'use strict';

    var POINTS_API = 'https://api-shipx-pl.easypack24.net/v1/points';
    var GEOCODE_API = 'https://nominatim.openstreetmap.org/search';
    var mapInstance = null;
    var lockersLayer = null;
    var addedLockers = {};
    var mapInitialized = false;

    function injectMarkerFadeStyle() {
        if (document.getElementById('inpost-marker-style')) return;
        var style = document.createElement('style');
        style.id = 'inpost-marker-style';
        style.textContent = '.leaflet-marker-icon{box-shadow:none !important;text-shadow:none !important;filter:none !important;transition:opacity 0.4s ease;}';
        document.head.appendChild(style);
    }

    function initMap() {
        if (mapInitialized || typeof L === 'undefined') return;

        mapInitialized = true;
        mapInstance = L.map('inpost-custom-map').setView([52.2297, 21.0122], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance);

        injectMarkerFadeStyle();
        lockersLayer = L.layerGroup().addTo(mapInstance);
        addedLockers = {};

        mapInstance.on('moveend', function () { loadLockers(); });
        loadLockers();
        attachClickListeners();
        attachSearchListener();
    }

    function viewportRadius() {
        if (!mapInstance) return 50000;
        var bounds = mapInstance.getBounds();
        var center = bounds.getCenter();
        var radius = Math.round(center.distanceTo(bounds.getNorthEast()));
        return Math.min(radius, 150000);
    }

    function buildPopup(point) {
        var address = (point.address && point.address.line1) ? point.address.line1 : '';
        return '<div style="font-family:sans-serif;font-size:13px;min-width:150px;"><b>Paczkomat: ' + point.name + '</b><br>' + address + '<br><br>' +
            '<button type="button" class="btn select-locker-btn" data-id="' + point.name + '" style="padding:5px;background:#ffcc00;border:none;color:#000;font-weight:bold;width:100%;cursor:pointer;">Wybierz</button></div>';
    }

    function loadLockers(center) {
        if (!mapInstance) return;
        center = center || mapInstance.getCenter();
        var url = POINTS_API + '?relative_point=' + center.lat + ',' + center.lng + '&max_distance=' + viewportRadius() + '&type=parcel_locker&status=Operating&per_page=100';

        fetch(url).then(function (r) { return r.json(); }).then(function (data) {
            if (!data || !data.items) return;
            data.items.forEach(function (point) {
                if (!point.location || addedLockers[point.name]) return;
                addedLockers[point.name] = true;
                var marker = L.marker([point.location.latitude, point.location.longitude], { opacity: 0 });
                marker.bindPopup(buildPopup(point));
                lockersLayer.addLayer(marker);
                setTimeout(function () { marker.setOpacity(1); }, 100);
            });
        });
    }

    function attachClickListeners() {
        document.addEventListener('click', function (e) {
            if (!e.target || !e.target.classList.contains('select-locker-btn')) return;
            var lockerId = e.target.getAttribute('data-id');
            document.getElementById('selected_paczkomat').value = lockerId;
            document.getElementById('locker-name-display').innerText = lockerId;
            document.getElementById('locker-info-block').style.display = 'block';
            if (window.INPOST_AJAX_URL) {
                fetch(window.INPOST_AJAX_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'locker_id=' + encodeURIComponent(lockerId) });
            }
            if (mapInstance) mapInstance.closePopup();
        });
    }

    function attachSearchListener() {
        var searchInput = document.getElementById('inpost-address-search');
        if (!searchInput) return;

        var suggestionsList = document.createElement('ul');
        suggestionsList.id = 'inpost-suggestions';
        suggestionsList.style.cssText = 'position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #333; border-top: none; border-radius: 0 0 4px 4px; list-style: none; margin: 0; padding: 0; max-height: 200px; overflow-y: auto; z-index: 1000; display: none;';
        searchInput.parentNode.insertBefore(suggestionsList, searchInput.nextSibling);

        var searchContainer = searchInput.parentNode;
        searchContainer.style.position = 'relative';

        var searchTimer;
        searchInput.addEventListener('input', function () {
            clearTimeout(searchTimer);
            var query = this.value.trim();

            if (query.length < 2) {
                suggestionsList.style.display = 'none';
                return;
            }

            searchTimer = setTimeout(function () {
                fetch(GEOCODE_API + '?q=' + encodeURIComponent(query) + '&format=json&limit=5&countrycodes=pl')
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        suggestionsList.innerHTML = '';

                        if (!data || !data.length) {
                            suggestionsList.style.display = 'none';
                            return;
                        }

                        data.forEach(function (result) {
                            var li = document.createElement('li');
                            li.style.cssText = 'padding: 10px; border-bottom: 1px solid #eee; cursor: pointer; hover: background: #f0f0f0;';
                            li.textContent = result.display_name;

                            li.addEventListener('mouseover', function () {
                                this.style.background = '#f0f0f0';
                            });
                            li.addEventListener('mouseout', function () {
                                this.style.background = 'white';
                            });

                            li.addEventListener('click', function () {
                                searchInput.value = result.display_name;
                                suggestionsList.style.display = 'none';

                                if (!mapInstance) initMap();
                                mapInstance.setView([parseFloat(result.lat), parseFloat(result.lon)], 13);
                                addedLockers = {};
                                lockersLayer.clearLayers();
                                loadLockers(L.latLng(parseFloat(result.lat), parseFloat(result.lon)));
                            });

                            suggestionsList.appendChild(li);
                        });

                        suggestionsList.style.display = 'block';
                    });
            }, 300);
        });

        searchInput.addEventListener('blur', function () {
            setTimeout(function () {
                suggestionsList.style.display = 'none';
            }, 200);
        });
    }

    function addIconToLabel(label, iconType) {
        if (!label || label.querySelector('.inpost-label-icon')) return;

        var icon = document.createElement('img');
        icon.className = 'inpost-label-icon';
        icon.style.cssText = 'width: 50px; height: 50px; flex-shrink: 0; margin-right: -20px;';

        var inpostSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="8" y="16" width="48" height="32" rx="2" fill="#ffcc00" stroke="#333" stroke-width="2"/><rect x="12" y="20" width="10" height="10" rx="1" fill="#333"/><rect x="26" y="20" width="10" height="10" rx="1" fill="#333"/><rect x="40" y="20" width="10" height="10" rx="1" fill="#333"/><rect x="12" y="34" width="10" height="10" rx="1" fill="#333"/><rect x="26" y="34" width="10" height="10" rx="1" fill="#333"/><rect x="40" y="34" width="10" height="10" rx="1" fill="#333"/></svg>';
        var storeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 24h48v28H8z" fill="#4CAF50" stroke="#333" stroke-width="2"/><path d="M16 24v-8h32v8" fill="none" stroke="#333" stroke-width="2"/><path d="M32 8l-16 16h48z" fill="#4CAF50" stroke="#333" stroke-width="2"/><rect x="14" y="32" width="8" height="12" fill="#87CEEB" stroke="#333" stroke-width="1.5"/><rect x="28" y="32" width="8" height="12" fill="#87CEEB" stroke="#333" stroke-width="1.5"/><rect x="42" y="32" width="8" height="12" fill="#87CEEB" stroke="#333" stroke-width="1.5"/><rect x="20" y="48" width="24" height="4" fill="#8B4513" stroke="#333" stroke-width="1.5"/></svg>';

        var svgString = iconType === 'inpost' ? inpostSvg : storeSvg;
        icon.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgString);

        label.insertBefore(icon, label.firstChild);
    }

    function setupWidget() {
        var widget = document.getElementById('inpost-holder-global');
        console.log('[InPost] setupWidget - widget found?', !!widget);

        // Smarty парсер удаляет input элементы, создаём его динамически
        if (widget && !document.getElementById('inpost-address-search')) {
            var searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = 'inpost-address-search';
            searchInput.placeholder = 'Wpisz adres';
            searchInput.style.cssText = 'width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #333; border-radius: 4px; font-size: 14px;';

            var wrapperDiv = widget.querySelector('.inpost-locker-wrapper');
            var mapDiv = widget.querySelector('#inpost-custom-map');
            if (wrapperDiv && mapDiv) {
                mapDiv.parentNode.insertBefore(searchInput, mapDiv);
                console.log('[InPost] Created search input dynamically');
            }
        }

        var radios = document.querySelectorAll('input[type="radio"]');
        if (!radios.length) return;

        var inpostRadio = null;
        var clickCollectRadio = null;

        var radios = document.querySelectorAll('input[type="radio"]');
        if (!radios.length) return;

        var inpostRadio = null;
        var clickCollectRadio = null;

        for (var i = 0; i < radios.length; i++) {
            var label = document.querySelector('label[for="' + radios[i].id + '"]');
            var text = label ? label.textContent : '';
            if (text.indexOf('InPost') !== -1) inpostRadio = radios[i];
            if (text.indexOf('Click and collect') !== -1) clickCollectRadio = radios[i];
        }

        if (!inpostRadio) return;

        console.log('[InPost] Before insertBefore - searchInput exists?', !!document.getElementById('inpost-address-search'));

        var label = document.querySelector('label[for="' + inpostRadio.id + '"]');
        var wrapper = label.closest('.delivery-option') || label.closest('li') || label.parentElement;
        if (wrapper && wrapper.parentElement) {
            wrapper.parentElement.insertBefore(widget, wrapper.nextSibling);
        }

        console.log('[InPost] After insertBefore - searchInput exists?', !!document.getElementById('inpost-address-search'));

        widget.style.display = inpostRadio.checked ? 'block' : 'none';

        radios.forEach(function (radio) {
            radio.addEventListener('change', function () {
                var isInPost = this === inpostRadio;
                widget.style.display = isInPost ? 'block' : 'none';

                if (isInPost && !mapInitialized) {
                    setTimeout(function () {
                        initMap();
                        if (mapInstance) mapInstance.invalidateSize();
                    }, 300);
                }
            });
        });

        if (!inpostRadio.checked && clickCollectRadio) {
            clickCollectRadio.checked = true;
        } else if (inpostRadio.checked && !mapInitialized) {
            setTimeout(function () {
                initMap();
                if (mapInstance) mapInstance.invalidateSize();
            }, 300);
        }
    }

    var checkAttempts = 0;
    var setupInterval = setInterval(function () {
        var radios = document.querySelectorAll('input[type="radio"]');
        checkAttempts++;

        if (radios.length > 0) {
            clearInterval(setupInterval);
            setupWidget();
        }
        if (checkAttempts > 150) clearInterval(setupInterval);
    }, 100);
})();
