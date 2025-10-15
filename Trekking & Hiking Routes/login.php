<?php
session_start();

// Database connection details
$host = 'localhost';
$db = 'trekking_routes';
$user = 'root';
$pass = 'ishan123';

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    http_response_code(500);
    echo "Database connection failed.";
    exit;
}

// If POST request, process login
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Validate
    if (empty($email) || empty($password)) {
        echo "Both fields are required.";
        exit;
    }

    // Prevent SQL Injection (use prepared statements)
    $stmt = $conn->prepare("SELECT id, name, password_hash FROM users WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check user exists
    if ($result && $row = $result->fetch_assoc()) {
        // Verify password
        if (password_verify($password, $row['password_hash'])) {
            // Success: set session, redirect
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['name'];
            header("Location: index.html");
            exit;
        }
    }
    // Invalid login
    echo "Invalid email or password.";
    exit;
}
?>

