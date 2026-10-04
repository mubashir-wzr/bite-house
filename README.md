# Bite House — Dynamic Next.js

Single dynamic Next.js application. No separate Express backend.

## Run
npm install
npm run dev

Open http://localhost:3000

## Production
npm run build
npm start

The `/api/orders` route is part of the same Next.js app. Orders are kept in memory in this demo, so they disappear when the server restarts. A permanent database would require a database service, but no separate Express server is needed.

## Burger frames
Copy `frame_001.jpg` through `frame_135.jpg` into `public/burger_frames/`.
