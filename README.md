# Mainline Focus
Bee-line to the target `my roguelike` (from Josh Ge - how to make a roguelike)

`start -> character -> maps -> fov -> pathfinding -> monsters -> combat? -> items -> gui -> saving -> myRL`

Keep focused on getting to a proof of concept, core mechanic.
Only build what is necessary to explore the core mechanic.
Iterate until fun.
Only then, branch out building on top of it.

## Core Mechanic Vision Statement
Provide visceral combat to the player that mixes skill with hack and slash.

* Hot bar to switch between Melee & Ranged weapons (or magics).
* Click on/near enemy(s) to engage
  * Melee
    * auto dash (w/in range) to an optimal attack location / orientation & attack
    * secondary clicks progress through attack combo
      * enemy can interrupt attacks and/or counter attack. 
        * If attacking a group w/ arcing attack, if any in the group block your combo is interrupted
  * Ranged
    * (single target) auto aim to intersect target's current movement
    * (area affect) auto aim (w/in range) to optimal intersection of nearest mobs
    * but target(s) can still juke or dodge as ranged attacks aren't instant
* Combo chains allow for continuous disruption of the enemy but can be interrupted
  * an attack from a combo chain disrupts your next action, meaning their next action will hit
  * however, you can use your disrupted action to prepare to block, the following action
    * attacker : --(c1)-->(c2)-->(blocked)
    * deffender: --(hit)-->(schedule block)-->Block
* Dodge gives a moment of invulnerability (duration of dodge), only performable if you're not in a combo chain
* Block mitigate damage from attack, breaks combo chain
* Parry a timed block that interrupts the attacker. Can't be performed if you're a victim of a combo chain
* It's possible to defeat (much stronger) creatures than yourself w/ skill (evade/block timing)
      

### brainstorm
* ~~Player ingenuity leads to crafting of awesome gear~~
  * is it too similar to mage guild where you can mix any two items and get a logical result
* ~~Player explores a world teeming with procedurally generated narrative(s)~~
* ~~Player influences world level faction based conflicts~~
  * inspired by dice wars
  * player actions result in hold/attack adjacent regions, result is dice roll based on region resources
* ~~Player unfolds origin of a worldwide conflict (through lore discovery) and works to resolve it (performs some ultimate action)~~  
* Visceral combat 
  * attacks that interrupt/impact the player
  * combos (but can be interrupted)
  * snap attacks: auto aim ranged and melee attacks to connect action meaningfully
  * snap attacks can be evaded w/ dodge action
  * button mashing works, but purposeful pressing dominates
* ~~Player imbalances region factions by helping or attacking faction grunts~~
  * think league of legends/dota grunts that follow paths to opposite base. 

### Progress 
TODO Mainline Dev
 - [ ] character
   - [x] npcs
   - [ ] hero
 - [ ] maps
 - [ ] fov
 - [ ] pathfinding
 - [ ] monsters
 - [ ] combat
 - [ ] items
 - [ ] gui
 - [ ] saving

# entity template
A template is a descriptor of an entity archetype. It allows specification of components as well as the properties of components
either as raw values, or value factories. A value factory is a function (optionally parameterized) that generates values.
Templates should be composable. 

A sample template:
```yaml
components:
  - type: Health
    properties:
      current: 10
      max: 10
  - type: Name
    properties:
      given: !Fn.randomName()
      surname: !Fn.randomFamilyName()
mixin:
  - mobs/ghost.yml
  - ai/patrol.yml 
```

# Pathfinding
* whitepaper on grid & polygonal world pathfinding https://cs.au.dk/~gerth/advising/thesis/anders-strand-holm-vinther_magnus-strand-holm-vinther.pdf

# Simulation methods
* https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation
* inspiration for simulating eco-systems: https://www.youtube.com/watch?v=r_It_X7v-1E

# performing unions on sets
if we used components as sets and did set operations to get lists of entities that was the result
- simple set operations https://2ality.com/2015/01/es6-set-operations.html

# ECS optimization references
* article on archetypes and implementing them in code https://ajmmertens.medium.com/building-an-ecs-2-archetypes-and-vectorization-fe21690805f9
* where do you put containers (ie quadtrees) in an ecs? https://gamedev.stackexchange.com/questions/175023/entity-component-system-where-do-i-put-containers
* quadtree tutorial https://www.youtube.com/watch?v=OJxEcs0w_kE



# ECS Loop optimization idea
What if we could reduce the number of entity traversals to 1?
* system.update passed iterator that gives them a chance to subscribe to the next iteration
* iterator.each(filter, callback);// call callback on each entity matching filter
* iterator.collect(filter, callback); // call callback w/ set of entities matching filter
* iterator executes, looping through all entities and calling `each` callbacks on entities matching registered filters, 
  or collecting entities matching registered filters and passing the set to the `collect` callback?
  
```
// if your system can operate on one entity at a time
class FooBarSystem extends ApeECS.System {
    update(delta, iterator) {
        iterator.each({all:['ComponentA', 'ComponentB']}, entity => {
            let a = entity.getOne('ComponentA');
            let b = entity.getOne('ComponentB');
            a.foo = 'bar';
            a.update();
            b.biz = 'buz';
            b.update();
        });
    }
}

// if your system needs to work on the set of entities (for cross comparisons, etc)
class ColliderSystem extends ApeECS.System {
    update(delta, iterator) {
        iterator.collect({all:['Collider', 'Position']}, entities => {
            // do collision checks between entities
        });
    }
}
```

# Resources
* library to add sounds https://github.com/kittykatattack/sound.js
* library for 2d collisions https://github.com/kittykatattack/bump
* library for pointer and buttons https://github.com/kittykatattack/tink
* sprite utils (specifically text to sprite) https://www.npmjs.com/package/pixi-sprite-utilities

* how to make a roguelike https://www.youtube.com/watch?v=jviNpRGuCIU&t=1027s
* discussion about ECS from AGE devs https://www.youtube.com/watch?v=fGLJC5UY2o4&t=349s
* patterns to use instead of ECS https://www.youtube.com/watch?v=JxI3Eu5DPwE

#  webpack-babel-boilerplate
Thanks to https://github.com/sweetcoco/webpack-babel-boilerplate.git for providing a simple (and great) boiler plate to get dev-ing. 
ES6 with polyfill for async await, Webpack, dev server with hot-module-reloading. Spicy 🔥

## Dev
```
yarn run dev
```

## Build for prod
```
yarn run build
```
