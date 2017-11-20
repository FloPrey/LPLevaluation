<?php
/**
 * Created by PhpStorm.
 * User: flo
 * Date: 12.10.17
 * Time: 13:03
 */
header('Content-Type: application/json');

$eval1Dir = '../data/';
$eval2Dir = '../data2/';
$eval3Dir = '../data3/';
$eval4Dir = '../data4/';

$eval1json = json_encode(array_diff(scandir($eval1Dir, 1), array('..', '.')));
$eval2json = json_encode(array_diff(scandir($eval2Dir, 1), array('..', '.')));
$eval3json = json_encode(array_diff(scandir($eval3Dir, 1), array('..', '.')));
$eval4json = json_encode(array_diff(scandir($eval4Dir, 1), array('..', '.')));

echo '{"eval1": '.$eval1json.', "eval2": '.$eval2json.', "eval3": '.$eval3json.', "eval4": '.$eval4json.'}';