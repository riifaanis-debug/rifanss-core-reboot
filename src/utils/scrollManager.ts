/**
 * Central Scroll & Navigation Manager for Rifans Financial
 * Ensures 100% reliable scroll-to-top on route changes across all devices
 * (specifically iOS Safari, Android Chrome, and desktop browsers).
 * Also accurately handles in-page section jumps with sticky header offset.
 */

// Global pending section target when navigating from another page to home
let pendingSectionTarget: string | null = null;

/**
 * Forcefully and instantly resets scroll position to (0, 0)
 * across all potential scroll containers (window, documentElement, body, root, main).
 */
export const forceScrollToTop = () => {
  if (typeof window === 'undefined') return;

  // Window scroll instant
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  } catch {
    window.scrollTo(0, 0);
  }

  // Document & Body scroll
  if (document.documentElement) {
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
  }
  if (document.body) {
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
  }

  // Application root and main elements
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.scrollTop = 0;
    rootEl.scrollLeft = 0;
  }
  const mainEl = document.querySelector('main');
  if (mainEl) {
    mainEl.scrollTop = 0;
    mainEl.scrollLeft = 0;
  }
};

/**
 * Multi-stage scroll-to-top scheduler tailored for WebKit/iOS Safari.
 * Fires synchronously, on layout frames, and after paints to prevent
 * Safari from restoring previous scroll positions after dynamic DOM updates.
 */
export const scheduleScrollToTop = () => {
  if (typeof window === 'undefined') return;

  // Stage 1: Synchronous immediate reset
  forceScrollToTop();

  // Stage 2: Animation frame 1 (post-DOM update)
  requestAnimationFrame(() => {
    forceScrollToTop();

    // Stage 3: Animation frame 2 (post-paint)
    requestAnimationFrame(() => {
      forceScrollToTop();
    });
  });

  // Stage 4: Safety timeouts for late-loading images, fonts, or async components
  setTimeout(forceScrollToTop, 50);
  setTimeout(forceScrollToTop, 150);
  setTimeout(forceScrollToTop, 300);
};

/**
 * Smoothly scrolls to an in-page section, accurately taking into account
 * the fixed header height so section headers are never obscured.
 */
export const scrollToSection = (sectionId: string, smooth: boolean = true): boolean => {
  if (typeof window === 'undefined') return false;

  const cleanId = sectionId.replace(/^[#/]+/, '');
  if (!cleanId) {
    scheduleScrollToTop();
    return true;
  }

  const elem = document.getElementById(cleanId);
  if (elem) {
    // Fixed header height + clearance padding
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 72;
    const clearance = 16; // breathing space
    const headerOffset = headerHeight + clearance;

    const elementPosition = elem.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    try {
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior),
      });
    } catch {
      window.scrollTo(0, Math.max(0, offsetPosition));
    }
    return true;
  }
  return false;
};

/**
 * Checks if the current hash or path represents an in-page section anchor.
 */
export const extractSectionId = (hashOrPath: string): string | null => {
  if (!hashOrPath) return null;

  // Examples: "#faq", "#business-fields", "#about", "#/#business-fields", "#/#faq"
  if (hashOrPath === '#faq' || hashOrPath === '#/#faq') return 'faq';
  if (hashOrPath === '#business-fields' || hashOrPath === '#/#business-fields') return 'business-fields';
  if (hashOrPath === '#about' || hashOrPath === '#/#about') return 'about';

  // Section anchor pattern e.g. "#section-name" (not starting with "#/")
  if (hashOrPath.startsWith('#') && !hashOrPath.startsWith('#/')) {
    const clean = hashOrPath.replace(/^#/, '');
    if (clean && !clean.includes('/')) {
      return clean;
    }
  }

  return null;
};

/**
 * Sets a pending section target to scroll to after landing page mounts.
 */
export const setPendingSection = (sectionId: string | null) => {
  pendingSectionTarget = sectionId;
};

export const getPendingSection = (): string | null => {
  return pendingSectionTarget;
};

/**
 * Navigate to an anchor or a full page.
 */
export const navigateTo = (pathOrAnchor: string, e?: React.MouseEvent) => {
  if (e) e.preventDefault();

  const sectionId = extractSectionId(pathOrAnchor);

  // If it's a section anchor
  if (sectionId) {
    const isElementOnPage = document.getElementById(sectionId) !== null;
    if (isElementOnPage) {
      // Element is already on current page, smooth scroll directly to it
      scrollToSection(sectionId, true);
      // Keep URL hash updated cleanly without reloading
      if (window.location.hash !== `#${sectionId}`) {
        history.replaceState(null, '', `#${sectionId}`);
      }
      return;
    } else {
      // Element is on the LandingPage, but user is currently on another page
      setPendingSection(sectionId);
      window.location.hash = '#/';
      return;
    }
  }

  // Standard full-page navigation:
  // Instantly reset scroll to top BEFORE route transition happens
  forceScrollToTop();
  window.location.hash = pathOrAnchor || '#/';
};

/**
 * Initialize global scroll restoration and global click listeners
 */
export const initGlobalScrollRestoration = () => {
  if (typeof window === 'undefined') return;

  // 1. Disable browser's automatic scroll restoration on history navigations
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  // 2. Intercept link clicks globally for consistent scroll behavior
  const handleGlobalClick = (event: MouseEvent) => {
    // Find closest anchor tag
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Ignore external or non-http links
    if (
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      anchor.hasAttribute('download') ||
      anchor.target === '_blank'
    ) {
      return;
    }

    // Hash links
    if (href.startsWith('#')) {
      if (href === '#' || href === '#!' || href === '#top') {
        return;
      }

      const sectionId = extractSectionId(href);

      if (sectionId) {
        // Section link:
        const elem = document.getElementById(sectionId);
        if (elem) {
          event.preventDefault();
          scrollToSection(sectionId, true);
          if (window.location.hash !== `#${sectionId}`) {
            history.replaceState(null, '', `#${sectionId}`);
          }
          return;
        } else {
          // Section on landing page from another page
          event.preventDefault();
          setPendingSection(sectionId);
          window.location.hash = '#/';
          return;
        }
      }

      // Page link (e.g. "#/about", "#/services", "#/")
      // Force scroll reset immediately so the page never opens from the bottom
      forceScrollToTop();
    }
  };

  document.addEventListener('click', handleGlobalClick, { capture: true });

  // 3. Keep layout horizontally stable and prevent drift when soft keyboard closes
  const handleFocusOut = (e: FocusEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY);
      }
    }
  };
  document.addEventListener('focusout', handleFocusOut);

  return () => {
    document.removeEventListener('click', handleGlobalClick, { capture: true });
    document.removeEventListener('focusout', handleFocusOut);
  };
};
