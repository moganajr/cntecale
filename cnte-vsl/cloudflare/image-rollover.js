/** Keep the running classroom intact until there are no in-memory rooms. */
export async function adoptImageWhenIdle(container, port, healthTimeoutMs = 2500, approvedRetirementImage = null) {
  if (!container.running) return 'stopped';
  const desired = container.images.base;
  let info;
  try { info = await container.inspect(); } catch { return 'deferred'; }
  if (!info?.image || info.image === desired) return 'current-or-unknown';

  // Health contains only a room count, no student data. Fail closed if the
  // old instance cannot confirm it is idle. A separately approved retirement
  // may discard one room, but only on the specifically identified old image.
  try {
    const response = await container.getTcpPort(port).fetch('http://container/api/health', {
      signal: AbortSignal.timeout(healthTimeoutMs)
    });
    if (!response.ok) { await response.body?.cancel(); return 'deferred'; }
    const health = await response.json();
    if (health.status !== 'ok' || (health.rooms !== 0 &&
        !(health.rooms === 1 && approvedRetirementImage === info.image))) return 'deferred';
  } catch { return 'deferred'; }

  await container.destroy();
  return 'restarted';
}
