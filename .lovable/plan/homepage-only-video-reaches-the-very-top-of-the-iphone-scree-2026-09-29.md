# Homepage only: video reaches the very top of the iPhone screen

## What was found
- The site already has `viewport-fit=cover` in its single viewport tag, so nothing is added there.
- The whole site sets a purple "theme colour" (#240738). iPhone Safari uses this colour to paint the strip behind the clock and battery. This is the most likely source of the purple band. It could not be confirmed on a real iPhone from here.
- On the homepage, the video sits at the very top with a transparent header floating over it. No spacer or padding separates them.

## Changes (homepage only)
1. **Remove the purple theme colour on the homepage only.** The homepage stops sending the purple colour. Safari then shows the page itself (the video) behind the status bar. All other pages keep the purple colour and their current top-area behaviour.
2. **Stretch the video area behind the status bar.** The video box gets extra height equal to the iPhone's top safe area and is pulled up by that same amount. The video now starts at the physical top edge. Because the height added equals the amount pulled up, the rest of the page does not move.
3. **Header contents respect the safe area.** Only the inside of the header gets top padding for the safe area, so the logo, menu and sign-in sit under the clock instead of touching it. The header stays transparent over the video, and its size and items stay the same. When the page is scrolled, the header's background covers the safe area too, so text never shows through behind the clock.
4. **No purple flash before the video loads.** The video box's background changes from the purple look to black, which matches the video's first frame. The video already uses a black wrapper, so this is the same colour it shows today.

## Not changed
The video file, autoplay, loop, mute, fit, and position stay as they are. Texts, fonts, logo, buttons, colours, later sections, footer, side menu, scroll/overscroll behaviour, and every non-home page also stay the same.

## Verification
- Test in the preview on a phone-sized screen with a simulated iPhone top safe area. Check that the video starts at y=0, that header items sit below the safe area, and that nothing below the video moved.
- Check the homepage page source for no purple theme colour, and one other page for the purple colour still in place.
- A final check on a real iPhone in Safari is needed after publishing. The preview inside the editor cannot show the real status bar.

## Technical details
- `src/routes/__root.tsx`: remove the global `theme-color` meta. Add it back in the `head()` of every non-home route with the same value, or add it back client-side for non-home views, since the homepage is rendered by `RifansApp`. The simplest safe approach is a small effect in `App.tsx`: set or remove `meta[name=theme-color]` based on whether the current view is the landing page. Keep the SSR default without theme-color only for `/`.
- `IntroVideo.tsx`: add `mt-[calc(-1*env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]` on the outer black wrapper. The video element itself is unchanged.
- `Header.tsx`: add `pt-[env(safe-area-inset-top)]` and `h-[calc(52px+env(safe-area-inset-top))]` (with matching sm/md sizes) on the landing page only, via a prop or a route check.
