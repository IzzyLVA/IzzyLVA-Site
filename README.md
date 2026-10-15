# IZZY / ONLINE — Signal Graffiti Portfolio

A multi-page personal portfolio with a street-culture / cybersecurity visual identity. Built with plain HTML, CSS, and JavaScript.

## Pages
- `index.html` — home, original character art, animated network/map visualization, and project highlights
- `about.html` — personal direction, experience, motivation, and current focus
- `operations.html` — project board and expandable case files
- `challenges.html` — three-stage beginner browser puzzle (source inspection, binary-to-ASCII, least privilege)
- `broadcast.html` — static transmission log for project and learning updates
- `manifesto.html` — personal principles
- `contact.html` — contact landing page (replace placeholder email before deployment)

## Run locally
Open `index.html` in a browser. The map can use TopoJSON data from jsDelivr when internet access is available; a local fallback is built into `script.js`.

## Before publishing
1. Replace `YOUR_EMAIL_HERE@example.com` in `contact.html` with an address you are comfortable making public.
2. Add your real repository/profile links to relevant project case files once you choose what to publish.
3. Test the layout on mobile and with keyboard-only navigation.
4. Check reduced-motion behavior and confirm the custom cursor does not interfere with links or form controls.
5. Deploy as a static site (GitHub Pages or Vercel both work).

## CTF safety note
The visitor CTF is intentionally a client-side demo. Its answers and validation logic are visible to visitors and are not suitable for secrets, real authentication, or a secure leaderboard. It only contains harmless, local browser puzzles.

## Broadcast updates
To add a post, duplicate an `article.transmission` block in `broadcast.html`, change its TX number and metadata, and place it at the top of `.transmission-list`.

## Asset and privacy notes
`Character.png` is the original character asset supplied for this project. No Watch Dogs game art is included. The map's displayed IP values are reserved documentation examples and do not represent visitor IP addresses. The site does not need to collect visitor IPs for the animated map effect.
