export type CellDomain = Domain<PossibleValue>;
type PossibleValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
import { Variable } from "./variable";

class Domain<T> {
    private values: Set<T>;

    constructor() {
        this.values = new Set<T>();
    }

    addValue(value: T): void {
        this.values.add(value);
    }

    hasValue(value: T): boolean {
        return this.values.has(value);
    }

    deleteValue(value: T): void {
        this.values.delete(value);
    }

    copy(): Domain<T> {
        const copy = new Domain<T>();
        for (const value of this.values) {
            copy.addValue(value);
        }
        return copy;
    }

    toJSON(): T[] {
        return Array.from(this.values);
    }

    static fromJSON<T>(jsonArray: T[]): Domain<T> {
        const domain = new Domain<T>();
        for (const value of jsonArray) {
            domain.addValue(value);
        }
        return domain;
    }
}

export { Domain };
