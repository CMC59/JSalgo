
import { Domain } from "./domaines";

class Variable<T> {
    private value: T | null;
    private domain: Domain<T>;

    constructor(domain: Domain<T>) {
        this.value = null;
        this.domain = domain;
    }

    setValue(value: T): void {
        if (this.domain.hasValue(value)) {
            this.value = value;
        }
    }

    unsetValue(): void {
        this.value = null;
    }

    toJSON(): { value: T | null } {
        return { value: this.value };
    }

    static fromJSON<T>(jsonData: { value: T | null }, domain: Domain<T>): Variable<T> {
        const variable = new Variable(domain);
        if (jsonData.value !== null && domain.hasValue(jsonData.value)) {
            variable.setValue(jsonData.value);
        }
        return variable;
    }
}

export { Variable };
