import util from "../util";
import Debug from "../Debug";

export class BoundingBox {
  /**
   *
   * @param top
   * @param left
   * @param bottom
   * @param right
   */
  constructor(top, left, bottom, right) {
    this.top = top;
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.id = util.genId()
  }

  get width() { return this.right-this.left }
  get height() { return this.bottom - this.top }

  /**
   *
   * @param point {Point}
   * @returns {boolean}
   */
  contains(point) {
    return point.x >= this.left && point.x <= this.right
      && point.y >= this.top && point.y <= this.bottom;
  }

  /**
   *
   * @param bbox {BoundingBox}
   * @returns {boolean}
   */
  intersects(bbox) {
    return !(
      bbox.left > this.right ||
      bbox.right < this.left ||
      bbox.top > this.bottom ||
      bbox.bottom < this.top
    );
  }
}

export class Point {
  constructor(x,y,id, userData) {
    this.x = x;
    this.y = y;
    this.userData = userData;
    this.id = id || util.genId()
  }
}

/**
 * In a centered rectangle w and h are the half width and half height
 */
export class CenteredRectangle extends BoundingBox {
  constructor(x,y,half_width,half_height) {
    super(y-half_height, x-half_width, y+half_height, x+half_width);
    this.x = x;
    this.y = y;
    this.half_width = half_width;
    this.half_height = half_height;
  }

}

export class QuadTree {
  /**
   *
   * @param boundary {CenteredRectangle}
   */
  constructor(boundary, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = new Set();
    this.divided = false;
    this.id = util.genId()
  }

  get length(){
    return this.points.size
  }

  /**
   *
   * @param point {Point}
   */
  insert(point) {
    if(!this.boundary.contains(point)) {
      return false;
    }

    if(this.points.size < this.capacity) {
      this.points.add(point);
      return true;
    } else {
      if(!this.divided) {
        this.subdivide();
      }
      Debug.markRecursion(`qtree.insert`)
      return this.northwest.insert(point) ||
      this.northeast.insert(point) ||
      this.southeast.insert(point) ||
      this.southwest.insert(point);
    }
  }

  first(){
    if(this.points.size > 0) {
      return this.points.values().next();
    }
    return this.northwest.first() || this.northeast.first() || this.southwest.first() || this.southeast.first();
  }

  delete(point_id){
    for(let point of this.points) {
      if(point.id === point_id){
        this.points.delete(point);
        if(!this.divided){ return true }
        // but now that I have room, I need to re-balance
        // get the first point from subtree
        let subtree = null;
        switch(true){
          case this.northwest.length > 0:
            subtree = this.northwest;
            break;
          case this.northeast.length > 0:
            subtree = this.northeast;
            break;
          case this.southwest.length > 0:
            subtree = this.southwest;
            break;
          case this.southeast.length > 0:
            subtree = this.southeast;
            break;
          default: return true
        }
        let first = subtree.points.values().next();
        this.points.add(first);
        subtree.delete(point);
        return true;
      }
    }
    if(!this.divided) { return false }
    return this.northwest.delete(point_id) || this.northeast.delete(point_id) || this.southwest.delete(point_id) || this.southeast.delete(point_id);
  }

  subdivide(){
    let b = this.boundary;
    let nw = new CenteredRectangle(b.x - b.half_width / 2, b.y - b.half_height / 2, b.half_width / 2, b.half_height/2);
    this.northwest = new QuadTree(nw, this.capacity);
    let ne = new CenteredRectangle(b.x + b.half_width / 2, b.y - b.half_height/ 2, b.half_width/2, b.half_height /2);
    this.northeast = new QuadTree(ne, this.capacity);
    let sw = new CenteredRectangle(b.x - b.half_width / 2, b.y + b.half_height/ 2, b.half_width/2, b.half_height /2);
    this.southwest = new QuadTree(sw, this.capacity);
    let se = new CenteredRectangle(b.x + b.half_width / 2, b.y + b.half_height/ 2, b.half_width/2, b.half_height/2);
    this.southeast = new QuadTree(se, this.capacity);

    this.divided = true;
  }

  /**
   *
   * @param bbox {BoundingBox}
   */
  query(bbox) {
    let found = []
    if(!this.boundary.intersects(bbox)) {
      return found;
    }
    for(let p of this.points) {
      if(bbox.contains(p)){
        found.push(p);
      }
    }
    if(!this.divided) {
      return found;
    }
    Debug.markRecursion(`qtree.query`)
    return found.concat(
      ...this.northwest.query(bbox),
      ...this.northeast.query(bbox),
      ...this.southwest.query(bbox),
      ...this.southeast.query(bbox)
    )
  }
}