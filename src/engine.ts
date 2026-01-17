import { Display } from 'rot-js';

export class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;

  display: Display;

  constructor() {
    this.display = new Display({width: Engine.WIDTH, height: Engine.HEIGHT});
  }

  render() {
    const x = Engine.WIDTH / 2;
    const y = Engine.HEIGHT / 2;
    this.display.draw(x, y, 'Welcome Adventurer', '#fff', '#000');
  }
}