import { Component, OnInit } from '@angular/core';
import { LoaderData, LoaderService } from '../../services/loader.service';
@Component({
    selector: 'loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.css']
})

export class LoaderComponent implements OnInit {
   
    constructor(public loaderData: LoaderData, public loaderService: LoaderService) {

    }

    ngOnInit() {
        
    }
}