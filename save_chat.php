<?php
// Include database connection
require_once 'db.php';

// Start session
session_start();

// Initialize response array
$response = array('success' => false, 'message' => '');

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    $response['message'] = 'User not logged in';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $userId = $_SESSION['user_id'];
    $userMessage = $_POST['user_message'];
    $botResponse = $_POST['bot_response'];
    
    // Validate input
    if (empty($userMessage) || empty($botResponse)) {
        $response['message'] = 'Message data is required';
    } else {
        // Create chats table if it doesn't exist
        $createTable = "CREATE TABLE IF NOT EXISTS chats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            user_message TEXT NOT NULL,
            bot_response TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        
        if ($conn->query($createTable) === TRUE) {
            // Insert chat into database
            $insertChat = "INSERT INTO chats (user_id, user_message, bot_response) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($insertChat);
            $stmt->bind_param("iss", $userId, $userMessage, $botResponse);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Chat saved successfully';
            } else {
                $response['message'] = 'Error saving chat: ' . $conn->error;
            }
        } else {
            $response['message'] = 'Error creating chats table: ' . $conn->error;
        }
    }
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>