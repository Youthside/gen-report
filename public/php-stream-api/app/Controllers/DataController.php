<?php


namespace App\Controllers;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

use App\Services\Database;
use Symfony\Component\Cache\Adapter\FilesystemAdapter;
use PDOException;

class DataController
{
    public static function streamData(): void
    {
        // GZIP kontrolü
        $acceptGzip = isset($_SERVER['HTTP_ACCEPT_ENCODING']) && strpos($_SERVER['HTTP_ACCEPT_ENCODING'], 'gzip') !== false;
        if ($acceptGzip) {
            ob_start('ob_gzhandler');
            header("Content-Encoding: gzip");
        } else {
            ob_start();
        }

        // Headerlar
        header("Content-Type: application/json; charset=UTF-8");
        header("Access-Control-Allow-Origin: *");

        header('Connection: keep-alive');

        // Cache kontrol
        $cache = new FilesystemAdapter('json_cache', 86400, __DIR__ . '/../../storage/cache'); // 86400 saniye = 24 saat
        $cacheItem = $cache->getItem('all_data');

        if ($cacheItem->isHit() && empty($_GET['refresh'])) {
            echo $cacheItem->get();
            ob_end_flush();
            file_put_contents('php://stderr', "✅ Cache'den veri okunuyor...\n");
            return;
        }

        try {
            // DB çek
            $pdo = Database::connect();
            // Limit ve Offset ayarla (opsiyonel)
            $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : null;
            $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : null;

            $query = "
        SELECT 
            v.submission_id,
            MAX(CASE WHEN v.key = 'name' THEN v.value END) AS Ad,
            MAX(CASE WHEN v.key = 'surname' THEN v.value END) AS Soyad,
            MAX(CASE WHEN v.key = 'email' THEN v.value END) AS Mail_Adresi,
            MAX(CASE WHEN v.key = 'form_free_consultation_phone' THEN v.value END) AS Telefon,
            MAX(CASE WHEN v.key = 'field_1440038' THEN v.value END) AS Egitim_Durumu,
            MAX(CASE WHEN v.key = 'field_cb9b32c' THEN v.value END) AS Universite,
            MAX(CASE WHEN v.key = 'bolum' THEN v.value END) AS Bolum,
            MAX(CASE WHEN v.key = 'field_f622b9a' THEN v.value END) AS Sinif,
            MAX(CASE WHEN v.key = 'field_aecd304' THEN v.value END) AS Aldigi_Dersler,
            l.created_at AS Tarih
        FROM wpcs_e_submissions_values v
        JOIN wpcs_e_submissions_actions_log l ON v.submission_id = l.submission_id
        GROUP BY v.submission_id
        ORDER BY l.created_at DESC
    ";

            // Eğer limit ve offset varsa uygula
            if (!is_null($limit) && !is_null($offset)) {
                $query .= " LIMIT $limit OFFSET $offset";
            }

            $stmt = $pdo->prepare($query);
            $stmt->execute();

            // Stream JSON yaz
            $jsonStream = '[';
            $first = true;
            while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                if (!$first) {
                    $jsonStream .= ',';
                }
                $jsonStream .= json_encode($row, JSON_UNESCAPED_UNICODE);
                $first = false;
            }
            $jsonStream .= ']';

            // Cache güncelle
            $cacheItem->set($jsonStream);
            $cache->save($cacheItem);

            echo $jsonStream;
            ob_end_flush();
        } catch (PDOException $e) {
            http_response_code(500);
            file_put_contents('php://stderr', "❌ Veritabanı hatası: " . $e->getMessage() . "\n");
            echo json_encode(["error" => "Veritabanı hatası veya sunucu hatası"]);
        } catch (\Exception $e) {
            http_response_code(500);
            file_put_contents('php://stderr', "❌ Sunucu hatası: " . $e->getMessage() . "\n");
            echo json_encode(["error" => "Veritabanı hatası veya sunucu hatası"]);
        } finally {
            // ✅ Bağlantıyı temizle, bağlantı yemesin!
            \App\Services\Database::close();
        }
    }
}