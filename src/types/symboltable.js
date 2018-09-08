class SymbolTableImpl {
  constructor() {
    this.table = [];
  }

  push(scope) {
    this.table.push(scope);
  }

  lookup(symbol) {
    for (let i = this.table.length - 1; i >= 0; i -= 1) {
      const value = this.table[i].get(symbol);
      if (value !== undefined) return value;
    }
    return undefined;
  }
}

class Scope {
  constructor() {
    this.map = new Map();
  }

  set(key, value) {
    this.map.set(key, value);
  }

  get(key) {
    return this.map.get(key);
  }
}

module.exports = {
  SymbolTableImpl,
  Scope
};
