import ApeECS from 'ape-ecs';

export class BehaviorRandomMovement extends ApeECS.Component {}
BehaviorRandomMovement.properties = {
  goalX: 0,
  goalY: 0,
  speed: 5
}

export class FrameInfo extends ApeECS.Component {}
FrameInfo.properties = {
  deltaTime: 0,
  deltaFrame: 0,
  time: 0
};

// meant to be a singleton -- applied to a single entity
export class GameInfo extends ApeECS.Component {}
GameInfo.properties = {
  flags: 0
}
GameInfo.FLAG_PLAYING = 1;


export class GraphicAsciiSprite extends ApeECS.Component {}
GraphicAsciiSprite.properties = {
  char: 'e'
}

export class GraphicBox extends ApeECS.Component {}
GraphicBox.properties = {
  width: 10,
  height: 10
}

export class IntentMove extends ApeECS.Component {}
IntentMove.properties = {
  dx: 0,
  dy: 0
}

export class Position extends ApeECS.Component {}
Position.properties = {
  x: 0,
  y: 50,
}
Position.changeEvents = true;

export class Spawned extends ApeECS.Component {}
Spawned.properties = {
  spawner_id: null
}
export class Spawner extends ApeECS.Component {}
Spawner.properties = {
  //template: ``
  rate: 1000,
  limit: 10,
  last_spawn_time: 0,
  char: 'm'
}