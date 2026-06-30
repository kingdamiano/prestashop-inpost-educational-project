<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class InPostPaczkaSelectLockerModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        // Отключаем рендеринг шапки и подвала темы для AJAX-ответа
        $this->ajax = true;
        parent::initContent();
    }

    public function displayAjax()
    {
        // Получаем ID выбранного пачкомата из POST-запроса JavaScript
        $lockerId = Tools::getValue('locker_id');

        if (!empty($lockerId)) {
            // Пишем в куку-сессию текущего покупателя
            $this->context->cookie->selected_inpost_locker = $lockerId;
            $this->context->cookie->write();

            // Возвращаем Symfony-совместимый JSON ответ
            header('Content-Type: application/json');
            $this->ajaxRender(json_encode([
                'success' => true,
                'locker' => $lockerId,
                'message' => 'Paczkomat zapisany pomyślnie!'
            ]));
            exit;
        }

        header('Content-Type: application/json');
        $this->ajaxRender(json_encode(['success' => false, 'error' => 'Brak ID paczkomatu']));
        exit;
    }
}
