import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SearchResultComponent } from '../components/search-result/search-result.component';
import { CoreService } from './core.service';
import { CanDeactivate } from '@angular/router/src/interfaces';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

@Injectable()
export class EnsureAuthenticated implements CanActivate, CanDeactivate<SearchResultComponent> {
  modalReference: any;
  constructor(private auth: AuthService, private router: Router, private core: CoreService, private modalService: NgbModal) { }
  canActivate(): boolean {
    if (localStorage.getItem('token')) {
      return true;
    }
    else {
      this.router.navigateByUrl('/home');
      return false;
    }
  }

  canDeactivate(component: SearchResultComponent): boolean {
    if (this.core.deactivateRouteFlagVal) {
      return Observable.create((observer: Observer<boolean>) => {
        this.modalReference = this.modalService.open(component.terminateSinupProcessModal);
        this.modalReference.result.then(
          (result) => {
            observer.next(true);
            observer.complete();
          },
          (reason) => {
            this.core.getDismissReason(reason);
            observer.next(false);
            observer.complete();
          });
      });
    }
    else return true;
  }
}