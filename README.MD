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

- Lighting
- Ranged Weapons with ammunition
- Ranged enemies + revamped ai

## Errata

### Copying Rooms to Map

Prior to branch `part-new-15`, adjacent rooms may generate without a dividing wall, allowing for monster and item count per "room" to be broken.

## Post-Tutorial Branch Summaries

### Refactor 1

The main thing I wanted to fix here was the mapping portion of the serialization code. Using a switch-case for both getting and setting the component data was a horrible implementation that I used because I got tired of fidgeting with bitECS's built in serializers. This is now greatly simplified so that new component types just need added to `WorldComponents` and `WorldComponentNames`(new array), and then the serialization functions handle them appropriately. An interface for components was also introduced to make this work, so now access for all components has the structure `MyComponent.values[eid]`.

Less important, but something I wanted to put in place since the beginning of the project was a way to decouple the size of the map from the screen. The player is now always centered on the screen.

And lastly, I made some files that didn't conform to kebab-casing. This has been fixed.

### Part New 15 - Doors & Pretty Walls

Obviously the main thing here is the addition of doors. They are placed at the end of hallways that have a single opening into a room with three open cells on the other side.

Ex. (X instead of # for wall)
X.X
X.X
...

Doors are represented as `+` when closed and `\` when open. They can be opened by bumping into them.

Also changed are the wall characters. I'd previously used bit-set walls and liked the look of them, so I brought that in here. It doesn't look as good with the square spacing for the cells, so experiment with setting `forceSquareRatio: false`. This could be remedied by using an image for the tiles instead of characters, though that is a topic for another day.

Ex.
╔══════════╗
║          ║
║  Hello!  ║
║          ║
╚══════════╝

To reduce the number of odd hallways that get produced, a new generator was made that connects a room to the closest room if a connection hasn't already been made. This no longer guarantees that all rooms end up connected, so that required that a path could be found from the player start position to the stairs down to the next level. Enemies and items are also spawned after a successful map has been generated now, because otherwise they were getting created for each try of making a map.