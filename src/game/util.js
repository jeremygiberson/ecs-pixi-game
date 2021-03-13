class IdGenerator {
  constructor() {
    this.gen_num = 0;
    this.prefix = '';
    this.genPrefix();
  }

  genPrefix() {
    this.prefix = Date.now().toString(32);
  }

  genId() {
    this.gen_num++;
    // istanbul ignore if
    if (this.gen_num === 4294967295) {
      this.gen_num = 0;
      this.genPrefix();
    }
    return this.prefix + this.gen_num;
  }
}

const idGen = new IdGenerator();

export default {
  maxMagnitude: (value, magnitude) => {
    if(value < 0 && value < -magnitude) {
      return -magnitude;
    } else if(value < 0) {
      return value;
    } else if(value > 0 && value > magnitude) {
      return magnitude
    } else {
      return value
    }
  },
  randomIntBetween: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  },
  genId: () => idGen.genId()
}