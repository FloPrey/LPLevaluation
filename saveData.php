<?php
/**
 * Created by PhpStorm.
 * User: flo
 * Date: 25.04.17
 * Time: 21:57
 */
header('Access-Control-Allow-Origin: http://localhost:63342');
header('Access-Control-Allow-Credentials: true');
$postdata = file_get_contents("php://input");
$date = date('d.m.Y-H:i:s-');
$file = fopen('data/'.$date.uniqid().'.json', 'w') or die('{"success": false, "message": "Datei konnte nicht erzeugt werden"}');
if(!fwrite($file, $postdata)) {
    echo '{"success": false, "message": "Datei konnte nicht erzeugt werden"}';
} else {
    fclose($file);
    echo '{"success": true, "message": "Vielen Dank! Deine Daten wurden erfolgreich gespeichert!"}';
}


