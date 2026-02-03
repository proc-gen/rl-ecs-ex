import { Color } from 'rot-js'

export const Colors = {
  White: '#ffffff',
  Black: '#000000',
  Ambient: '#555555',
  LightGrey: '#999999',
  DarkGrey: '#444444',
  VeryDarkGrey: '#222222',
  DarkRed: '#660000',

  Stairs: '#009fff',

  HealthBar: '#aa0000',
  InspectLocation: '#00ee00',
  WarningLocation: '#eeee00',
  ErrorLocation: '#ee0000',

  Player: '#ffee00',
  Orc: '#3f7f3f',
  Troll: '#007f00',

  LightningScroll: '#aaaa00',
  ConfusionScroll: '#cf3fff',
  FireballScroll: '#ff0000',
}

export const HexColors = {
  White: Color.fromString(Colors.White),
  Black: Color.fromString(Colors.Black),
  Ambient: Color.fromString(Colors.Ambient),
  LightGrey: Color.fromString(Colors.LightGrey),
  DarkGrey: Color.fromString(Colors.DarkGrey),
  VeryDarkGrey: Color.fromString(Colors.VeryDarkGrey),
  DarkRed: Color.fromString(Colors.DarkRed),

  Stairs: Color.fromString(Colors.Stairs),

  HealthBar: Color.fromString(Colors.HealthBar),
  InspectLocation: Color.fromString(Colors.InspectLocation),
  WarningLocation: Color.fromString(Colors.WarningLocation),
  ErrorLocation: Color.fromString(Colors.ErrorLocation),

  Player: Color.fromString(Colors.Player),
  Orc: Color.fromString(Colors.Orc),
  Troll: Color.fromString(Colors.Troll),

  LightningScroll: Color.fromString(Colors.LightningScroll),
  ConfusionScroll: Color.fromString(Colors.ConfusionScroll),
  FireballScroll: Color.fromString(Colors.FireballScroll),
}
