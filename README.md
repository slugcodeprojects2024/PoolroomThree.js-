# Poolrooms - Assignment 5: Three.js

## Overview
This project is a first-person 3D exploration scene built with Three.js for CSE 160 Assignment 5. It features a poolroom, temple, walkway, collectibles, animated goldfish, dynamic lighting, and more. The scene is explorable with WASD + mouse controls and includes a skybox, music, and interactive UI.

## Features Checklist
- **20+ 3D primary shapes:** Cubes, spheres, cylinders, cones, etc. (gallery, pillars, collectibles, etc.)
- **At least 1 textured shape:** Pool floor, skybox, collectibles, etc.
- **At least 1 animated shape:** Gallery shapes (rotate and color cycle), goldfish (swim), collectibles (rotate/bob)
- **3+ different kinds of shapes:** Cubes, spheres, cylinders, cones, etc.
- **1+ textured 3D model (.obj):** Collectibles, temple head
- **3+ different light sources:** AmbientLight, DirectionalLight, HemisphereLight, PointLight
- **Textured skybox:** Yes
- **Perspective camera:** Yes
- **Mouse/camera controls:** First-person controls (WASD, mouse look, Q/E rotate)
- **Extra feature (Wow Point):**
  - Collectible system with animated OBJ models and UI
  - Animated goldfish swimming in the pool
  - Dynamic color-changing art gallery shapes
  - Underwater effect overlay
  - Background music with a play button
  - Large, explorable world with temple, pool, walkway, and more

## Controls
- **WASD:** Move
- **Mouse:** Look around
- **Q/E:** Rotate camera
- **Shift:** Sprint
- **Space:** Jump
- **Click "Play Music" button:** Start background music

## Wow Point
- The project features a collectible system, animated goldfish, dynamic color transitions, and an underwater effect overlay for immersion. The world is large and explorable, with a temple, pool, walkway, and more.

## Lighting Difficulties (Note for Grader)
Lighting in Three.js can be tricky, especially with complex scenes and custom models. During development, I encountered several issues:
- **Three.js lights not affecting some models:** Some OBJ models and materials did not respond to lighting as expected, especially when using custom or imported materials.
- **Debugging light/material interactions:** I had to ensure all objects used light-reactive materials (like MeshPhongMaterial) and avoid custom shaders for objects that needed to be lit.
- **UI and code complexity:** Multiple lighting controls and helpers were tested and iterated on. The final solution uses Ambient, Directional, and Hemisphere lights, all of which are visible and adjustable.
- **Glass and transparency:** Achieving a good glass look for windows was challenging; the final version uses open wall holes for clarity.

**If you want to test lighting, use the sliders in the top left to adjust ambient and sun light.**

## How to Run
- Open `index.html` in a browser (requires a local server for module imports).
- Click the "Play Music" button to start background music.
- Explore the world and collect all collectibles!

## Live Site
_Please see the Canvas submission comment for the live site link._
