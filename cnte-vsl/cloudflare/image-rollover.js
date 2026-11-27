/** Keep the running classroom intact until there are no in-memory rooms. */
export async function adoptImageWhenIdle(container, port, healthTimeoutMs = 2500) {
  if (!container.running) return 'stopped';
  const desired = container.images.base;
  let info;
  try { info = await container.inspect(); } catch { return 'deferred'; }
  if (!info?.image || info.image === desired) return 'current-or-unknown';

  // Health contains only a room count, no student data. Fail closed if the
  // old instance cannot confirm it is idle; never discard an active class.
  try {
    const response = await container.getTcpPort(port).fetch('http://container/api/health', {
      signal: AbortSignal.timeout(healthTimeoutMs)
    });
    if (!response.ok) { await response.body?.cancel(); return 'deferred'; }
    const health = await response.json();
    if (health.status !== 'ok' || health.rooms !== 0) return 'deferred';
  } catch { return 'deferred'; }

  await container.destroy();
  return 'restarted';
}
