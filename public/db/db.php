<?php
// Yukarıdaki bağlantı kodunu buraya dahil edin
$servername = "5.2.85.141";
$username = "youthsid_genrapor";
$password = "Zo6~R((h1fXS";
$dbname = "youthsid_gen-2024-2025";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Tablo adı
$table = 'sinav_sonuc'; 

// Veritabanından verileri çekme
try {
    $stmt = $pdo->query("SELECT * FROM $table");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo 'Sorgu hatası: ' . $e->getMessage();
    exit;
}
?>
