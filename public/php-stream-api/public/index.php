<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
require_once __DIR__ . '/../vendor/autoload.php';

use App\Controllers\DataController;

$route = $_GET['route'] ?? '';

header('Content-Type: application/json; charset=utf-8');

switch ($route) {
    case 'all-data':
        DataController::streamData();
        break;
    case 'last-senkron-date':
        require_once __DIR__ . '/last-senkron-date.php';
        break;
    case 'getSchoolsData':
        require_once __DIR__ . '/getSchoolsData.php';
        break;
    case 'getDepartmentsData':
        require_once __DIR__ . '/getDepartmentsData.php';
        break;
    case 'getAreaData':
        require_once __DIR__ . '/getAreaData.php';
        break;
    default:
        echo json_encode(["status" => "PHP Streaming API hazır!"]);
        break;
}
