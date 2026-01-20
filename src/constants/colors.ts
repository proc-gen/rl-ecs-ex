import { Color } from 'rot-js'

export const Colors = {
  White: '#ffffff',
  Black: '#000000',
  Ambient: '#555555',

  Player: '#ffee00',
  Orc: '#7f3f3f',
  Troll: '#7f0000',
}

export const HexColors = {
  White: Color.fromString(Colors.White),

  Black: Color.fromString(Colors.Black),
  Ambient: Color.fromString(Colors.Ambient),

  Player: Color.fromString(Colors.Player),
  Orc: Color.fromString(Colors.Orc),
  Troll: Color.fromString(Colors.Troll),
}
