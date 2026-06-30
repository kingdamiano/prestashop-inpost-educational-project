<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class InPostPaczka extends Module
{
    public function __construct()
    {
        $this->name = 'inpostpaczka';
        $this->tab = 'shipping_logistics';
        $this->version = '1.0.0';
        $this->author = 'DevMaster';
        $this->need_instance = 0;
        $this->ps_versions_compliancy = ['min' => '8.0.0', 'max' => _PS_VERSION_];
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = 'InPost Paczkomaty Integration';
        $this->description = 'Интеграция карты Пачкоматов для e-commerce Польши.';
    }

    public function install()
    {
        return parent::install()
            && $this->registerHook('displayBeforeCarrier')
            && $this->registerHook('actionCarrierProcess')
            && $this->installCarrier();
    }

    public function uninstall()
    {
        $carrierId = (int) Configuration::get('INPOST_CARRIER_ID');
        if ($carrierId) {
            $carrier = new Carrier($carrierId);
            if (Validate::isLoadedObject($carrier)) {
                $carrier->delete();
            }
        }
        Configuration::deleteByName('INPOST_CARRIER_ID');
        Configuration::deleteByName('INPOST_CARRIER_REFERENCE');

        return parent::uninstall();
    }

    // Создаём перевозчика "InPost Paczkomaty", чтобы он появился в списке способов доставки
    private function installCarrier()
    {
        $carrier = new Carrier();
        $carrier->name = 'InPost Paczkomaty';
        $carrier->is_module = true;
        $carrier->active = true;
        $carrier->range_behavior = 0;
        $carrier->need_range = true;
        $carrier->shipping_external = true;
        $carrier->external_module_name = $this->name;
        $carrier->shipping_method = Carrier::SHIPPING_METHOD_PRICE;
        $carrier->url = '';

        foreach (Language::getLanguages(false) as $lang) {
            $carrier->delay[(int) $lang['id_lang']] = 'Dostawa do Paczkomatu InPost (1-2 dni robocze)';
        }

        if (!$carrier->add()) {
            return false;
        }

        // Привязываем ко всем группам клиентов
        $groupIds = [];
        foreach (Group::getGroups((int) $this->context->language->id) as $group) {
            $groupIds[] = (int) $group['id_group'];
        }
        $carrier->setGroups($groupIds);

        // Ценовой и весовой диапазоны — без них перевозчик не отображается на чеккауте
        $rangePrice = new RangePrice();
        $rangePrice->id_carrier = (int) $carrier->id;
        $rangePrice->delimiter1 = '0';
        $rangePrice->delimiter2 = '1000000';
        $rangePrice->add();

        $rangeWeight = new RangeWeight();
        $rangeWeight->id_carrier = (int) $carrier->id;
        $rangeWeight->delimiter1 = '0';
        $rangeWeight->delimiter2 = '1000000';
        $rangeWeight->add();

        // Привязываем перевозчика ко всем зонам доставки
        foreach (Zone::getZones() as $zone) {
            $carrier->addZone((int) $zone['id_zone']);
        }

        // Строки в таблице delivery создаются автоматически при добавлении диапазонов (с ценой 0),
        // поэтому ОБНОВЛЯЕМ цену нашего ценового диапазона до 9.99 по всем зонам, а не вставляем
        // новые строки — иначе появятся дубли и перевозчик может показать цену 0.
        Db::getInstance()->update(
            'delivery',
            ['price' => '9.99'],
            'id_carrier = ' . (int) $carrier->id . ' AND id_range_price = ' . (int) $rangePrice->id
        );

        // Перечитываем перевозчика: id_reference проставляется в БД внутри add(),
        // но не обновляется в исходном объекте в памяти.
        $savedCarrier = new Carrier((int) $carrier->id);

        Configuration::updateValue('INPOST_CARRIER_ID', (int) $savedCarrier->id);
        Configuration::updateValue('INPOST_CARRIER_REFERENCE', (int) $savedCarrier->id_reference);

        return true;
    }

    public function hookDisplayBeforeCarrier($params)
    {
        $this->context->smarty->assign([
            'ajax_url' => $this->context->link->getModuleLink('inpostpaczka', 'selectLocker'),
            'inpost_js' => $this->_path . 'views/js/inpost-map.js',
            'module_path' => $this->_path,
        ]);

        return $this->display(__FILE__, 'views/templates/hook/checkout_widget.tpl');
    }

    public function hookActionCarrierProcess($params)
    {
        if (empty($params['cart'])) {
            return;
        }

        $cart = $params['cart'];
        $inpostReference = (int) Configuration::get('INPOST_CARRIER_REFERENCE');

        $selectedCarrier = new Carrier((int) $cart->id_carrier);
        if (!Validate::isLoadedObject($selectedCarrier)) {
            return;
        }

        // Ошибку показываем только когда выбран именно наш Paczkomat, но пункт ещё не выбран на карте
        if ((int) $selectedCarrier->id_reference === $inpostReference
            && empty($this->context->cookie->selected_inpost_locker)) {
            $this->context->controller->errors[] = 'Proszę wybrać Paczkomat na mapie przed przejściem do płatności!';
        }
    }

    public function getOrderShippingCost($params, $shipping_cost)
    {
        return (float) $shipping_cost;
    }
}
