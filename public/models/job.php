<?php
// id
// jobTitle
// jobDescription
// createdDate


class Job
{
    private $conn; // Veritabanı bağlantısını tutmak için özel bir değişken

    private $table_name = "jobs"; // Veritabanındaki tablo adı

    public $id; // id
    public $jobTitle; // iş başlığı
    public $jobDescription; // iş açıklaması
    public $createdDate; // oluşturulma tarihi



    // Veritabanı bağlantısını kurmak için yapıcı metot
    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function create()
    {
        $this->sanitize();

        $query = "INSERT INTO " . $this->table_name . " SET jobTitle=:jobTitle, jobDescription=:jobDescription";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":jobTitle", $this->jobTitle);
        $stmt->bindParam(":jobDescription", $this->jobDescription);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }

        return 0;
    }

    public function update()
    {
        $this->sanitize();
        $this->sanitizeId();

        $query = "UPDATE " . $this->table_name . " SET jobTitle=:jobTitle, jobDescription=:jobDescription WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":jobTitle", $this->jobTitle);
        $stmt->bindParam(":jobDescription", $this->jobDescription);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }


    public function delete()
    {
        $this->sanitizeId();

        $query = "DELETE FROM " . $this->table_name . " WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function read()
    {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY createdDate DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function readFirstId()
    {
        $this->sanitizeId();

        $query = "SELECT * FROM " . $this->table_name . " WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }







    private function sanitize()
    {

        $this->jobTitle = htmlspecialchars(strip_tags($this->jobTitle));
        $this->jobDescription = htmlspecialchars(strip_tags($this->jobDescription));
        $this->createdDate = htmlspecialchars(strip_tags($this->createdDate));
    }

    private function sanitizeId()
    {
        $this->id = htmlspecialchars(strip_tags($this->id));
    }
}
