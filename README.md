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
ES6 with polyfill for async await, Webpack, dev server with hot-module-reloading. Spicy 🔥

## Install
```
git clone https://github.com/sweetcoco/webpack-babel-boilerplate.git your-app # change your-app to the name of your project
cd your-app
git remote remove origin
# edit the package.json, then continue on
npm install
npm run dev
```

## Build for prod
```
npm run build
```
