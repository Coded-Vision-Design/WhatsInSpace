<?php
/**
 * Blog posts API endpoint.
 *
 * GET  /api/posts.php?limit=10  - List published posts
 * POST /api/posts.php           - Create a new post (API key required)
 *
 * OWASP compliance:
 * - Prepared statements for all queries (A03:2021)
 * - Input validation and length limits (A03:2021)
 * - API key authentication for writes (A07:2021)
 * - Method restriction (A05:2021)
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

setSecurityHeaders();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    handleGet();
} elseif ($method === 'POST') {
    handlePost();
} else {
    jsonError(405, 'Method not allowed');
}

/**
 * GET: List published blog posts.
 */
function handleGet(): void
{
    $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT, [
        'options' => ['default' => 10, 'min_range' => 1, 'max_range' => 50],
    ]);

    $db  = getDb();
    $sql = 'SELECT id, title, slug, excerpt, author, image_url, published_at
            FROM blog_posts
            WHERE status = :status
            ORDER BY published_at DESC
            LIMIT :lim';

    $stmt = $db->prepare($sql);
    $stmt->bindValue(':status', 'published', PDO::PARAM_STR);
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->execute();

    jsonResponse($stmt->fetchAll());
}

/**
 * POST: Create a new blog post (API key required).
 */
function handlePost(): void
{
    requireApiKey();

    $body = json_decode(file_get_contents('php://input'), true);

    if (!is_array($body)) {
        jsonError(400, 'Invalid JSON body');
    }

    // Validate required fields
    $title = trim($body['title'] ?? '');
    $content = trim($body['body'] ?? '');

    if ($title === '' || $content === '') {
        jsonError(400, 'Title and body are required');
    }

    if (mb_strlen($title) > 255) {
        jsonError(400, 'Title must be 255 characters or fewer');
    }

    if (mb_strlen($content) > 65535) {
        jsonError(400, 'Body must be 65535 characters or fewer');
    }

    // Validate slug
    $slug = trim($body['slug'] ?? '');
    if ($slug === '') {
        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($title));
        $slug = trim($slug, '-');
    }
    if (!preg_match('/^[a-z0-9][a-z0-9-]*[a-z0-9]$/', $slug) && strlen($slug) > 1) {
        jsonError(400, 'Slug must contain only lowercase letters, numbers, and hyphens');
    }
    if (mb_strlen($slug) > 255) {
        jsonError(400, 'Slug must be 255 characters or fewer');
    }

    // Validate optional fields
    $excerpt = trim($body['excerpt'] ?? '');
    if (mb_strlen($excerpt) > 500) {
        jsonError(400, 'Excerpt must be 500 characters or fewer');
    }

    $author = trim($body['author'] ?? 'Admin');
    if (mb_strlen($author) > 100) {
        jsonError(400, 'Author must be 100 characters or fewer');
    }

    $imageUrl = trim($body['image_url'] ?? '');
    if ($imageUrl !== '' && !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
        jsonError(400, 'Invalid image URL');
    }
    if (mb_strlen($imageUrl) > 500) {
        jsonError(400, 'Image URL must be 500 characters or fewer');
    }

    $status = ($body['status'] ?? 'draft') === 'published' ? 'published' : 'draft';

    $db  = getDb();
    $sql = 'INSERT INTO blog_posts (title, slug, excerpt, body, author, image_url, status)
            VALUES (:title, :slug, :excerpt, :body, :author, :image_url, :status)';

    $stmt = $db->prepare($sql);
    $stmt->execute([
        ':title'     => $title,
        ':slug'      => $slug,
        ':excerpt'   => $excerpt ?: null,
        ':body'      => $content,
        ':author'    => $author,
        ':image_url' => $imageUrl ?: null,
        ':status'    => $status,
    ]);

    jsonResponse([
        'id'   => (int) $db->lastInsertId(),
        'slug' => $slug,
    ], 201);
}
