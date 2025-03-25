<?php
try {
    $pdo = new PDO('mysql:host=5.2.85.141;dbname=youthsid_wp462', 'youthsid_genrapor', 'Zo6~R((h1fXS', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        
    ]);
} catch (PDOException $e) {
    die("Bağlantı hatası: " . $e->getMessage());
}
