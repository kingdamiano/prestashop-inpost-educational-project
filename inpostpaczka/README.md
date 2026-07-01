# InPost Paczkomaty Integration

## English

### Module Description
InPost Paczkomaty Integration — A PrestaShop 8 module that integrates InPost parcel lockers (Paczkomaty) into the checkout process, allowing customers to select their preferred pickup location via an interactive map interface.

### Features
- **Interactive Leaflet Map**: Browse InPost parcel lockers in real-time with visual markers and location clustering
- **Address Search**: Find lockers near a specific address using Nominatim geocoding service
- **Locker Selection & Persistence**: Selected locker information is saved to the customer session and retained through checkout
- **Auto-Carrier Setup**: Carrier is automatically created and configured during module installation
- **Pre-Payment Validation**: Ensures a valid locker is selected before payment processing begins

### Requirements
- PrestaShop 8.0 or higher
- PHP 7.4 or higher
- Internet connection for API access (InPost ShipX, Nominatim, OpenStreetMap)

### Installation
1. Download or clone the module files
2. Upload the `inpostpaczka` directory to `/modules/`
3. Log in to your PrestaShop admin panel
4. Navigate to **Modules & Services > Modules & Services**
5. Search for "InPost Paczkomaty Integration" and click **Install**
6. Configure API credentials in module settings (InPost ShipX API key)

### How It Works
When a customer reaches the checkout page, the module displays an interactive map powered by Leaflet and OpenStreetMap tiles. Customers can search for addresses using Nominatim to locate nearby InPost parcel lockers, then click a marker to select their preferred pickup point. The selected locker details are stored in the session for order processing. Before payment, the system validates that a locker has been selected—if not, checkout is blocked, ensuring every order has a valid delivery destination.

### Tech Stack
- **Backend**: PHP 7.4+, PrestaShop Module API, Composer (dependency management)
- **Frontend**: JavaScript (vanilla ES6), Leaflet.js library, Bootstrap (styling)
- **Templating**: Smarty (PrestaShop template engine)
- **External APIs**: InPost ShipX API, Nominatim Geocoding API, OpenStreetMap tiles
- **Maps & Geolocation**: Leaflet with OpenStreetMap

### Note
This is an educational project built with AI-assisted development (Claude Code). Architecture decisions, integration logic, and testing were conducted manually to ensure production-quality standards.

---

## Polski

### Opis Modułu
InPost Paczkomaty Integration — Moduł PrestaShop 8 integrujący paczkomaty InPost do procesu checkout, umożliwiający klientom wybranie preferowanej lokalizacji do odbioru za pośrednictwem interaktywnej mapy.

### Funkcjonalności
- **Interaktywna mapa Leaflet**: Przeglądaj paczkomaty InPost w czasie rzeczywistym z wizualnymi markerami i grupowaniem lokalizacji
- **Wyszukiwanie adresu**: Znajduj paczkomaty w pobliżu danego adresu za pomocą usługi geokodowania Nominatim
- **Wybór paczkomatu i trwałość**: Informacje o wybranym paczkomacie są zapisywane w sesji klienta i utrzymywane podczas procesu zakupu
- **Automatyczne tworzenie kuriera**: Kurier jest automatycznie tworzony i konfigurowany podczas instalacji modułu
- **Walidacja przed płatnością**: Zapewnia, że ważny paczkomat został wybrany przed przetworzeniem płatności

### Wymagania
- PrestaShop 8.0 lub nowszy
- PHP 7.4 lub nowszy
- Połączenie internetowe dla dostępu do API (InPost ShipX, Nominatim, OpenStreetMap)

### Instalacja
1. Pobierz lub sklonuj pliki modułu
2. Wyślij katalog `inpostpaczka` do `/modules/`
3. Zaloguj się do panelu administracyjnego PrestaShop
4. Przejdź do **Moduły i usługi > Moduły i usługi**
5. Wyszukaj "InPost Paczkomaty Integration" i kliknij **Instaluj**
6. Skonfiguruj dane uwierzytelniające API w ustawieniach modułu (klucz API InPost ShipX)

### Jak to Działa
Gdy klient przechodzi do kasy, moduł wyświetla interaktywną mapę napędzaną przez Leaflet i kafelki OpenStreetMap. Klienci mogą wyszukiwać adresy za pomocą Nominatim, aby znaleźć pobliskie paczkomaty InPost, a następnie kliknąć marker, aby wybrać preferowany punkt odbioru. Szczegóły wybranego paczkomatu są przechowywane w sesji do przetworzenia zamówienia. Przed płatnością system waliduje, czy paczkomat został wybrany — jeśli nie, proces zakupu jest blokowany, zapewniając, że każde zamówienie ma ważny punkt dostawy.

### Stos Technologiczny
- **Backend**: PHP 7.4+, PrestaShop Module API, Composer (zarządzanie zależnościami)
- **Frontend**: JavaScript (vanilla ES6), biblioteka Leaflet.js, Bootstrap (stylizacja)
- **Szablonowanie**: Smarty (silnik szablonów PrestaShop)
- **Zewnętrzne API**: InPost ShipX API, Nominatim Geocoding API, kafelki OpenStreetMap
- **Mapy i geolokalizacja**: Leaflet z OpenStreetMap

### Uwaga
To projekt edukacyjny opracowany przy użyciu wspomagania AI (Claude Code). Decyzje architektoniczne, logika integracji i testowanie zostały przeprowadzone ręcznie w celu zapewnienia standardów jakości produkcyjnej.
