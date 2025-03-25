<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");


// tüm hataları göster
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Veritabanı bağlantısını dahil et
require_once 'DbConnection.php';

// Use the singleton instance
$dbConnection = DbConnection::getInstance();
$pdo = $dbConnection->getConnection();


// Submission ID'ye göre tüm verileri getirir ve düzenler
function getDataBySubmissionId()
{
    global $pdo;

    // Optimize edilmiş SQL sorgusu
    $query = $pdo->prepare("SELECT submission_id, `key`, value FROM wpcs_e_submissions_values ORDER BY submission_id");
    $query->execute();

    $result = [];

    // fetchAll() yerine satır satır işleme yapıyoruz
    while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
        $submission_id = $row['submission_id'];
        $key = $row['key'];
        $value = $row['value'];

        // Eğer submission_id henüz eklenmemişse, yeni bir dizi başlat
        if (!isset($result[$submission_id])) {
            $result[$submission_id] = ['submission_id' => $submission_id];
        }

        // Key-value çiftini ekleyelim
        $result[$submission_id][$key] = $value;
    }

    return array_values($result);
}



// Tüm verilerin toplamını getirir
function getFullDataCount()
{
    return count(getDataBySubmissionId());
}

// Bugünün başvurularını getirir
function getTodayData()
{
    global $pdo;

    // Tarih aralığı belirleme (Bu sayede INDEX kullanılır)
    $startOfDay = date('Y-m-d 00:00:00');
    $endOfDay = date('Y-m-d 23:59:59');

    // Optimize edilmiş SQL sorgusu
    $query = $pdo->prepare("
        SELECT v.submission_id, v.`key`, v.value 
        FROM wpcs_e_submissions_values v
        JOIN wpcs_e_submissions_actions_log l 
        ON v.submission_id = l.submission_id
        WHERE l.created_at BETWEEN :startOfDay AND :endOfDay
        ORDER BY v.submission_id
    ");

    // Parametreleri bağlayarak sorguyu çalıştır
    $query->bindParam(':startOfDay', $startOfDay, PDO::PARAM_STR);
    $query->bindParam(':endOfDay', $endOfDay, PDO::PARAM_STR);
    $query->execute();

    // fetchAll() yerine fetch() ile belleği daha iyi yönetelim
    $rows = [];
    while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $row;
    }

    return organizeDataBySubmissionId($rows);
}



// Bugünün başvuru sayısını getirir
function getTodayDataCount()
{
    return count(getTodayData());
}

