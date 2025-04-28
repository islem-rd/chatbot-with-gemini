<?php
// check_auth.php

session_start();

header('Content-Type: application/json');

$response = [
    'isLoggedIn' => false,
    'user' => null
];

// Vérifie si l'utilisateur est connecté
if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    $response['isLoggedIn'] = true;
    $response['user'] = [
        'id' => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'email' => $_SESSION['user_email']
    ];
}

echo json_encode($response);
exit;
?>
