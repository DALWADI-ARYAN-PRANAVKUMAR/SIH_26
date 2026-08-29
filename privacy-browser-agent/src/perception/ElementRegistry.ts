/**
 * ElementRegistry.ts
 * Assigns internal identifiers to interactive elements so that future
 * action engines can reference them reliably.
 */

export class ElementRegistry {
  private map = new Map<string, Element>();
  private counters: Record<string, number> = {
    button: 0,
    link: 0,
    input: 0,
    select: 0,
    checkbox: 0,
    form: 0,
    generic: 0
  };

  public register(el: Element, prefix: string = "generic"): string {
    // Return existing if already registered
    for (const [key, val] of this.map.entries()) {
      if (val === el) return key;
    }

    if (this.counters[prefix] === undefined) {
      this.counters[prefix] = 0;
    }
    
    this.counters[prefix]++;
    const id = `${prefix}_${this.counters[prefix].toString().padStart(3, '0')}`;
    this.map.set(id, el);
    return id;
  }

  public getElement(id: string): Element | undefined {
    return this.map.get(id);
  }

  public clear(): void {
    this.map.clear();
    for (const key in this.counters) {
      this.counters[key] = 0;
    }
  }
}

export const globalRegistry = new ElementRegistry();
