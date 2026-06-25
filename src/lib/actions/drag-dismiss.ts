/**
 * `drag-dismiss` — let the user drag a bottom sheet downward to dismiss it.
 *
 * Built on Pointer Events (the standardized, unified pointer model), so the
 * same code covers touch, pen, and mouse without separate listeners. Attach it
 * to the sheet's grab area (the handle / header); vertical drags are reported
 * back through `onMove`/`onEnd` so the component owns the visual offset.
 *
 * The move/up listeners live on `window` (added on pointer-down, removed on
 * release) rather than on the node, so the gesture keeps tracking even when the
 * pointer leaves the small handle — which is what happens on a fast flick.
 *
 * The action only tracks downward movement (a sheet can't be dragged up past
 * its resting spot) and bails on gestures that are mostly horizontal, leaving
 * those to the browser / system (e.g. iOS edge-swipe back).
 */

export type DragDismissParams = {
  /** Live downward offset in px (>= 0) while dragging. */
  onMove: (dy: number) => void;
  /** Final downward offset in px (>= 0) when the pointer is released. */
  onEnd: (dy: number) => void;
  /** Disable tracking (e.g. when the sheet is closed). Defaults to true. */
  enabled?: boolean;
};

// Movement (px) before the gesture's direction is judged.
const DIRECTION_THRESHOLD = 6;

export function dragDismiss(node: HTMLElement, params: DragDismissParams) {
  let current = params;
  let startX = 0;
  let startY = 0;
  let tracking = false;
  // Becomes true once the gesture is clearly vertical, so a horizontal swipe
  // never gets hijacked as a dismiss.
  let committed = false;

  function onPointerDown(event: PointerEvent) {
    if (current.enabled === false) return;
    // Primary button / touch / pen only; ignore secondary mouse buttons.
    if (event.button !== 0) return;

    startX = event.clientX;
    startY = event.clientY;
    tracking = true;
    committed = false;

    // Stop a mouse-drag from selecting the handle/header text.
    event.preventDefault();

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', endGesture);
    window.addEventListener('pointercancel', endGesture);
  }

  function onPointerMove(event: PointerEvent) {
    if (!tracking) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!committed) {
      if (
        Math.abs(dx) < DIRECTION_THRESHOLD &&
        Math.abs(dy) < DIRECTION_THRESHOLD
      )
        return;
      if (Math.abs(dy) <= Math.abs(dx)) {
        // Horizontal or ambiguous — let the browser keep it, stop tracking.
        cleanup();
        return;
      }
      committed = true;
    }

    event.preventDefault();
    // Only downward drags move the sheet; clamp upward pull to 0.
    current.onMove(Math.max(0, dy));
  }

  function endGesture(event: PointerEvent) {
    if (!tracking) return;
    const wasCommitted = committed;
    const dy = event.clientY - startY;
    cleanup();
    if (wasCommitted) current.onEnd(Math.max(0, dy));
  }

  function cleanup() {
    tracking = false;
    committed = false;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endGesture);
    window.removeEventListener('pointercancel', endGesture);
  }

  node.addEventListener('pointerdown', onPointerDown);

  return {
    update(next: DragDismissParams) {
      current = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      cleanup();
    },
  };
}
