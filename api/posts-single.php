<?php
/**
 * Single blog post API endpoint.
 *
 * GET /api/posts-single.php?slug=my-post - Fetch a single published post
 *
 * OWASP compliance:
 * - Prepared statements (A03:2021)
 * - Input validation (A03:2021)
 * - Method restriction (A05:2021)
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

setSecurityHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError(405, 'Method not allowed');
}

$slug = filter_input(INPUT_GET, 'slug', FILTER_SANITIZE_SPECIAL_CHARS);

if ($slug === null || $slug === '' || $slug === false) {
    jsonError(400, 'Slug parameter is required');
}

if (!preg_match('/^[a-z0-9][a-z0-9-]*[a-z0-9]$/', $slug) && strlen($slug) > 1) {
    jsonError(400, 'Invalid slug format');
}

if (mb_strlen($slug) > 255) {
    jsonError(400, 'Slug too long');
}

$db  = getDb();
$sql = 'SELECT id, title, slug, excerpt, body, author, image_url, published_at, updated_at
        FROM blog_posts
        WHERE slug = :slug AND status = :status
        LIMIT 1';

$stmt = $db->prepare($sql);
$stmt->execute([':slug' => $slug, ':status' => 'published']);
$post = $stmt->fetch();

if (!$post) {
    jsonError(404, 'Post not found');
}

jsonResponse($post);
