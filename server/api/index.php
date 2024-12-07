<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');
// Add cache control headers
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataFile = '../data/attendees.json';
$lockFile = '../data/attendees.lock';

function acquireLock() {
    global $lockFile;
    $lockFp = fopen($lockFile, 'c+');
    $tries = 0;
    while (!flock($lockFp, LOCK_EX | LOCK_NB)) {
        if ($tries++ > 10) {
            return false;
        }
        usleep(500000); // Wait 0.5 seconds before retry
    }
    return $lockFp;
}

function releaseLock($lockFp) {
    flock($lockFp, LOCK_UN);
    fclose($lockFp);
}

function readData() {
    global $dataFile;
    $jsonData = file_get_contents($dataFile);
    $data = json_decode($jsonData, true);
    
    // Ensure we have the proper structure
    if (!$data || !isset($data['attendees'])) {
        return ['attendees' => []];
    }
    
    // Transform data to include only necessary photo fields
    foreach ($data['attendees'] as &$attendee) {
        // Ensure photo fields exist
        if (!isset($attendee['photoTime'])) {
            $attendee['photoTime'] = '';
        }
        if (!isset($attendee['isPhotoTaken'])) {
            $attendee['isPhotoTaken'] = false;
        }
    }
    
    return $data;
}

function writeData($data) {
    global $dataFile;
    // Ensure we have the proper structure
    if (!isset($data['attendees'])) {
        $data = ['attendees' => $data];
    }
    
    try {
        // Check if file is writable
        if (!is_writable($dataFile) && file_exists($dataFile)) {
            error_log("File is not writable: $dataFile");
            throw new Exception("File is not writable");
        }
        
        // Try to write the data
        $result = file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
        if ($result === false) {
            error_log("Failed to write to file: $dataFile");
            throw new Exception("Failed to write data");
        }
        
        return $data;
    } catch (Exception $e) {
        error_log("Error in writeData: " . $e->getMessage());
        http_response_code(500);
        throw $e;
    }
}

// Get the request path
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/hydro/server/api', '', $path);
$method = $_SERVER['REQUEST_METHOD'];

// Get request body for POST/PUT requests
$requestBody = file_get_contents('php://input');
$requestData = json_decode($requestBody, true);

try {
    $lockFp = acquireLock();
    if (!$lockFp) {
        throw new Exception('Could not acquire lock');
    }

    $data = readData();
    $response = null;

    // Route handling
    if ($path === '/attendees' && $method === 'GET') {
        // Clear any output buffering
        while (ob_get_level()) ob_end_clean();
        // Force fresh data read
        clearstatcache(true, $dataFile);
        $response = readData();
    }
    else if (preg_match('/\/attendees\/(\d+)/', $path, $matches) && $method === 'GET') {
        $id = $matches[1];
        $attendee = array_filter($data['attendees'], function($a) use ($id) {
            return $a['id'] == $id;
        });
        $response = reset($attendee) ?: null;
        if (!$response) {
            http_response_code(404);
            $response = ['error' => 'Attendee not found'];
        }
    }
    else if ($path === '/attendees' && $method === 'POST') {
        $newAttendee = $requestData;
        $newAttendee['id'] = time() . rand(1000, 9999); // Combine timestamp with random number for uniqueness
        $newAttendee['lastUpdated'] = date('c');
        $data['attendees'][] = $newAttendee;
        writeData($data);
        $response = $newAttendee;
    }
    else if (preg_match('/\/attendees\/(\d+)/', $path, $matches) && $method === 'PUT') {
        $id = $matches[1];
        foreach ($data['attendees'] as &$attendee) {
            if ($attendee['id'] == $id) {
                $attendee = array_merge($attendee, $requestData);
                $attendee['lastUpdated'] = date('c');
                writeData($data);
                $response = $attendee;
                break;
            }
        }
        if (!$response) {
            http_response_code(404);
            $response = ['error' => 'Attendee not found'];
        }
    }
    else if (preg_match('/\/attendees\/(\d+)\/photo-session/', $path, $matches) && $method === 'POST') {
        $id = $matches[1];
        foreach ($data['attendees'] as &$attendee) {
            if ($attendee['id'] == $id) {
                $attendee['photoTime'] = $requestData['photoTime'];
                $attendee['isPhotoTaken'] = $requestData['isPhotoTaken'];
                $attendee['lastUpdated'] = date('c');
                writeData($data);
                $response = $attendee;
                break;
            }
        }
        if (!$response) {
            http_response_code(404);
            $response = ['error' => 'Attendee not found'];
        }
    }
    else if ($path === '/attendees/bulk/update' && $method === 'PUT') {
        $updates = $requestData['attendees'];
        foreach ($updates as $update) {
            foreach ($data['attendees'] as &$attendee) {
                if ($attendee['id'] == $update['id']) {
                    $attendee = array_merge($attendee, $update);
                    $attendee['lastUpdated'] = date('c');
                    break;
                }
            }
        }
        writeData($data);
        $response = ['message' => 'Bulk update completed', 'count' => count($updates)];
    }
    else {
        http_response_code(404);
        $response = ['error' => 'Endpoint not found'];
    }

    releaseLock($lockFp);
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    if (isset($lockFp)) {
        releaseLock($lockFp);
    }
}
