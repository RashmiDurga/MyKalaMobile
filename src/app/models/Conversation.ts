export enum MsgDirection {
    In = 1,
    Out = 2
}
export class Conversation {
    constructor(public position: MsgDirection, public data: any, public from?: any) { }
}
export class QuestionPopUp {
    constructor(public question: any, public from?: string) { }
}