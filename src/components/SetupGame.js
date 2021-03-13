import ApeECS from 'ape-ecs';
import * as Components from "game/components";
import * as Systems from "game/systems";
import ComponentTypes from "../game/ComponentTypes";
import SeedRandomMovers from "../game/seeds/SeedRandomMovers";
import SeedSpawners from "../game/seeds/SeedSpawners";
import * as DataStructures from "game/datastructures";
import {BoundingBox} from "game/datastructures";
import Debug from "game/Debug";

async function SetupGame(pixi_app) {
  const world = new ApeECS.World();
  for(let key of Object.keys(Components)){
    let component = Components[key];
    world.registerComponent(component)
  }

  let viewport_bbox = new BoundingBox(5, 5, window.innerHeight-10, window.innerWidth-10);
  // world.registerTags('Physics');
  // world.registerSystem('frame', Gravity);
  world.registerSystem('all', Systems.AIRandomMoveIntentSystem, [viewport_bbox]);
  world.registerSystem('all', Systems.SimpleMoveSystem);
  world.registerSystem('all', Systems.SimpleGraphicSystem, [pixi_app]);
  //world.registerSystem('all', Systems.SimpleMapRenderSystem, [pixi_app]);
  world.registerSystem('all', Systems.SimpleAsciiSpriteSystem, [pixi_app]);
  world.registerSystem('all', Systems.SpawnSystem, [pixi_app, world, viewport_bbox]);
  world.registerSystem('all', Systems.SpatialSystem, [pixi_app, world, viewport_bbox]);


  // debug system should be last for depth
  world.registerSystem('all', Systems.DebugSystem, [pixi_app, viewport_bbox]);
  window.Debug = Debug;

  // what if we did systems by:
  //  behavior - ai & updates layer responsible for attaching `Intent` components to entities
  //  intent - responsible for resolving intents as preview values by attaching `Preview` components to entities
  //  validate - responsible for validating `Preview` components and removes any that reflect an invalid change
  //  apply - responsible for applying the `Preview` component values to the `Original` components

  // entity life cycle might look like:
  // given entity Bob with components: Position, WalkBehavior
  // behavior systems execute:
  //  - walk system (triggered by existence of WalkBehavior) adds IntentMove to Bob
  // intent systems execute:
  //  - move_preview system (triggered by existence of IntentMove) adds PreviewPosition that reflects the moved position,
  //    removes IntentMove from Bob
  // validate systems execute:
  //  - collision system (triggered by existence of Position and PreviewPosition) validates that traversing from Position
  //    to PreviewPosition doesn't cross through a barrier. If a collision is detected, PreviewPosition will be removed from Bob
  //  - encumbered system (triggered by existence of Encumbered and PreviewPosition) disallows any encumbered entity from moving
  //    and removes PreviewPosition from entity, not executed
  // apply systems execute:
  //  - move system (triggered by existence of PreviewPosition) sets Position.x = PreviewPosition.x, Position.y = PreviewPosition.y
  //    and removes PreviewPosition from Bob


  // initialize entities necessary for game menu (new | [continue])
  // GameMenuSystem: provide new game option, provide continue (if localstorage has savegame)
  // ContinueSystem: load entities from local storage, remove game menu entity

  // singleton entity, keeps track of game state
  const game = world.createEntity({
    id: 'game',
    components: [
      {type: ComponentTypes.GameInfo}
    ],
    c: {
      frame: {type: ComponentTypes.FrameInfo}
    }
  })

  //SeedRandomMovers(world, 30);
  SeedSpawners(world, 100, viewport_bbox, 10);


  let running = false;
  let time = 0;
  const benchmark = false;


  return {
    run: () => {
      if(benchmark){
        let start = new Date().getTime();
        let now = start;
        let frames = 0;
        do {
          now = new Date().getTime();
          let delta = now - start;
          time += delta;

          game.c.frame.update({
            time,
            deltaTime: delta,
            deltaFrame: delta / 16.667
          });
          world.runSystems('all');
          frames++;
        } while(now - start < 6000); // 6 second duration
        let duration_seconds = (new Date().getTime() - start)/1000;
        let framesPerSecond = (frames / duration_seconds);
        console.log('benchmark', {frames, duration_seconds, framesPerSecond});
      }

      pixi_app.ticker.add(delta => {
        Debug.tick();
        time += delta;

        game.c.frame.update({
          time,
          deltaTime: delta,
          deltaFrame: delta / 16.667
        });

        Debug.benchmark('all systems', () => world.runSystems('all'))
      });
    },
  }
}

export default SetupGame;