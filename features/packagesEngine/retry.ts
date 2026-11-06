/**
 * Milestone 46 — a failed provider call is tried once more after a short
 * pause. A cold server or a RapidAPI per-second limit can fail the first
 * call; without this the user saw "could not load travel data".
 */
export async function retryOnce<T>(run: () => Promise<T>, pauseMs = 700): Promise<T> {
  try {
    return await run();
  } catch {
    await new Promise((resolve) => setTimeout(resolve, pauseMs));
    return run();
  }
}
