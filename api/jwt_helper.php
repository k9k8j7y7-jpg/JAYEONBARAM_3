<?php
class JWTHelper {
    private static $secret_key;

    private static function init() {
        if (!isset(self::$secret_key)) {
            require_once 'db_config.php';
            self::$secret_key = JWT_SECRET;
        }
    }

    private static function base64UrlEncode($data) {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    public static function encode($payload) {
        self::init();
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, self::$secret_key, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    public static function decode($token) {
        self::init();
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;
        
        list($header, $payload, $signature) = $parts;
        
        $valid_signature = self::base64UrlEncode(hash_hmac('sha256', $header . "." . $payload, self::$secret_key, true));
        
        if ($signature !== $valid_signature) return null;
        
        $decoded_payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
        
        // Expiration check
        if (isset($decoded_payload['exp']) && $decoded_payload['exp'] < time()) {
            return null;
        }
        
        return $decoded_payload;
    }
}
?>
