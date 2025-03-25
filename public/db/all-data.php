<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

require_once 'DbConnection.php';

$cacheFile = __DIR__ . '/../cache/all-data.json';
$refresh = isset($_GET['refresh']) ? $_GET['refresh'] : false;

if (!$refresh && file_exists($cacheFile) && time() - filemtime($cacheFile) < 300) { // 5dk cache süresi
    echo file_get_contents($cacheFile);
    exit;
}

try {
    $pdo = DbConnection::getInstance()->getConnection();

    $sql = "SELECT 
                v.submission_id,
                MAX(CASE WHEN v.key = 'name' THEN v.value END) AS Ad,
                MAX(CASE WHEN v.key = 'surname' THEN v.value END) AS Soyad,
                MAX(CASE WHEN v.key = 'email' THEN v.value END) AS Mail_Adresi,
                MAX(CASE WHEN v.key = 'form_free_consultation_phone' THEN v.value END) AS Telefon,
                MAX(CASE WHEN v.key = 'field_1440038' THEN v.value END) AS Eğitim_Durumu,
                MAX(CASE WHEN v.key = 'field_cb9b32c' THEN v.value END) AS Üniversite,
                MAX(CASE WHEN v.key = 'bolum' THEN v.value END) AS Bölüm,
                MAX(CASE WHEN v.key = 'field_f622b9a' THEN v.value END) AS Sınıf,
                MAX(CASE WHEN v.key = 'field_aecd304' THEN v.value END) AS Aldığı_Dersler,
                l.created_at AS Tarih
            FROM wpcs_e_submissions_values v
            JOIN wpcs_e_submissions_actions_log l ON v.submission_id = l.submission_id
            GROUP BY v.submission_id
            ORDER BY l.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll();

    $jsonData = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    file_put_contents($cacheFile, $jsonData);

    echo $jsonData;

} catch (PDOException $e) {
    echo json_encode(["error" => "Veritabanı hatası: " . $e->getMessage()]);
} finally {
    DbConnection::destroy();
}
