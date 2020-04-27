export class SuggestionList {
    constructor(
        public levelId: string,
        public parentId: string,
        public parentName: string,
        public productLevelName: string,
        public productLevelSuggestion: string,
        public type: string
    ) { }
}