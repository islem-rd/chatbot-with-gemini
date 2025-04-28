<?php
// Include database connection
require_once 'db.php';

// Start session
session_start();

// Initialize response array
$response = array('success' => false, 'message' => '');

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    
    // Validate input
    if (empty($email) || empty($password)) {
        $response['message'] = 'Email and password are required';
    } else {
        // Check if user exists
        $checkUser = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($checkUser);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            
            // Verify password
            if (password_verify($password, $user['password'])) {
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['fullname'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['logged_in'] = true;
                
                $response['success'] = true;
                $response['message'] = 'Login successful';
                $response['user'] = array(
                    'id' => $user['id'],
                    'name' => $user['fullname'],
                    'email' => $user['email']
                );
            } else {
                $response['message'] = 'Invalid password';
            }
        } else {
            $response['message'] = 'User not found';
        }
    }
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>