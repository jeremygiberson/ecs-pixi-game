import * as Components from "game/components"

let types = {}
for(let key of Object.keys(Components)){
  let component = Components[key];
  let instance = new component()
  types[key] = instance.constructor.name;
}

export default types;