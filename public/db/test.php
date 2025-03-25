<?php 

require_once "DbConnection.php";

try {
    $db = DbConnection::getInstance();
    $conn = $db->getConnection();
    echo "Bağlantı başarılı";

    $db->closeConnection();
} catch (Exception $e) {
    echo "Bağlantı hatası: " . $e->getMessage();
}