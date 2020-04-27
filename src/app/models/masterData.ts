export class MasterData {
    public Id: string;
    public name: string;
    public values: Array<string>;
    constructor(obj?: any) {
        this.values = new Array<string>();
        if (obj) {
            this.Id = obj.Id;
            this.name = obj.name;
            if (obj.values && obj.values.length > 0) {
                this.values = obj.values;
            }
        }
    }
}
export class KeyValue<T, S> {
    public key: T;
    public value: S;
    constructor(key: T, value: S) {
        this.key = key;
        this.value = value;
    }
}
