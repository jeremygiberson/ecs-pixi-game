import ApeECS from 'ape-ecs';
import ComponentTypes from "../ComponentTypes";
import {Graphics, Sprite, Text, TextStyle, ParticleContainer, Container} from 'pixi.js';
import util from "../util";
import * as DataStructures from "game/datastructures";
import Debug from "../Debug";
import * as nodeUtil from 'util';

export class AIRandomMoveIntentSystem extends ApeECS.System {
  /**
   *
   * @param bbox {DataStructures.BoundingBox}
   */
  init(bbox) {
    this.mainQuery = this.createQuery().fromAll(ComponentTypes.BehaviorRandomMovement);
    this.bbox = bbox;
  }

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

  update(tick) {
    const game = this.world.getEntity('game');
    const entities = this.mainQuery.refresh().execute();

    // set update/set intentmove (todo, set waypoint instead, let waypoint system figure out intent move based on collision stuffs)
    for (const entity of entities) {
      const behavior = entity.getOne(ComponentTypes.BehaviorRandomMovement);
      const point = entity.getOne(ComponentTypes.Position);

      // if met goal, set new goal
      let distX = Math.abs(behavior.goalX - point.x);
      let distY = Math.abs(behavior.goalY - point.y);
      if(distX <= 0.5 && distY <= 0.5) {
        behavior.goalX = this.random(this.bbox.left, this.bbox.right);
        behavior.goalY = this.random(this.bbox.top, this.bbox.bottom);
        behavior.speed = this.random(2,20);
      } else {
        //console.log('mag',game.c.frame.deltaFrame * behavior.speed)
      }

      // move towards goal
      let unitsPerFrame = 10;
      let dx = util.maxMagnitude(behavior.goalX - point.x, game.c.frame.deltaFrame * behavior.speed)
      let dy = util.maxMagnitude(behavior.goalY - point.y, game.c.frame.deltaFrame * behavior.speed)
      // if(util.randomIntBetween(0, 10) < 2) {
      //   console.log({distX, distY, dx, dy, magnitude: game.c.frame.deltaFrame * behavior.speed})
      // }

      if (!entity.has(ComponentTypes.IntentMove)) {
        entity.addComponent({
          type: ComponentTypes.IntentMove,
          dx,
          dy
        })
      } else {
        let intent_move = entity.getOne(ComponentTypes.IntentMove);
        intent_move.dx = dx;
        intent_move.dy = dy;
        intent_move.update();
      }
    }
  }
}

export class DebugSystem extends ApeECS.System {
  /**
   * @param pixi_app {PIXI.Application}
   * @param bbox {DataStructures.BoundingBox}
   */
  init(pixi_app, bbox) {
    this.app = pixi_app;
    this.bbox = bbox;
    this.console_width = 250;
    this.padding = 5;
    this.background = new Graphics();
    this.background.beginFill(0x333333, 0.5);
    this.background.drawRect(bbox.right - this.console_width - (this.padding*2), bbox.top, this.console_width + this.padding*2, bbox.bottom - this.padding);
    this.background.endFill();
    pixi_app.stage.addChild(this.background);

    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 8,
      fill: '#ffffff',
//      stroke: '#4a1850',
//      strokeThickness: 1,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 1,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1,
      wordWrap: true,
      wordWrapWidth: this.console_width,
      lineJoin: 'round'
    });

    this.text = new Text('debug',style);
    this.text.x = bbox.right - this.console_width - this.padding;
    this.text.y = bbox.top + this.padding;
    this.text.updateText();
    pixi_app.stage.addChild(this.text);
  }

  update(tick){
    if(!Debug.enabled()) {
      this.background.visible = false;
      this.text.visible = false;
      return
    }
    this.background.visible = true;
    this.text.visible = true;

    let watchers = Debug.watchers();
    let watcher_text = Object.keys(watchers).map(key => nodeUtil.format(`${key}:`, watchers[key])).join("\n");

    let counters = Debug.counters();
    let counters_text = Object.keys(counters).map(key => nodeUtil.format(`${key}:`, counters[key])).join("\n");

    let benchmarks = Debug.benchmarks();
    let benchmarks_text = Object.keys(benchmarks).map(key => {
      let duration = benchmarks[key];
      let perSecond = (1000/duration).toFixed(2);
      return nodeUtil.format(`${key}:`, `${duration}ms`, `(${perSecond} per second)`)
    }).join("\n");

    this.text.text = `watches:\n${watcher_text}\n\ncounters:\n${counters_text}\n\nbenchmarks:\n${benchmarks_text}`;
    this.text.updateText();
  }
}

export class SimpleAsciiSpriteSystem extends ApeECS.System {
  init(pixi_app){
    this.mainQuery = this.createQuery().fromAll(ComponentTypes.GraphicAsciiSprite, ComponentTypes.Position);
    this.app = pixi_app;
    this.pixi_object_map = {};
    this.texture_atlas = {};
    this.spriteContainer = new Container();
    // sprite container is more performant, but need to create a texture-atlas because it can only use one texture
    // this.spriteContainer = new ParticleContainer(10000, {
    //   scale: false,
    //   position: true,
    //   rotation: false,
    //   uvs: true,
    //   alpha: false,
    // });
    this.app.stage.addChild(this.spriteContainer);
  }

