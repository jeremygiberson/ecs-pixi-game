let enabled = true;
let data = {
  watchers: {},
  counters: {},
  benchmarks: {}
}
export default {
  /**
   *
   * @param on {Boolean}
   */
  enable: (on) => {
    enabled = on
  },
  enabled: ()=> enabled,
  reset:()=>{
    // reset watches
    data.watchers = {};
    data.counters = {};
    data.benchmarks = {};
  },
  tick: () => {
    // reset counters each tick
    data.counters = {};
  },
  watch: (key, value) => {
    if(!enabled){ return }
    data.watchers[key] = value;
  },
  increment: (counter, value=1) => {
    if(!enabled){ return }
    data.counters[counter] = (data.counters[counter] || 0) + value;
  },
  /**
   * Keep track of loops
   * @param bucket {string|undefined}
   */
  markIteration: function(bucket){
    if(!enabled){ return }
    this.increment('iterations');
    if(bucket) {
      this.increment(`iterations.${bucket}`);
    }
  },
  /**
   * Keep track of recursive calls
   * @param bucket {string|undefined}
   */
  markRecursion: function(bucket){
    if(!enabled){ return }
    this.increment('recursion');
    if(bucket) {
      this.increment(`recursion.${bucket}`);
    }
  },
  benchmark: (key, fn) => {
    let start = new Date().getTime();
    fn()
    if(!enabled) { return }
    let duration = new Date().getTime() - start;

    if(!data.benchmarks[key]) {
      data.benchmarks[key] = [];
    }
    data.benchmarks[key].push(duration);
    if(data.benchmarks[key].length > 10) {
      data.benchmarks[key].shift();
    }
  },
  watchers: ()=> data.watchers,
  counters: ()=> data.counters,
  benchmarks: ()=> {
    // compute average
    let averages = {};
    Object.keys(data.benchmarks).forEach(key => {
      if(data.benchmarks[key].length === 0) { averages[key] = 0; return }
      let sum = data.benchmarks[key].reduce((acc, cur)=> acc+cur, 0);
      averages[key] = (sum / data.benchmarks[key].length).toFixed(2);
    });
    return averages;
  }
}