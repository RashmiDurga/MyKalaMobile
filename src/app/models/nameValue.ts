export class nameValue {
    constructor(public name: string, public value: string, public parent?: string) { }
}
export class IdNameParent {
    public id: string;
    public itemName: string;
    public parentId: string;
    public parent: string;
    constructor(
        id: string,
        itemName: string,
        parentId: string,
        parent: string
    ) {
        this.id = id;
        this.itemName = itemName;
        this.parentId = parentId;
        this.parent = parent;
    }
}
