@AGENTS.md

# Motion libraries

`gsap` (+ `ScrollTrigger`) is the default for scroll-pinned/scrubbed sections — see `components/ScrubScene.tsx` for the reusable pin+scrub wrapper every scroll-driven section should build on.

`animejs` (v4) is also a project dependency (`npm i animejs`, already installed) for cases GSAP is a worse fit — timeline choreography closer to the animejs.com reference site (staggered, spring-driven, non-scroll-linked sequences). Prefer GSAP for anything tied to scroll position; reach for anime.js for self-playing entrance/micro-interaction sequences instead.
