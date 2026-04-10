<?php
/**
 * Database configuration and shared utilities.
 * Credentials loaded from .env file (never committed to git).
 *
 * OWASP compliance:
 * - PDO with prepared statements (A03:2021 Injection)
 * - Credentials in .env only (A02:2021 Sensitive Data)
 * - Error display disabled (A05:2021 Security Misconfiguration)
 * - Security headers on all responses
 */

declare(strict_types=1);

// Disable error display in production
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

/**
 * Load .env file from the same directory.
 */
function loadEnv(string $path): void
{
    if (!file_exists($path)) {
        http_response_code(500);
        echo json_encode(['error' => 'Server configuration error']);
        exit;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1]);
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
}

loadEnv(__DIR__ . '/.env');

/**
 * Set security headers and CORS.
 */
function setSecurityHeaders(): void
{
    $origin = $_ENV['ALLOWED_ORIGIN'] ?? '';

    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Cache-Control: no-store, no-cache, must-revalidate');

    if ($origin !== '') {
        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Max-Age: 86400');
    }

    // Handle CORS preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Get a PDO database connection.
 */
function getDb(): PDO
{
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    $host = $_ENV['DB_HOST'] ?? '';
    $name = $_ENV['DB_NAME'] ?? '';
    $user = $_ENV['DB_USER'] ?? '';
    $pass = $_ENV['DB_PASS'] ?? '';

    $dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    return $pdo;
}

/**
 * Validate the API key from the Authorization header.
 * Uses hash_equals to prevent timing attacks (A07:2021).
 */
function requireApiKey(): void
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    $token  = '';

    if (str_starts_with($header, 'Bearer ')) {
        $token = substr($header, 7);
    }

    $expected = $_ENV['API_KEY'] ?? '';

    if ($expected === '' || !hash_equals($expected, $token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorised']);
        exit;
    }
}

/**
 * Send a JSON error response and exit.
 */
function jsonError(int $code, string $message): never
{
    http_response_code($code);
    echo json_encode(['error' => $message]);
    exit;
}

/**
 * Send a JSON success response and exit.
 */
function jsonResponse(mixed $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
