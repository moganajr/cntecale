/** CNTE-VSL container backend — NO public route. Authentication belongs to
 * the existing cnte-vsl-proxy Worker; requests arrive by service binding.
 * Set CNTE_VSL_BRIDGE_KEY as a secret on BOTH Workers (same random 32+ bytes).
 */
import { DurableObject } from "cloudflare:workers";

const PORT = 8080;
const ROOM_CONTAINER_ID = "cnte-vsl-dev-single-instance";
const INACTIVITY_MS = 4 * 60 * 60 * 1000;

function authorize(request, env) {
  const key = env.CNTE_VSL_BRIDGE_KEY;
  return typeof key === "string" && key.length >= 32 &&
    request.headers.get("X-CNTE-VSL-Bridge") === key;
}

export class VslContainer extends DurableObject {
  starting;
  async fetch(request) {
    if (!authorize(request, this.env)) {
      return new Response("Forbidden", { status: 403 });
    }
    this.starting ??= this.startAndWait().finally(() => { this.starting = undefined; });
    await this.starting;
    const url = new URL(request.url);
    url.protocol = "http:";
    url.host = "container";
    const forwarded = new Request(url, request);
    forwarded.headers.delete("host");
    forwarded.headers.delete("X-CNTE-VSL-Bridge");
    forwarded.headers.set("X-CNTE-Preview-Key", this.env.CNTE_VSL_BRIDGE_KEY);
    return this.ctx.container.getTcpPort(PORT).fetch(forwarded);
  }
  async startAndWait() {
    const container = this.ctx.container;
    if (!container.running) {
      container.start({
        image: container.images.base,
        instance: "lite",
        enableInternet: false,
        env: {
          NODE_ENV: "production",
          HOST: "0.0.0.0",
          PORT: String(PORT),
          LIVE_PREVIEW_KEY: this.env.CNTE_VSL_BRIDGE_KEY
        }
      });
    }
    await container.setInactivityTimeout(INACTIVITY_MS);
    const port = container.getTcpPort(PORT);
    let lastError;
    for (let i = 0; i < 75; i++) {
      try {
        const res = await port.fetch("http://container/api/health", {
          signal: AbortSignal.timeout(1200)
        });
        await res.body?.cancel();
        if (res.ok) return;
        lastError = new Error("Health response " + res.status);
      } catch (error) { lastError = error; }
      await scheduler.wait(250);
    }
    throw new Error("CNTE-VSL container failed readiness check", { cause: lastError });
  }
}

export default {
  fetch(request, env) {
    if (!authorize(request, env)) {
      return new Response("Forbidden", { status: 403 });
    }
    return env.VSL_CONTAINER.getByName(ROOM_CONTAINER_ID).fetch(request);
  }
};
