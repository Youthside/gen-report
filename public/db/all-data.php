<?php
ini_set('memory_limit', '1024M'); // Bellek limiti 1GB
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

require_once 'DbConnection.php';

function getCacheFilePath() {
    return __DIR__ . '/../cache/all-data.json.gz';
}

function isCacheValid(string $cacheFile, int $ttlSeconds = 900): bool {
    return file_exists($cacheFile) && (time() - filemtime($cacheFile) < $ttlSeconds);
}

function outputCachedData(string $cacheFile) {
    header('Content-Encoding: gzip');
    readfile($cacheFile);
    exit;
}

function fetchSubmissionData(PDO $pdo): iterable {
    $sql = "SELECT 
                v.submission_id, v.key, v.value, l.created_at
            FROM wpcs_e_submissions_values v
            JOIN wpcs_e_submissions_actions_log l 
                ON v.submission_id = l.submission_id
            WHERE v.key IN (
                'name',
                'surname',
                'email',
                'form_free_consultation_phone',
                'field_1440038',
                'field_cb9b32c',
                'bolum',
                'field_f622b9a',
                'field_aecd304'
            )
            ORDER BY l.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        yield $row;
    }
}

function streamJson(iterable $rows) {
    header('Content-Type: application/json');
    header('Transfer-Encoding: chunked');
    header('Cache-Control: no-cache');

    echo "[";
    $first = true;

    $buffer = [];

    $columnMap = [
        'name' => 'Ad',
        'surname' => 'Soyad',
        'email' => 'Mail_Adresi',
        'form_free_consultation_phone' => 'Telefon',
        'field_1440038' => 'Egitim_Durumu',
        'field_cb9b32c' => 'Universite',
        'bolum' => 'Bolum',
        'field_f622b9a' => 'Sinif',
        'field_aecd304' => 'Aldigi_Dersler',
    ];

    foreach ($rows as $row) {
        $id = $row['submission_id'];
        $key = $row['key'];
        $value = $row['value'];

        if (!isset($buffer[$id])) {
            $buffer[$id] = ['ID' => $id];
        }

        if (isset($columnMap[$key])) {
            $buffer[$id][$columnMap[$key]] = $value;
        }

        if (count($buffer) > 5000) {
            foreach ($buffer as $submission) {
                if (!$first) echo ",";
                echo json_encode($submission, JSON_UNESCAPED_UNICODE);
                $first = false;
            }
            $buffer = [];
            ob_flush(); flush();
        }
    }

    foreach ($buffer as $submission) {
        if (!$first) echo ",";
        echo json_encode($submission, JSON_UNESCAPED_UNICODE);
        $first = false;
    }

    echo "]";
    exit; // 🔥 Bu önemli! Yoksa PHP kapanana kadar veri gönderilmez
}

function main() {
    $refresh = isset($_GET['refresh']);
    $cacheFile = getCacheFilePath();

    if (!$refresh && isCacheValid($cacheFile)) {
        outputCachedData($cacheFile);
    }

    header('Content-Type: application/json');
    header('Content-Encoding: gzip');

    try {
        while (ob_get_level() > 0) ob_end_clean();
        $pdo = DbConnection::getInstance()->getConnection();
        $rows = iterator_to_array(fetchSubmissionData($pdo));

        $columnMap = [
            'name' => 'Ad',
            'surname' => 'Soyad',
            'email' => 'Mail_Adresi',
            'form_free_consultation_phone' => 'Telefon',
            'field_1440038' => 'Egitim_Durumu',
            'field_cb9b32c' => 'Universite',
            'bolum' => 'Bolum',
            'field_f622b9a' => 'Sinif',
            'field_aecd304' => 'Aldigi_Dersler',
        ];

        $submissions = [];

        foreach ($rows as $row) {
            $id = $row['submission_id'];
            $key = $row['key'];
            $value = $row['value'];

            if (!isset($columnMap[$key])) continue;

            if (!isset($submissions[$id])) {
                $submissions[$id] = [
                    'ID' => $id,
                    'Tarih' => $row['created_at'],
                ];
            }

            $submissions[$id][$columnMap[$key]] = $value;
        }

        $json = json_encode(array_values($submissions), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        file_put_contents($cacheFile, gzencode($json, 9));
        echo gzencode($json, 9);
    } catch (PDOException $e) {
        echo gzencode(json_encode(["error" => $e->getMessage()]), 9);
    } finally {
        DbConnection::destroy();
    }
}

main();
