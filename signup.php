<?php
// Include database connection
require_once 'db.php';

// Initialize response array
$response = array('success' => false, 'message' => '');

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $fullname = trim($_POST['fullname']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirm_password'];
    
    // Validate input
    if (empty($fullname) || empty($email) || empty($password) || empty($confirmPassword)) {
        $response['message'] = 'All fields are required';
    } elseif ($password !== $confirmPassword) {
        $response['message'] = 'Passwords do not match';
    } elseif (strlen($password) < 6) {
        $response['message'] = 'Password must be at least 6 characters long';
    } else {
        // Check if email already exists
        $checkEmail = "SELECT * FROM users WHERE email = ?";
        $stmt = $conn->prepare($checkEmail);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $response['message'] = 'Email already exists';
        } else {
            // Hash the password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert user into database
            $insertUser = "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
            $stmt = $conn->prepare($insertUser);
            $stmt->bind_param("sss", $fullname, $email, $hashedPassword);
            
            if ($stmt->execute()) {
                $response['success'] = true;
                $response['message'] = 'Account created successfully';
            } else {
                $response['message'] = 'Error creating account: ' . $conn->error;
            }
        }
    }
    
    // Return JSON response
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>