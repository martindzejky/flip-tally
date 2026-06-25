/**
 * `drag-dismiss` — let the user drag a bottom sheet downward to dismiss it.
 *
 * Built on Pointer Events (the standardized, unified pointer model), so the
 * same code covers touch, pen, and mouse without separate listeners. Attach it
 * to the sheet's grab area (the handle / header); vertical drags are reported
 * back through `onMove`/`onEnd` so the component owns the visual offset.
 *
 * The action only tracks downward movement (a sheet can't be dragged up past
 * its resting spot) and ignores gestures that are mostly horizontal, leaving
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
    // Ignore secondary mouse buttons; primary button / touch / pen only.
    if (event.button !== 0) return;

    startX = event.clientX;
    startY = event.clientY;
    tracking = true;
    committed = false;
  }

  function onPointerMove(event: PointerEvent) {
    if (!tracking) return;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (!committed) {
      // Wait for a small threshold before deciding the gesture's direction.
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) <= Math.abs(dx)) {
        // Horizontal or ambiguous — let the browser handle it, stop tracking.
        tracking = false;
        return;
      }
      committed = true;
      node.setPointerCapture(event.pointerId);
    }

    // Only downward drags move the sheet; clamp upward pull to 0.
    current.onMove(Math.max(0, dy));
  }

  function endGesture(event: PointerEvent) {
    if (!tracking) return;
    const wasCommitted = committed;
    tracking = false;
    committed = false;
    if (node.hasPointerCapture(event.pointerId))
      node.releasePointerCapture(event.pointerId);
    if (wasCommitted) current.onEnd(Math.max(0, event.clientY - startY));
  }

  node.addEventListener('pointerdown', onPointerDown);
  node.addEventListener('pointermove', onPointerMove);
  node.addEventListener('pointerup', endGesture);
  node.addEventListener('pointercancel', endGesture);

  return {
    update(next: DragDismissParams) {
      current = next;
    },
    destroy() {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', endGesture);
      node.removeEventListener('pointercancel', endGesture);
    },
  };
}
