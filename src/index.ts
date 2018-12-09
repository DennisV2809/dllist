export class Node<T> {
  public root: boolean = false;

  constructor(public value: T, private _prev?: Node<T>, private _next?: Node<T>) {} // tslint:disable-line variable-name

  public insertAfter(n): Node<T> {
    n.setPrevious(this);
    n.setNext(this.next());
    this.next().setPrevious(n);
    this.setNext(n);
    return this.next();
  }

  public next(): Node<T>{
    return this._next;
  }

  public previous(): Node<T> {
    return this._prev;
  }

  public setNext(n: Node<T>): Node<T> {
    this._next = n;
    return n;
  }

  public hasNext(): boolean {
    return this._next !== undefined;
  }

  public setPrevious(n: Node<T>): Node<T> {
    this._prev = n;
    return n;
  }

  public hasPrevious(): boolean {
    return this._prev !== undefined;
  }

  public move(amount): Node<T> {
    if(amount > 0) {
      let res: Node<T> = this;
      while(amount-- > 0)
        res = res.next()
      return res;
    }
    let res: Node<T> = this;
    while(amount++ < 0)
      res = res.previous()
    return res;
  }

  public remove(): Node<T> {
    this.previous().setNext(this.next());
    this.next().setPrevious(this.previous());
    return this.next();
  }
}

export default class DLL<T> {
  public static from<T>(iterable: Iterable<T> | T[]): DLL<T> {
    const lst = new DLL<T>();
    for(const val of iterable) lst.push(val);
    return lst;
  }

  public length: number = 0;
  public root: Node<T>;

  public push(e: T, index?: number): T {
    if(this.length === 0) {
      const n = new Node(e);
      n.root = true;
      n.setPrevious(n);
      n.setNext(n);
      this.root = n;
    } else if(index == null) {
      this.root.previous().insertAfter(new Node(e));
    } else {
      const tmp = this.getNode(index);
      tmp.previous().insertAfter(new Node(e));
    }
    this.length++;
    return e;
  }

  public pop(): T {
    const res = this.root.previous();
    res.previous().setNext(this.root);
    this.root.setPrevious(res.previous());
    this.length--;
    return res.value;
  }

  public shift(): T {
    const res = this.root.value;
    this.root.previous().setNext(this.root.next());
    this.root.next().setPrevious(this.root.previous());
    this.root = this.root.next();
    this.root.root = true;
    this.length--;
    return res;
  }

  public get(index: number): T {
    return this.getNode(index).value;
  }

  public getNode(index: number): Node<T> {
    index = index < 0 ? this.length - index : index;
    return this.root.move(index);
  }

  public includes(val): boolean {
    for(const v of this)
      if(v === val)
        return true;
    return false;
  }

  public indexOf(val): number {
    for(const [i, v] of this.entries())
      if(v === val) return i;
    return -1;
  }

  public remove(index: number): T {
    const tmp = this.getNode(index);
    tmp.previous().setNext(tmp.next());
    tmp.next().setPrevious(tmp.previous());
    if(tmp.root){
      tmp.next().root = true;
      this.root = tmp.next();
    }
    this.length--;
    return tmp.value;
  }

  public set(index: number, val: T): T {
    const node = this.getNode(index);
    node.value = val;
    return val;
  }

  public map<R>(fn: (val: T, key: number, lst: this) => R, thisArg?: any): R[] {
    if (thisArg) fn = fn.bind(thisArg);
    const arr = new Array(this.length);
    for(const [i, v] of this.entries())
      arr.push(fn(v, i, this));
    return arr;
  }

  public forEach(fn: (val: T, key: number, lst: this) => void, thisArg?: any): void {
    if (thisArg) fn = fn.bind(thisArg);
    for(const [i, v] of this.entries())
      fn(v, i, this);
  }

  public find(fn: (val: T, key: number, lst: this) => boolean, thisArg?: any): T {
    if (thisArg) fn = fn.bind(thisArg);
    for(const [i, v] of this.entries())
      if(fn(v, i, this)) return v;
  }

  public filter(fn: (val: T, key: number, lst: this) => boolean, thisArg?: any): DLL<T> {
    if (thisArg) fn = fn.bind(thisArg);
    const res = new DLL<T>();
    for(const [i, v] of this.entries())
      if(fn(v, i, this)) res.push(v);
    return res;
  }

  public reduce<R>(fn: (acc: R, val: T) => R, acc: R = this.root.value as any): R {
    if(this.length === 0) return acc;
    for(const v of this)
      acc = fn(acc, v);
    return acc;
  }

  public some(fn: (val: T, key: number, lst: this) => boolean, thisArg?: any): boolean {
    if (thisArg) fn = fn.bind(thisArg);
    for(const [i, v] of this.entries())
      if(fn(v, i, this)) return true;
    return false;
  }

  public every(fn: (val: T, key: number, lst: this) => boolean, thisArg?: any): boolean {
    if (thisArg) fn = fn.bind(thisArg);
    for(const [i, v] of this.entries())
      if(!fn(v, i, this)) return false;
    return true;
  }

  public join(str: string): string {
    let res = '';
    for(const v of this) res += `${str}${v}`;
    return res.slice(str.length);
  }

  public slice(amount: number): DLL<T> {
    const res = new DLL<T>();
    if(amount > 0)
      for(const v of this)
        if(--amount < 0) res.push(v);
    else
      for(const v of this)
        if(++amount > 0) res.push(v);
    return res;
  }

  public toString(): string {
    return `DLL { ${this.join(', ')} }`;
  }

  public toJSON(): T[] {
    return this.array();
  }

  public array(): T[] {
    return [...this[Symbol.iterator]()];
  }

  public keys() {
    let i = 0;
    return Array.from({ length: this.length }, () => i++);
  }

  public entries(): IterableIterator<[number, T]> {
    let curr = this.root;
    return (function*() {
      if(!curr) return;
      let i = 0;
      yield [i++, curr.value];
      while(!curr.next().root){
        curr = curr.next();
        yield [i++, curr.value];
      }
    })() as unknown as IterableIterator<[number, T]> // I know what I'm doing TypeScript -.-
  }

  public nodes(): IterableIterator<Node<T>> {
    let curr = this.root;
    return (function*() {
      if(!curr) return;
      yield curr;
      while(!curr.next().root){
        curr = curr.next();
        yield curr;
      }
    })()
  }

  public [Symbol.iterator](): IterableIterator<T> {
    let curr = this.root;
    return (function*() {
      if(!curr) return;
      yield curr.value;
      while(!curr.next().root){
        curr = curr.next();
        yield curr.value;
      }
    })()
  }

  public values() {
    return this[Symbol.iterator]();
  }
}
