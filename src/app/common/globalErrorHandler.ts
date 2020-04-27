import { ErrorHandler, Injectable } from '@angular/core';
@Injectable()
export class GlobalErrorHandler extends ErrorHandler {
    constructor() {
        super();
    }

    public handleError(error: any): void {
        // You can add your own logic here.
        // It is not required to delegate to the original implementation
        if (error.originalError instanceof AuthorizationError) {
            console.log(`[CUSTOM ERROR]:::${error.originalError.toString()}`);
        } else {
            console.log('error' + error);
            console.log('error' + error.stack);
            // super.handleError(error);
        }
    }
}

export class AuthorizationError {
    toString() {
        return 'You are not authorized to view this content!!!';
    }
}
