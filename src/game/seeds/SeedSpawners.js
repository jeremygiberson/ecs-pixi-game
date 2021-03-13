import ComponentTypes from "../ComponentTypes";
import util from "../util";
import * as DataStructures from "game/datastructures";
/**
 *
 * @param world
 * @param count
 * @param bbox {DataStructures.BoundingBox}
 */
export default function(world, count= 5, bbox, limit = 10) {
  // get some spawners
  for(let i = 0; i < count; i++) {
    let attributes = {
      limit: util.randomIntBetween(1, limit),
      rate: util.randomIntBetween(1,20) * 5,
      char: String.fromCharCode(97 + util.randomIntBetween(0, 26))
    };

    let entity = world.createEntity({
      components: [
        {
          type: ComponentTypes.Position,
          x: util.randomIntBetween(bbox.left, bbox.right),
          y: util.randomIntBetween(bbox.top, bbox.bottom)
        },
        {
          type: ComponentTypes.Spawner,
          ...attributes
        },
        {type: ComponentTypes.GraphicAsciiSprite, char: 's'}
      ]
    });
    console.log('spawner', entity.id, attributes);
  }
}