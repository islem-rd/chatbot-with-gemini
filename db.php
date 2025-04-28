<?php
// Fichier de connexion à la base de données
$host = "localhost";
$user = "root";
$password = "";
$database = "chatbot";

$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    die("Erreur de connexion: " . mysqli_connect_error());
}
?>