  update(tick) {
    const entities = this.mainQuery.refresh().execute();

    for (const entity of entities) {
      Debug.markIteration();
      let ascii = entity.getOne(ComponentTypes.GraphicAsciiSprite);
      let point = entity.getOne(ComponentTypes.Position);

      if(! this.pixi_object_map[entity.id]){
        if(!this.texture_atlas[ascii.char]){
          const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: ['#ffffff', '#00ff99'], // gradient
            stroke: '#4a1850',
            strokeThickness: 0,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: true,
            wordWrapWidth: 440,
            lineJoin: 'round'
          });

          let text = new Text(ascii.char, style);
          text.updateText();
          this.texture_atlas[ascii.char] = text.texture;
        }

        let sprite = new Sprite.from(this.texture_atlas[ascii.char]);
        sprite.tint = Math.random() * 0xE8D4CD;
        sprite.anchor.set(0.5);
        this.pixi_object_map[entity.id] = sprite;
        this.spriteContainer.addChild(sprite);
      }

      let graphic = this.pixi_object_map[entity.id];
      graphic.x = point.x;
      graphic.y = point.y;
    }
  }
}

export class SimpleMoveSystem extends ApeECS.System {
  init() {
    this.mainQuery = this.createQuery().fromAll(ComponentTypes.IntentMove, ComponentTypes.Position);
  }
  update(tick) {
    const entities = this.mainQuery.refresh().execute();

    for (const entity of entities) {
      Debug.markIteration();
      const intent_move = entity.getOne(ComponentTypes.IntentMove);
      const point = entity.getOne(ComponentTypes.Position);
      point.update({x: point.x + intent_move.dx, y: point.y += intent_move.dy});
      entity.removeComponent(ComponentTypes.IntentMove)
    }
  }
}


export class SimpleGraphicSystem extends ApeECS.System {
  init(pixi_app) {
    this.mainQuery = this.createQuery().fromAll(ComponentTypes.GraphicBox, ComponentTypes.Position);
    this.app = pixi_app;
    this.pixi_object_map = {};
  }

  update(tick) {
    const entities = this.mainQuery.refresh().execute();

    for (const entity of entities) {
      Debug.markIteration();
      if(! this.pixi_object_map[entity.id]){
        let g = new Graphics();
        this.pixi_object_map[entity.id] = g;
        this.app.stage.addChild(g);
      }
      let point = entity.getOne(ComponentTypes.Position);
      let box = entity.getOne(ComponentTypes.GraphicBox);
      let graphic = this.pixi_object_map[entity.id];

      graphic.clear();
      graphic.lineStyle(2, 0x000000, 1);
      graphic.drawRect(point.x, point.y, box.width, box.height);
    }
  }
}

export class SimpleMapRenderSystem extends ApeECS.System {
  /**
   * @param pixi_app {PIXI.Application}
   */
  init(pixi_app) {
    this.app = pixi_app;
    this.graphics = new Graphics();

    this.graphics.lineStyle(2, 0x333333, 1);
    let divisions = 10;
    let width = window.innerWidth / divisions;
    let height = window.innerHeight / divisions;

    // draw a grid of the map (more expensive method)
    // for(let y = 0; y < divisions; y++) {
    //   for(let x = 0; x < divisions; x++) {
    //     let graphic = new Graphics();
    //     graphic.lineStyle(2, 0x444444, 1);
    //     graphic.drawRect(x*width, y*height, width, height);
    //     this.app.stage.addChild(graphic);
    //   }
    // }

    // optimized method
    for(let i = 0; i < divisions; i++) {
      // vertical line
      this.graphics.moveTo(i * width, 0);
      this.graphics.lineTo(i * width, window.innerHeight);

      // horizontal line
      this.graphics.moveTo(0, i * height);
      this.graphics.lineTo(window.innerWidth, i * height);
    }

    this.app.stage.addChild(this.graphics);
  }
}

export class SpatialSystem extends ApeECS.System {
  /**
   * @param pixi_app {PIXI.Application}
   * @param world {ApeECS.world}
   * @param bounding_box {DataStructures.BoundingBox}
   */
  init(pixi_app, world, bounding_box){
    this.app = pixi_app;
    this.world = world;
    let width = bounding_box.width;
    let height = bounding_box.height;
    this.mainQuery = this.createQuery().fromAll(ComponentTypes.Position);

    this.boundary = new DataStructures.CenteredRectangle(
      bounding_box.left + width/2,
      bounding_box.top + height/2,
      width/2,
      height/2
    )
    window.BoundingBox = DataStructures.BoundingBox;

    // this.qt = new DataStructures.QuadTree(boundary, 10);
    // console.log(this.qt);
    // window.qt = this.qt;
    //
    // this.subscribe(ComponentTypes.Position);

    this.graphics = new Graphics();
    pixi_app.stage.addChild(this.graphics);

    // interactive
    this.size = 100;
    this.mouse_position = {x:0,y:0};
    this.found = []
    this.search = new BoundingBox(0, 0, 100, 100);
    this.qt = null;
    pixi_app.stage.on('pointermove', (e)=>{
      //if(!this.qt){return}
      this.mouse_position = e.data.global;
      this.search = new BoundingBox(
        this.mouse_position.y - this.size/2,
        this.mouse_position.x - this.size/2,
        this.mouse_position.y + this.size/2,
        this.mouse_position.x + this.size/2
      );
    })
  }

