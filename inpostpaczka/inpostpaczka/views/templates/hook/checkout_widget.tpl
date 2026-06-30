<!-- Подключаем открытую JavaScript карту Leaflet (OpenStreetMap) -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>

<!-- Скрываем контейнер по умолчанию, пока JS не перенесет его в нужное место чеккаута -->
<div id="inpost-holder-global" style="display: none;">
    <div class="inpost-locker-wrapper" style="margin: 20px 0; padding: 15px; background: #fffde7; border: 2px solid #ffcc00; border-radius: 6px; clear: both; width: 100%;">
        <p style="font-weight: bold; margin-bottom: 12px; color: #222; font-size: 15px;">Wybierz Twoj Paczkomat InPost na mapie:</p>
        <input type="text" id="inpost-address-search" placeholder="Wpisz adres" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #333; border-radius: 4px; font-size: 14px;">
        <div id="inpost-custom-map" style="width: 100%; height: 420px; background: #eee; border: 1px solid #ccc; border-radius: 4px;"></div>

        <div id="locker-info-block" style="margin-top: 12px; font-weight: bold; color: #1b5e20; display: none; font-size: 14px;">
            Wybrany Paczkomat: <span id="locker-name-display" style="background: #e8f5e9; padding: 5px 10px; border-radius: 3px; border: 1px solid #c8e6c9;"></span>
        </div>

        <input type="hidden" id="selected_paczkomat" name="selected_paczkomat" value="">
    </div>
</div>

<!-- Прокидываем URL AJAX-контроллера в JS. Весь остальной код — во внешнем файле,
     чтобы фигурные скобки JS не ломали парсер Smarty. -->
<script>
    window.INPOST_AJAX_URL = "{$ajax_url|escape:'javascript':'UTF-8'}";
    window.INPOST_MODULE_PATH = "{$module_path|escape:'javascript':'UTF-8'}img/";
</script>
<script src="{$inpost_js|escape:'html':'UTF-8'}"></script>
