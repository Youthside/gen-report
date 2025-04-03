<?php
ini_set('memory_limit', '1024M'); // Bellek limiti 1GB
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

require_once 'DbConnectionExam.php';

$db = DbConnection::getInstance()->getConnection();
// Kaç kişinin sınava girdiğini bul
$sqlCount = "SELECT Id,
            emailAddress,
            CASE 
                WHEN scoreTotal = 33333 THEN 50 
                ELSE scoreTotal * 3 
            END AS adjustedScoreTotal
            FROM sinav_sonuc
            WHERE emailAddress IS NOT NULL AND emailAddress <> ''
            ORDER BY endTime DESC";

$stmtCount = $db->prepare($sqlCount);
$stmtCount->execute();
$result = $stmtCount->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
