/**
 * Host half of the `dsh-chat-edit` bundle.
 *
 * The whole feature lives in the browser half (`./client`): it adds
 * per-turn Edit/Delete actions to the conversation and performs them through
 * existing Client services (`sessions.fork`, `remote.session.prompt`,
 * `uiWorkspace.openSession`). This Host row therefore has no behavior; it
 * exists so the bundle is a complete Cordis plugin that the profile can load
 * and so plugin metadata/configuration surfaces list it.
 *
 * @module dsh-chat-edit
 */

/** Host plugin body — no Host-side behavior for this surface. */
export function apply() {}
