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

- ~~Doors and Pretty Walls~~
- ~~Lighting~~
- ~~Ranged Weapons with ammunition~~
- ~~"Animations"~~
- Ranged enemies + revamped ai

## Errata

### Copying Rooms to Map

Prior to branch `part-new-15`, adjacent rooms may generate without a dividing wall, allowing for monster and item count per "room" to be broken.

### Inspect Tile

Introduced in branch `refactor-1` and fixed in `part-new-16`, the inspect tile feature was not updated to use the player position offset used to keep the player in the center of the screen.

Also needing fixed was the inspect feature when looking at doors and was introduced in `part-new-15`. Doors were not implemented with their own `InfoComponent`, and inspect required that every entity had that component attached. Inspect now properly skips over entities that don't have an `InfoComponent`, and the inspect information for doors is determined by the tile information.

### Using and item when everything is already dead

This bug has probably been around since the inventory was implemented and finally fixed in `part-new-17`. If a consumable item is used after everything is dead, the `UpdateRemoveSystem` won't run before the player's next turn. Without really digging to remember why that system runs first in the update cycle instead of last, it's now called individually in `changeCurrentActor()` if there's only one entity left in the actor array.

### Player taking multiple turns at once

Turns out just checking if it's the player's turn wasn't enough. If you pressed keys to take turns multiple times before the update loop finished, it was possible that they would all be processed before the computer got a turn. This became especially apparent with the addition of animations because even melee has a half second animation. This was fixed in `part-new-18` since the animations made it so obvious.

### Standing still can hurt yourself?

In the refactor of the `UpdateActionSystem` during `part-new-17`, the code to handle doing nothing for a turn wasn't entirely put in the right place. The only thing still working was running into a wall giving an action error that the player can't move there. This has been remedied in `part-new-18`. 

## Post-Tutorial Branch Summaries

### Refactor 1

The main thing I wanted to fix here was the mapping portion of the serialization code. Using a switch-case for both getting and setting the component data was a horrible implementation that I used because I got tired of fidgeting with bitECS's built in serializers. This is now greatly simplified so that new component types just need added to `WorldComponents` and `WorldComponentNames`(new array), and then the serialization functions handle them appropriately. An interface for components was also introduced to make this work, so now access for all components has the structure `MyComponent.values[eid]`.

Less important, but something I wanted to put in place since the beginning of the project was a way to decouple the size of the map from the screen. The player is now always centered on the screen.

And lastly, I made some files that didn't conform to kebab-casing. This has been fixed.

### Part New 15 - Doors & Pretty Walls

Obviously the main thing here is the addition of doors. They are placed at the end of hallways that have a single opening into a room with three open cells on the other side.

Ex.  
<pre>
#.#
#.#
...
</pre>

Doors are represented as `+` when closed and `\` when open. They can be opened by bumping into them.

Also changed are the wall characters. I'd previously used bit-set walls and liked the look of them, so I brought that in here. It doesn't look as good with the square spacing for the cells, so experiment with setting `forceSquareRatio: false`. This could be remedied by using an image for the tiles instead of characters, though that is a topic for another day.

Ex.
<pre>  
╔══════════╗  
║          ║  
║          ║  
║          ║  
╚══════════╝  
</pre>

To reduce the number of odd hallways that get produced, a new generator was made that connects a room to the closest room if a connection hasn't already been made. This no longer guarantees that all rooms end up connected, so that required that a path could be found from the player start position to the stairs down to the next level. Enemies and items are also spawned after a successful map has been generated now, because otherwise they were getting created for each try of making a map.

### Part New 16 - Lighting

While simply brightening up the area in the player's immediate field of view works, using lighting equations adds a new level of depth to the visual.

Player FOV is now effectively infinite at 99 tiles. To combat automatically adding every tile as seen, it needs to be in the both be in the FOV and have a minimum lighting level. This makes it possible to see the door at the end of a long hallway and miss seeing a door off to the side halfway down.

Point lights and spot lights have both been implemented. In both cases, there's a source location, an intensity level, and a color. Spot lights also have a target location to know which direction they're pointed. The angle is hard-coded for the size of the cone. Light intensity dropoff is simply calculated by `lightIntensity / distanceToSource` and is clamped to be in the range of `0.0-1.0`. Additionally, the player is a moving point light.

Lights can also "cast shadows", to a certain degree. Because the same FOV function is used to determine everywhere a light can touch, updates were made so that if it hits an entity with a `BlockerComponent` attached, it blocks the light from moving past it. This means both the player and enemies can effectively "turn off" lights by walking over them.

Unrelated to lighting, rendering has been entirely decoupled from the rest of the update process. It will automatically run at ~20 times per second. I'd originally planned on including fluctuating lighting intensity that would've been updated separately from the normal turn taking process, but I decided that wasn't important for now and could be handled later.

### Part New 17 - Ranged Weapons and Ammunition

Finally, you don't need a scroll to cause some damage from afar. Slings and Bows have been added, taking ammunition of Stones and Arrows respectively.

These weapons required a revamp of the item action types to allow for more than just Use and Drop. It would be possible to determine the various actions based on if the weapon was loaded or not, but the new action types make it easier to read and understand. Also, just a lot more stronger typing in general with using `keyof typeof` to establish types based on most things already in the constants directory.

To make it a little more interesting, ammunition is required to use ranged weapons. The weapons will always be loaded when initially picked up.

The original plan was to include animated projectiles moving to their target, but that's been pushed off because this branch was getting a little large already. That will be part of the next branch and should include animations for all the spells as well. This does put off ranged opponents and a rework of their AI, but all in due time.

### Part New 18 - "Animations"

This update may make it much more visible that things are happening, but I left the title in quotation marks because it's a different model than if you were working with tilesets in 2D or fancy shaders in 3D. ROT.js also has a limitation of integer coordinates for rendering, so projectile movement gets a little wonky too.

There are three main animation styles implemented:

- Flash Character
  - Specified character starts with a color, then gets its color multiplied by 90% each animation frame
- Flash Light
  - Specified color is treated as a point light at a given location, then gets its color multiplied by 90% each animation frame
- Follow Path
  - A light and/or character is given beginning and end positions, then is moved to each position in the line per animation frame

These can be used in combination with each other and can have a subsequent animation attached. For example, the fireball scroll has a lit projectile fly from the player to the target position using `Follow Path`, then triggers `Flash Light` for each position in the splash radius, and finally uses `Flash Character` for each entity with a health component that was hit by the blast. The other animations aren't nearly as complex, as this was just to demonstrate what the system is capable of.

For all this to work properly, no turns can be taken while animations are active. Everything is done in 1-2 seconds, so there's no major wait times. The systems for updating animation states use the `UpdateSystem` interface, though they're kept separate from the main set of systems used for processing a turn.