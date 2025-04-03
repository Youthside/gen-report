<?php
class DbConnection
{
    private static $instance = null;
    private $conn;

    private $host = "5.2.85.141";
    private $db_name = "youthsid_gen-2024-2025";
    private $username = "youthsid_genrapor";
    private $password = "Zo6~R((h1fXS";

    private function __construct()
    {
        $this->connect();
    }

    private function connect()
    {
        try {
            if ($this->conn === null) {
                $this->conn = new PDO(
                    "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_PERSISTENT => false,
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]
                );
                $this->conn->exec("SET NAMES 'utf8'");
                $this->conn->exec("SET CHARACTER SET utf8");
                $this->conn->exec("SET COLLATION_CONNECTION = 'utf8_turkish_ci'");
            }
        } catch (PDOException $exception) {
            throw new Exception("Bağlantı hatası: " . $exception->getMessage());
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new DbConnection();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        return $this->conn;
    }

    public function closeConnection()
    {
        $this->conn = null;
        self::$instance = null;
    }


    public static function destroy()
    {
        if (self::$instance !== null) {
            self::$instance->closeConnection();
        }
    }
    public function __destruct()
    {
        $this->closeConnection();
    }
}
