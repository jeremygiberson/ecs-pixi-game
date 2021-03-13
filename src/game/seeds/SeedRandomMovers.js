import ComponentTypes from "../ComponentTypes";

export default function(world, count=100) {
  // get some random movers
  for(let i = 0; i < count; i++) {
    const mover = world.createEntity({
      components: [
        {type: ComponentTypes.Position},
        {type: ComponentTypes.BehaviorRandomMovement},
//        {type: ComponentTypes.GraphicBox},
        {type: ComponentTypes.GraphicAsciiSprite, char: 'm'}
      ]
    })
  }
}