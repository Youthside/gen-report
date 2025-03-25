<?php
require_once __DIR__ . '/../vendor/autoload.php';

use App\Services\Database;

try {
    $pdo = Database::connect();

    $query = $pdo->prepare("
        SELECT 
            CASE
                WHEN v.value LIKE '%Yazılım Teknolojileri%' OR v.value LIKE '%Yapay Zeka%' THEN 'Yazılım Teknolojileri ve Yapay Zeka'
                WHEN v.value LIKE '%Satış%' OR v.value LIKE '%Pazarlama%' OR v.value LIKE '%Marka%' THEN 'Satış, Pazarlama ve Marka Yaratma'
                WHEN v.value LIKE '%Dijital Pazarlama%' OR v.value LIKE '%Influencer Marketing%' OR v.value LIKE '%Girişimcilik%' THEN 'Dijital Pazarlama, Influencer Marketing ve Girişimcilik'
                WHEN v.value LIKE '%İnsan Kaynakları%' OR v.value LIKE '%Yetenek Kazanımı%' THEN 'İnsan Kaynakları ve Yetenek Kazanımı'
                ELSE 'Diğer'
            END AS bolum,
            COUNT(DISTINCT v.submission_id) AS basvuru
        FROM wpcs_e_submissions_values v
        WHERE v.`key` = 'field_aecd304'
        GROUP BY bolum
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