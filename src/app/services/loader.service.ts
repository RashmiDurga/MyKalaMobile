import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

export class LoaderData {
    public isLoading: boolean = false;
}

@Injectable()
export class LoaderService {
    public isLoading: boolean;

    constructor(private http: Http, public loaderData: LoaderData) {
    }

    start() {
        this.loaderData.isLoading = true;
    }

    stop() {
        this.loaderData.isLoading = false;
    }
}