<?php

$option = new Application_Model_Option();
$option->find("catalog", "code");
$option->setMobileUri("catalog/mobile_category_list/index")->save();

$option = new Application_Model_Option();
$option->find("set_meal", "code");
$option->setMobileUri("catalog/mobile_setmeal_list/index")->save();