  update(tick) {
    this.qt = new DataStructures.QuadTree(this.boundary, 10);
    window.qt = this.qt;


    // for(let change of this.changes){
    //   switch(change.op){
    //     case 'add': {
    //       let position = this.world.getComponent(change.component);
    //       let point = new DataStructures.Point(position.x, position.y, change.entity);
    //       this.qt.insert(point);
    //       console.log('inserted point', point);
    //       break;
    //     }
    //     case 'destroy': { break; }
    //     case 'change': {
    //       let position = this.world.getComponent(change.component);
    //       let point = new DataStructures.Point(position.x, position.y, change.entity);
    //       //console.log('deleted', this.qt.delete(point));
    //       this.qt.delete(point.id)
    //       this.qt.insert(point);
    //       break;
    //     }
    //     default: break;
    //   }
    // }

    let entities = this.mainQuery.refresh().execute();
    for(let entity of entities) {
      Debug.markIteration();
      let position = entity.getOne(ComponentTypes.Position);
      let point = new DataStructures.Point(position.x, position.y, entity.id);
      this.qt.insert(point);
    }

    this.graphics.clear();
    this.graphics.lineStyle(1, 0x444444, 1);
    this.show(this.qt);


    this.graphics.lineStyle(1, 0xFF4444, 1);

    if(this.search) {
      this.graphics.drawRect(this.search.left, this.search.top, this.search.width, this.search.height);
    }

    this.found = this.qt.query(this.search)
    for(let p of this.found) {
      Debug.markIteration();
      // draw circles around found
      this.graphics.drawCircle(p.x, p.y, 10);
    }
  }

  show(qt) {
    let b = qt.boundary;

    this.graphics.drawRect(b.left, b.top, b.width, b.height);

    if(qt.divided) {
      if(qt.northwest.points.length > 0) { this.show(qt.northwest) }
      if(qt.northeast.points.length > 0) { this.show(qt.northeast) }
      if(qt.southwest.points.length > 0) { this.show(qt.southwest) }
      if(qt.southeast.points.length > 0) { this.show(qt.southeast) }
    }
  }
}

export class SpawnSystem extends ApeECS.System {
  /**
   *
   * @param pixi_app {PIXI.Application}
   * @param world {ApeECS.World}
   * @param bbox {DataStructures.BoundingBox}
   */
  init(pixi_app, world, bbox) {
    this.app = pixi_app;
    this.world = world;
    this.spawnerQuery = this.createQuery().fromAll(ComponentTypes.Spawner);
    this.spawnedQuery = this.createQuery().fromAll(ComponentTypes.Spawned);
    this.bbox = bbox;
  }

  update(tick) {
    const game = this.world.getEntity('game');

    // collect counts of spawned entities
    let counts = {};
    const spawned_entities = this.spawnedQuery.refresh().execute();

    for (const entity of spawned_entities) {
      Debug.markIteration();
      let spawned = entity.getOne(ComponentTypes.Spawned);
      counts[spawned.spawner_id] = (counts[spawned.spawner_id] || 0) + 1;
    }

    // potentially spawn entities
    const spawner_entities = this.spawnerQuery.execute();
    for (const entity of spawner_entities) {
      let spawner = entity.getOne(ComponentTypes.Spawner);
      let point = entity.getOne(ComponentTypes.Position) || {x: util.randomIntBetween(this.bbox.left,this.bbox.right), y: util.randomIntBetween(this.bbox.top,this.bbox.bottom)};
      let time_since_last_spawn = game.c.frame.time - spawner.last_spawn_time;

      if(counts[entity.id] >= spawner.limit || time_since_last_spawn < spawner.rate) {
        continue;
      }

      let e = this.world.createEntity({
        components: [
          {
            type: ComponentTypes.Position, 
            x: point.x + util.randomIntBetween(-100,100),
            y: point.y + util.randomIntBetween(-100,100)
          },
          {
            type: ComponentTypes.BehaviorRandomMovement,
            goalX: util.randomIntBetween(this.bbox.left, this.bbox.right),
            goalY: util.randomIntBetween(this.bbox.top, this.bbox.bottom),
            speed: util.randomIntBetween(2, 20)
          },
          {type: ComponentTypes.GraphicAsciiSprite, char: spawner.char},
          {type: ComponentTypes.Spawned, spawner_id: entity.id}
        ]
      });
      //console.log('spawned', e);


      spawner.last_spawn_time = game.c.frame.time;
      spawner.update();
    }
  }
}
