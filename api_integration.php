
<?php
/**
 * API DE INTEGRAÇÃO HACOLHE - DPS PMBA
 * Este arquivo deve ser hospedado em um servidor com suporte a PHP e MySQL.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-DB-Config");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Captura as configurações do banco enviadas pelo Frontend
$headers = getallheaders();
$dbConfigJson = isset($headers['X-DB-Config']) ? base64_decode($headers['X-DB-Config']) : null;

if (!$dbConfigJson) {
    http_response_code(400);
    echo json_encode(["error" => "Configuração de banco de dados não fornecida."]);
    exit;
}

$dbConfig = json_decode($dbConfigJson, true);

// Conexão com o MySQL
try {
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset=utf8mb4";
    $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Falha na conexão MySQL: " . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$resource = $pathParts[0] ?? '';

// Roteamento
switch ($resource) {
    case 'test':
        echo json_encode(["success" => true, "message" => "Conexão OK"]);
        break;

    case 'submissions':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT * FROM submissions ORDER BY timestamp DESC");
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $fields = array_keys($data);
            $placeholders = array_map(fn($f) => ":$f", $fields);
            
            $sql = "INSERT INTO submissions (" . implode(',', $fields) . ") VALUES (" . implode(',', $placeholders) . ")";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($data);
            echo json_encode(["success" => true]);
        } elseif ($method === 'PATCH' && isset($pathParts[1]) && ($pathParts[2] ?? '') === 'status') {
            $id = $pathParts[1];
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("UPDATE submissions SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'], $id]);
            echo json_encode(["success" => true]);
        } elseif ($method === 'DELETE' && isset($pathParts[1])) {
            $stmt = $pdo->prepare("DELETE FROM submissions WHERE id = ?");
            $stmt->execute([$pathParts[1]]);
            echo json_encode(["success" => true]);
        }
        break;

    case 'admins':
        if ($method === 'GET') {
            $stmt = $pdo->query("SELECT id, username, createdAt FROM admins");
            echo json_encode($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents("php://input"), true);
            $stmt = $pdo->prepare("INSERT INTO admins (id, username, password) VALUES (?, ?, ?)");
            $stmt->execute([$data['id'], $data['username'], $data['password']]);
            echo json_encode(["success" => true]);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint desconhecido"]);
        break;
}
