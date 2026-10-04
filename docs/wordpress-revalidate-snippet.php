<?php
/**
 * Sherpa — revalidación del sitio al editar contenido.
 *
 * Se instala en WordPress con el plugin Code Snippets (Snippets → Add New → pegar esto
 * SIN la primera línea "<?php" → "Run snippet everywhere" → Save and Activate). Activarlo recién DESPUÉS de que esté
 * deployado /api/revalidate y cargada REVALIDATE_SECRET en Vercel: antes, cada guardado
 * esperaría la respuesta de un endpoint que no existe.
 *
 * Qué hace:
 *   - Al publicar, editar, despublicar o borrar un artículo, tour, ciudad, país, página,
 *     sección, banner o FAQ, avisa a www.sherpafoodtours.com/api/revalidate/ y la página
 *     se actualiza en la próxima visita (antes tardaba hasta 24 horas).
 *   - Lo mismo al editar o borrar una imagen de la biblioteca (alt text, reemplazo).
 *   - Agrega "Refrescar sitio" en la barra del admin para forzar todo el sitio a mano.
 *
 * Endpoint y contrato: src/app/api/revalidate/route.ts en el repo del frontend.
 */

// El mismo valor que REVALIDATE_SECRET en Vercel. Sólo lo ven los administradores de WP.
const SHERPA_REVALIDATE_SECRET = 'PEGAR-ACA-EL-SECRET';
// Con barra final: sin ella el sitio responde 308 antes de llegar al endpoint.
const SHERPA_REVALIDATE_URL = 'https://www.sherpafoodtours.com/api/revalidate/';

// Tipos que se muestran en el sitio. "post" revalida sólo lo que lista artículos; el resto
// aparece en navbar, footer y varias páginas, así que revalida todo.
const SHERPA_REVALIDATE_TYPES = ['post', 'tours', 'cities', 'countries', 'page', 'embedsections', 'banner', 'faq'];

function sherpa_revalidate_send(array $payload) {
    $response = wp_remote_post(SHERPA_REVALIDATE_URL, [
        'timeout' => 5,
        'headers' => [
            'content-type'        => 'application/json',
            'x-revalidate-secret' => SHERPA_REVALIDATE_SECRET,
        ],
        'body'    => wp_json_encode($payload),
    ]);
    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        error_log('[sherpa-revalidate] fallo: ' . (is_wp_error($response)
            ? $response->get_error_message()
            : wp_remote_retrieve_response_code($response) . ' ' . wp_remote_retrieve_body($response)));
        return false;
    }
    return true;
}

// Se junta todo lo que cambió durante el request y se avisa una sola vez al final: así ACF
// ya guardó sus campos y un guardado que toca varias cosas no dispara varios avisos.
$GLOBALS['sherpa_revalidate_queue'] = [];

add_action('transition_post_status', function ($new_status, $old_status, $post) {
    if (!in_array($post->post_type, SHERPA_REVALIDATE_TYPES, true)) return;
    if (wp_is_post_revision($post) || wp_is_post_autosave($post)) return;
    // Sólo lo que está o estaba publicado: un borrador no cambia nada en el sitio.
    if ($new_status !== 'publish' && $old_status !== 'publish') return;
    $GLOBALS['sherpa_revalidate_queue'][$post->post_type] = $post->post_name;
}, 10, 3);

foreach (['edit_attachment', 'delete_attachment'] as $hook) {
    add_action($hook, function () {
        $GLOBALS['sherpa_revalidate_queue']['attachment'] = '';
    });
}

add_action('shutdown', function () {
    $queue = $GLOBALS['sherpa_revalidate_queue'] ?? [];
    if (!$queue) return;
    if (count($queue) === 1 && isset($queue['post'])) {
        sherpa_revalidate_send(['type' => 'post', 'slug' => $queue['post']]);
    } else {
        sherpa_revalidate_send(['scope' => 'all', 'type' => implode(',', array_keys($queue))]);
    }
});

// Botón manual en la barra del admin.
add_action('admin_bar_menu', function ($bar) {
    if (!current_user_can('edit_posts')) return;
    $bar->add_node([
        'id'    => 'sherpa-revalidate',
        'title' => 'Refrescar sitio',
        'href'  => wp_nonce_url(admin_url('admin-post.php?action=sherpa_revalidate_all'), 'sherpa_revalidate_all'),
    ]);
}, 100);

add_action('admin_post_sherpa_revalidate_all', function () {
    if (!current_user_can('edit_posts')) wp_die('Sin permisos');
    check_admin_referer('sherpa_revalidate_all');
    $ok = sherpa_revalidate_send(['scope' => 'all', 'type' => 'manual']);
    $back = wp_get_referer() ?: admin_url();
    wp_safe_redirect(add_query_arg('sherpa_revalidate', $ok ? 'ok' : 'error', $back));
    exit;
});

add_action('admin_notices', function () {
    if (!isset($_GET['sherpa_revalidate'])) return;
    $ok = $_GET['sherpa_revalidate'] === 'ok';
    printf(
        '<div class="notice notice-%s is-dismissible"><p>%s</p></div>',
        $ok ? 'success' : 'error',
        $ok ? 'Sitio refrescado: los cambios se ven en la próxima visita a cada página.'
            : 'No se pudo refrescar el sitio. Revisá el log de PHP ([sherpa-revalidate]).'
    );
});
