# Area below the footer: same dark purple as the footer

## What was found
- The footer fades to a final colour of **#0c0013** at its bottom edge. This comes from the footer's own colours (`from-[#180224] via-[#14011f] to-[#0c0013]`). This is the colour the area below it must match.
- The page's outer background (html/body) is currently white. There is nothing below the footer; it ends exactly at the page end.
- The only purple set at page level is the site "theme colour" **#240738**. iPhone Safari uses it to tint areas around the page. This differs from the footer's dark purple and is the likely source of the mismatched purple. This could not be confirmed on a real iPhone from here.

## Change (one thing only)
When a visitor is near the bottom of any page, set the page's outer background to **#0c0013**, the footer's exact bottom colour. Safari then shows #0c0013 when the page is pulled past its end. When the visitor is back near the top, restore the current background.

Why only near the bottom: Safari shows the same outer background at the top when pulling down. Switching only near the bottom keeps the homepage top exactly as it is now, so the purple strip that was just removed cannot come back.

## Not changed
Also unchanged: the footer's colour, design, height and content, and any added space. Pull-to-stretch behaviour stays enabled. The header, video, top safe area, fonts, buttons, fields, spacing, and the theme colour setting stay the same too.

## Verification
- In a phone-sized browser: scroll to the end, confirm the outer background reads #0c0013. Scroll back to the top, confirm it reverts. Confirm the page height and the footer are unchanged, on the homepage and one inner page.
- Final check on a real iPhone in Safari after publishing: pull past the footer and look for one continuous dark purple with no line.

## Technical details
- One small scroll listener in `src/App.tsx` (passive, rAF-throttled). When `scrollY + innerHeight >= scrollHeight - innerHeight`, set `document.documentElement.style.backgroundColor = '#0c0013'`; otherwise clear it. Body keeps its own white background, so page content is visually unaffected.
