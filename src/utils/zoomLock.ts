/**
 * Viewport Stabilization & Horizontal Drift Prevention Utility
 * 
 * Ensures:
 * 1. Exactly one meta viewport tag exists with:
 *    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
 * 2. Absolutely NO modifications to font-size, field dimensions, padding, or layouts.
 * 3. Horizontal layout drift and page widening during typing/input are completely prevented.
 * 4. Natural vertical scrolling remains 100% active and unhindered.
 */

const TARGET_VIEWPORT = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover';

export const enforceViewport = () => {
  if (typeof document === 'undefined') return;

  const metaTags = document.querySelectorAll('meta[name="viewport"]');
  if (metaTags.length > 0) {
    const primaryMeta = metaTags[0];
    if (primaryMeta.getAttribute('content') !== TARGET_VIEWPORT) {
      primaryMeta.setAttribute('content', TARGET_VIEWPORT);
    }
    // Remove any redundant or conflicting viewport tags
    for (let i = 1; i < metaTags.length; i++) {
      metaTags[i].remove();
    }
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', TARGET_VIEWPORT);
    document.head.appendChild(meta);
  }
};

export const resetHorizontalDrift = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (window.scrollX !== 0 || window.pageXOffset !== 0) {
    window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' as ScrollBehavior });
  }
  if (document.documentElement && document.documentElement.scrollLeft !== 0) {
    document.documentElement.scrollLeft = 0;
  }
  if (document.body && document.body.scrollLeft !== 0) {
    document.body.scrollLeft = 0;
  }
};

export const initZoomLock = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // 1. Enforce single target viewport tag
  enforceViewport();

  // 2. Prevent horizontal displacement during typing in fields
  const handleTypingOrInteraction = () => {
    resetHorizontalDrift();
  };

  document.addEventListener('input', handleTypingOrInteraction, { capture: true, passive: true });
  document.addEventListener('beforeinput', handleTypingOrInteraction, { capture: true, passive: true });
  document.addEventListener('keydown', handleTypingOrInteraction, { capture: true, passive: true });
  document.addEventListener('keyup', handleTypingOrInteraction, { capture: true, passive: true });
  document.addEventListener('focusin', handleTypingOrInteraction, { capture: true, passive: true });

  // 3. Prevent horizontal displacement when inputs blur / keyboard closes
  const handleFocusOut = () => {
    resetHorizontalDrift();
    setTimeout(resetHorizontalDrift, 30);
    setTimeout(resetHorizontalDrift, 100);
    setTimeout(resetHorizontalDrift, 300);
  };

  document.addEventListener('focusout', handleFocusOut, { capture: true, passive: true });

  // 4. Monitor visualViewport to prevent horizontal drift
  if (window.visualViewport) {
    const handleViewportChange = () => {
      if (window.visualViewport && window.visualViewport.offsetLeft !== 0) {
        resetHorizontalDrift();
      }
    };
    window.visualViewport.addEventListener('resize', handleViewportChange, { passive: true });
    window.visualViewport.addEventListener('scroll', handleViewportChange, { passive: true });
  }

  // 5. Lock horizontal scroll without restricting natural vertical scroll
  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollX !== 0 || window.pageXOffset !== 0) {
        resetHorizontalDrift();
      }
    },
    { passive: true }
  );

  // 6. Selection change (caret movement when typing)
  document.addEventListener('selectionchange', () => {
    if (window.scrollX !== 0 || (document.documentElement && document.documentElement.scrollLeft !== 0)) {
      resetHorizontalDrift();
    }
  }, { passive: true });
};
