<?php
// Include database connection
require_once 'db.php';

// Start session
session_start();

// Initialize response array
$response = array('success' => false, 'message' => '', 'chats' => array());

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    $response['message'] = 'User not logged in';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Get user ID from session
$userId = $_SESSION['user_id'];

// Get chat history
$getChats = "SELECT * FROM chats WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($getChats);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $response['chats'][] = array(
            'id' => $row['id'],
            'user_message' => $row['user_message'],
            'bot_response' => $row['bot_response'],
            'created_at' => $row['created_at']
        );
    }
    $response['success'] = true;
    $response['message'] = 'Chat history retrieved successfully';
} else {
    $response['message'] = 'No chat history found';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);
exit;
?>