# CanvasTiles
CanvasTiles is an instance of the 2048 tile-sliding game written in JavaScript. The goal is to slide tiles around the board and to get them to merge to earn points.

[Live link][live]
[live]: https://bunnrf.github.io/CanvasTiles

## Classic

![4x4]

## More ways to play

The game is built to be resizable. There is also an option to play with prime numbers and the flexible OOP nature of the design would make it easy to add new ways to play if desired.

![12x12]

## Challenges

### Animating

Part of the challenge for this project was to stick to vanilla JS. This made it difficult to animate the tiles as they slide. How do you know when a tile is done sliding so that it can merge? The solution I found is to create temporary tiles that only exist for the purposes of animation and expire at the next turn.

### Performance

I've never tested the performance of canvas elements, but it's clear that more drawing per frame means more cost. One way I limited drawing is to use one canvas to draw a peristent board and lay another canvas on top to render the tiles. Another cool trick is that the game only requests repaints from the browser as needed, so there are no new frames drawn while the game is static.

[4x4]: ./docs/screenshots/4x4.png
[12x12]: ./docs/screenshots/12x12.png
