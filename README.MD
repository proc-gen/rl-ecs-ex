# Roguelike Tutorial in Typescript (ECS Style)

## Intro

I made this because I prefer an ECS structure for managing my game projects than OOP. The code is based on the existing tutorial for a roguelike in Typescript written by Nick Klepinger follows the libtcod tutorial. Things should "mostly" be the same in terms of functionality, except where I may have opted for slightly different values for stats, colors, or characters used for display purposes.

Having also followed the Rust Roguelike tutorial and converted much of the first two sections to C#, I intend to build past the original Typescript tutorial in similar ways.

- [Nick Klepinger's ROT.js Tutorial](https://klepinger.dev/rotjs-tutorial)
- [Rust Roguelike Tutorial](https://bfnightly.bracketproductions.com/chapter_0.html)

## Libraries

- [ROT.js](https://github.com/ondras/rot.js)
- [bitECS](https://github.com/NateTheGreatt/bitECS/tree/main)

## How to run

For any branch you pick, run the following commands in the project directory to start it up:

- `npm install`
- `npm run dev`

If these commands fail, you likely need to install [NodeJS](https://nodejs.org/)

## Branches

For ease of following along with the original tutorial, branch names are named `part-#`. Exceptions include `part-03` because I had already merged and didn't feel like changing the branch name, and `part-8` and `part-8b` correspond to two separate parts of the same chapter because I thought I could skip something and realized that was a bad idea before moving onto the next section.

Important: To find the corresponding tutorial text, subtract 1 from the branch number. That means that "part 0" of the tutorial has its code in the `part-1` branch.

This readme was created as part of the `refactor-1` branch to fix some inconsistencies in the code before going on to future work. Those branches will be labeled `part-new-#` so they aren't confused with the original tutorial sections.

## Next Up

- Doors
- Lighting
- Ranged Weapons with ammunition
- Ranged enemies + revamped ai

## Post-Tutorial Branch Summaries

### Refactor 1

The main thing I wanted to fix here was the mapping portion of the serialization code. Using a switch-case for both getting and setting the component data was a horrible implementation that I used because I got tired of fidgeting with bitECS's built in serializers. This is now greatly simplified so that new component types just need added to `WorldComponents` and `WorldComponentNames`(new array), and then the serialization functions handle them appropriately. An interface for components was also introduced to make this work, so now access for all components has the structure `MyComponent.values[eid]`.

Less important, but something I wanted to put in place since the beginning of the project was a way to decouple the size of the map from the screen. The player is now always centered on the screen.

And lastly, I made some files that didn't conform to kebab-casing. This has been fixed.
