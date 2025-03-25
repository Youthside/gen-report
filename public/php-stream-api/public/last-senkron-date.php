<?php
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");


date_default_timezone_set('Europe/Istanbul');

// Symfony Cache kontrolü
$cache = new FilesystemAdapter('json_cache', 300, __DIR__ . '/../storage/cache');
$cacheItem = $cache->getItem('all_data');

if ($cacheItem->isHit()) {
    $meta = $cacheItem->getMetadata();
    $lastModified = $meta['ctime'] ?? time();
    echo json_encode([
        "last_sync" => date("Y-m-d H:i:s", $lastModified),
        "timestamp" => $lastModified
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["error" => "Cache bulunamadı"]);
}
