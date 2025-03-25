<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Services\Database;

try {
    $pdo = Database::connect();

    $query = $pdo->prepare("
        SELECT v.value AS bolum, COUNT(DISTINCT v.submission_id) AS basvuru
        FROM wpcs_e_submissions_values v
        WHERE v.`key` = 'bolum'
        GROUP BY v.value
        HAVING bolum IS NOT NULL AND bolum != ''
        ORDER BY basvuru DESC
    ");
    $query->execute();
    $result = $query->fetchAll(PDO::FETCH_ASSOC);

    header('Content-Type: application/json');
    echo json_encode($result, JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    Database::close();
}