// Dün ki başvuruları getirir
function getYesterdayData()
{
    global $pdo;

    // Dün gece 00:00:00 ve 23:59:59 arasındaki zaman dilimi
    $startOfYesterday = date('Y-m-d 00:00:00', strtotime('-1 day'));
    $endOfYesterday = date('Y-m-d 23:59:59', strtotime('-1 day'));

    // Optimize edilmiş SQL sorgusu
    $query = $pdo->prepare("
        SELECT v.submission_id, v.`key`, v.value 
        FROM wpcs_e_submissions_values v
        JOIN wpcs_e_submissions_actions_log l 
        ON v.submission_id = l.submission_id
        WHERE l.created_at BETWEEN :startOfYesterday AND :endOfYesterday
        ORDER BY v.submission_id
    ");

    // Parametreleri bağlayarak sorguyu çalıştır
    $query->bindParam(':startOfYesterday', $startOfYesterday, PDO::PARAM_STR);
    $query->bindParam(':endOfYesterday', $endOfYesterday, PDO::PARAM_STR);
    $query->execute();

    // fetchAll() yerine fetch() ile satır satır işleyelim
    $rows = [];
    while ($row = $query->fetch(PDO::FETCH_ASSOC)) {
        $rows[] = $row;
    }

    return organizeDataBySubmissionId($rows);
}


// Dün ki başvuru sayısını getirir
function getYesterdayDataCount()
{
    return count(getYesterdayData());
}

// Haftalık ortalama başvuru sayısını getirir
function getWeeklyAverageDataCount()
{
    global $pdo;
    $query = $pdo->prepare("SELECT ROUND(AVG(daily_count)) as weekly_average FROM (
                            SELECT DATE(l.created_at) as date, COUNT(DISTINCT v.submission_id) as daily_count 
                            FROM wpcs_e_submissions_values v
                            JOIN wpcs_e_submissions_actions_log l ON v.submission_id = l.submission_id
                            WHERE l.created_at >= CURDATE() - INTERVAL 7 DAY 
                            GROUP BY DATE(l.created_at)) as daily_counts;");
    $query->execute();
    return $query->fetch()['weekly_average'];
}

// Geçen hafta ki ortalama başvuru sayısını getirir
function getLastWeekAverageDataCount()
{
    global $pdo;
    $query = $pdo->prepare("SELECT ROUND(AVG(daily_count)) as weekly_average FROM (
                            SELECT DATE(l.created_at) as date, COUNT(DISTINCT v.submission_id) as daily_count 
                            FROM wpcs_e_submissions_values v
                            JOIN wpcs_e_submissions_actions_log l ON v.submission_id = l.submission_id
                            WHERE l.created_at >= CURDATE() - INTERVAL 14 DAY AND l.created_at < CURDATE() - INTERVAL 7 DAY 
                            GROUP BY DATE(l.created_at)) as daily_counts;");
    $query->execute();
    return $query->fetch()['weekly_average'];
}

// Dün ve bugün arasındaki yüzdelik farkı getirir
function getDailyDifference()
{
    $yesterdayCount = getYesterdayDataCount();
    $todayCount = getTodayDataCount();

    if ($yesterdayCount == 0) {
        return $todayCount > 0 ? "Infinity" : "0.00"; // Avoid division by zero
    }

    $difference = (($todayCount - $yesterdayCount) / $yesterdayCount) * 100;
    return number_format($difference, 2, '.', ''); // İki ondalık basamağa yuvarlar
}

// Geçen hafta ile bu hafta arasındaki yüzdelik farkı getirir
function getWeeklyDifference()
{
    $lastWeekAverage = getLastWeekAverageDataCount();
    $thisWeekAverage = getWeeklyAverageDataCount();
    $difference = (($thisWeekAverage - $lastWeekAverage) / $lastWeekAverage) * 100;
    return number_format($difference, 2, '.', ''); // İki ondalık basamağa yuvarlar
}

// Okullara göre başvuru sayısını getirir
function getSchoolsData()
{
    global $pdo;

    $query = $pdo->prepare("
        SELECT v.value AS okul, COUNT(DISTINCT v.submission_id) AS basvuru 
        FROM wpcs_e_submissions_values v
        WHERE v.`key` = 'field_cb9b32c' 
        GROUP BY v.value 
        ORDER BY basvuru DESC;
    ");

    $query->execute();
    return $query->fetchAll(PDO::FETCH_ASSOC);
}



function getDepartmentsData()
{
    global $pdo;

    $query = $pdo->prepare("
        SELECT v.value AS bolum, COUNT(DISTINCT v.submission_id) AS basvuru 
        FROM wpcs_e_submissions_values v
        WHERE v.`key` = 'bolum' 
        GROUP BY v.value 
        ORDER BY basvuru DESC;
    ");

    $query->execute();
    return $query->fetchAll(PDO::FETCH_ASSOC);
}

function getAreaData()
{
    global $pdo;
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
        JOIN wpcs_e_submissions_actions_log l ON v.submission_id = l.submission_id
        WHERE v.`key` = 'field_aecd304'
        GROUP BY bolum
        ORDER BY basvuru DESC
    ");
    $query->execute();
    return $query->fetchAll(PDO::FETCH_ASSOC);
}


// Belirli bir tarih aralığındaki başvuruları getir
function getSubmissionsByDateRange($startDate, $endDate) {
    global $pdo;
    $query = $pdo->prepare("
        SELECT DATE(l.created_at) AS date, COUNT(DISTINCT v.submission_id) AS count
        FROM wpcs_e_submissions_values v
        JOIN wpcs_e_submissions_actions_log l ON v.submission_id = l.submission_id
        WHERE l.created_at BETWEEN :start AND :end
        GROUP BY DATE(l.created_at)
    ");
    $query->execute(['start' => $startDate, 'end' => $endDate]);
    return $query->fetchAll(PDO::FETCH_ASSOC);
}


// Verileri submission_id'ye göre organize eder
function organizeDataBySubmissionId($rows)
{
    $result = [];
    foreach ($rows as $row) {
        $submission_id = $row['submission_id'];
        $key = $row['key'];
        $value = $row['value'];

        if (!isset($result[$submission_id])) {
            $result[$submission_id] = [
                'submission_id' => $submission_id
            ];
        }
        $result[$submission_id][$key] = $value;
    }

    return array_values($result);
}



// API taleplerini işleme
$apiQuery = $_GET['query'] ?? null;

function response($data)
{
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE, JSON_PRETTY_PRINT);
    exit;
}

switch ($apiQuery) {
    case 'getFullData':
        response(getDataBySubmissionId());
        break;
    case 'getFullDataCount':
        response(getFullDataCount());
        break;
    case 'getTodayData':
        response(getTodayData());
        break;
    case 'getTodayDataCount':
        response(getTodayDataCount());
        break;
    case 'getYesterdayData':
        response(getYesterdayData());
        break;
    case 'getYesterdayDataCount':
        response(getYesterdayDataCount());
        break;
    case 'getWeeklyAverageDataCount':
        response(getWeeklyAverageDataCount());
        break;
    case 'getLastWeekAverageDataCount':
        response(getLastWeekAverageDataCount());
        break;
    case 'getDailyDifference':
        response(getDailyDifference());
        break;
    case 'getWeeklyDifference':
        response(getWeeklyDifference());
        break;
    case 'getSchoolsData':
        response(getSchoolsData());
        break;
    case 'getDepartmentsData':
        response(getDepartmentsData());
        break;

    case 'getAreaData':
        response(getAreaData());
        break;

    case 'getSubmissionsByDateRange':
        $startDate = $_GET['start'] ?? null;
        $endDate = $_GET['end'] ?? null;
        response(getSubmissionsByDateRange($startDate, $endDate));
        break;
    default:
        echo "Invalid query";
        break;
}

// Veritabanı bağlantısını kapat
DbConnection::destroy();
