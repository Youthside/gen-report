<?php
header("Content-Type: application/json");
// avrupua saati
date_default_timezone_set('Europe/Istanbul');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

$cacheFile = __DIR__ . '/../cache/all-data.json';

if (file_exists($cacheFile)) {
    $lastModified = filemtime($cacheFile); // Son yazılma zamanı (timestamp)
    echo json_encode([
        "last_sync" => date("Y-m-d H:i:s", $lastModified),
        "timestamp" => $lastModified
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        "error" => "Cache bulunamadı"
    ]);
}
