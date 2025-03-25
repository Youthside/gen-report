<?php

namespace Services;

require '../vendor/autoload.php';

use Smalot\PdfParser\Parser;

class PdfToTxtService
{
    public static function convertToTxt($pdfFilePath, $outputTxtPath)
    {
        try {
            $parser = new Parser();
            $pdf = $parser->parseFile($pdfFilePath);
            $text = $pdf->getText();
            // file_put_contents($outputTxtPath, $text);
            return [
                "success" => true,
                "message" => "PDF başarıyla TXT formatına dönüştürüldü.",
                "text" => $text,
                "name" => pathinfo($outputTxtPath, PATHINFO_FILENAME),
                "extension" => pathinfo($outputTxtPath, PATHINFO_EXTENSION)
            ];
        } catch (\Exception $e) {
            return [
                "success" => false,
                "message" => "PDF dönüştürme sırasında hata oluştu: " . $e->getMessage()
            ];
        }
    }
}
