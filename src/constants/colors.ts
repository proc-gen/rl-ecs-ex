import { Color } from 'rot-js'

export const Colors = {
  White: '#ffffff',
  Black: '#000000',
  Ambient: '#555555',
  DarkGrey: '#444444',
  VeryDarkGrey: '#222222',

  HealthBar: '#aa0000',
  InspectLocation: '#00ee00',

  Player: '#ffee00',
  Orc: '#7f3f3f',
  Troll: '#7f0000',
}

export const HexColors = {
  White: Color.fromString(Colors.White),
  Black: Color.fromString(Colors.Black),
  Ambient: Color.fromString(Colors.Ambient),
  DarkGrey: Color.fromString(Colors.DarkGrey),
  VeryDarkGrey: Color.fromString(Colors.VeryDarkGrey),

  HealthBar: Color.fromString(Colors.HealthBar),
  InspectLocation: Color.fromString(Colors.InspectLocation),

  Player: Color.fromString(Colors.Player),
  Orc: Color.fromString(Colors.Orc),
  Troll: Color.fromString(Colors.Troll),
}
