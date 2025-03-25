<?php

function response($code, $message, $status, $jwt = null)
{
    http_response_code($code);
    header('Content-Type: application/json');
    $response = ['message' => $message, "status" => $status];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

function responseWithData($code, $message, $status, $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    $response = ['message' => $message, "status" => $status, 'data' => $data];
    echo json_encode($response, JSON_UNESCAPED_UNICODE);

    exit();
}
