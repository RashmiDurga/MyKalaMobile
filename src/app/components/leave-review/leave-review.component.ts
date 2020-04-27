import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { Router, RouterOutlet } from '@angular/router';
import { ReviewModel } from '../../models/review';
import { MyReviewService } from '../../services/review.service';

@Component({
    selector: 'app-leave-review',
    templateUrl: './leave-review.component.html',
    styleUrls: ['./leave-review.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class LeaveReviewComponent implements OnInit {
    userData: any;
    uploadFile: any;
    requestReviewModel = new ReviewModel();
    productForReview: any;
    reviewContent: string;
    loader: boolean = false;
    @ViewChild('leaveReviewSubmittedModal') leaveReviewSubmittedModal: ElementRef;
    @ViewChild('fileSizeTooBig') fileSizeTooBig: ElementRef;
    reviewValidationMsg: string;
    imageURL: string;
    hiddenOverlay: boolean = false;

    constructor(
        public core: CoreService,
        private route: Router,
        private routerOutlet: RouterOutlet,
        private review: MyReviewService
    ) { }

     ngOnInit() {
        this.core.checkIfLoggedOut(); /*** If User Logged Out*/
        this.core.hide();
        this.core.searchMsgToggle();
        this.core.LoungeShowHide();
        this.core.footerSwap();
        let appFooter = document.getElementsByClassName("footer")[0];
        appFooter.classList.remove("hideFooter");
        this.userData = JSON.parse(window.localStorage['userInfo']);
        this.productForReview = JSON.parse(window.localStorage['forReview']);
        this.requestReviewModel.consumerId = "";
        this.requestReviewModel.emailId = this.userData.emailId;
        this.requestReviewModel.userId = this.userData.userId;
        this.requestReviewModel.retailerId = this.productForReview.order.retailerId;
        this.requestReviewModel.retailerName = this.productForReview.order.retailerName;
        this.requestReviewModel.productId = this.productForReview.order.productId;
        this.requestReviewModel.productName = this.productForReview.order.productName;
        this.requestReviewModel.firstName = this.userData.firstName;
        this.requestReviewModel.lastName = this.userData.lastName;
        this.requestReviewModel.orderId = this.productForReview.modal.orderId;
        this.requestReviewModel.orderDate = new Date(this.productForReview.modal.purchasedDate);
        this.requestReviewModel.productImage = this.productForReview.order.productImage;
    }

    callUpload() {
        this.uploadFile = document.getElementsByClassName('uploadImage');
        this.uploadFile[0].click();
    };

    hideOverlay() {
        this.hiddenOverlay = false
    }

    fileChangeEvent(event) {
        if (event.target.files[0]) {
            let fileToUpload: File = null;
            fileToUpload = event.target.files[0];
            /** 1 MB = 1048576 and 5MB = 5242880 */
            if (fileToUpload.size > 2097152)
            {
                this.core.openModal(this.fileSizeTooBig);
                event.target.value = '';
            } 
            else {
                var reader = new FileReader();
                reader.onload = (event: any) => {
                    this.imageURL = event.target.result;
                }
                reader.readAsDataURL(fileToUpload);
                this.hiddenOverlay = true
                setTimeout(() => {
                    this.hiddenOverlay = false;
                }, 1000)
            }
        }
    };

    selectRating(e) {
        this.requestReviewModel.rating = parseFloat(e.currentTarget.dataset.number);
        let reviewIcons = document.getElementsByClassName("starIcon")
        for (var i = 0; i < reviewIcons.length; i++) {
            reviewIcons[i].classList.remove("fa-star");
            reviewIcons[i].classList.add("fa-star-o");
        }
        for (var i = 0; i < reviewIcons.length; i++) {
            reviewIcons[i].classList.remove("fa-star-o");
            reviewIcons[i].classList.add("fa-star");
            if (reviewIcons[i].getAttribute("data-number") == e.currentTarget.dataset.number) return false;
        }
    }

    postReview() {
        this.reviewValidationMsg = "";
        let regex = /\S+\s+\S+\s+\S+\s+\S+\s+\S+/
        this.requestReviewModel.reviewDescription = this.reviewContent;
        if (regex.test(this.requestReviewModel.reviewDescription) != true || this.requestReviewModel.reviewDescription == undefined) {
            this.reviewValidationMsg = "Please provide a minimum of 5 words";
            this.core.openModal(this.leaveReviewSubmittedModal);
        }
        else if (!this.requestReviewModel.rating || this.requestReviewModel.rating == undefined) {
            this.reviewValidationMsg = "Please select a rating";
            this.core.openModal(this.leaveReviewSubmittedModal)
        }
        else {
            this.loader = true;
            this.requestReviewModel.reviewImages = this.imageURL;
            this.review.postReview(this.requestReviewModel).subscribe((res) => {
                this.loader = false;
                this.reviewValidationMsg = "Thanks! Your review has been submitted";
                this.core.openModal(this.leaveReviewSubmittedModal);
                localStorage.removeItem("forReview");
                localStorage.removeItem("image");
                setTimeout(() => {
                    this.core.modalReference.close();
                    if (this.productForReview.from != undefined) this.route.navigateByUrl("/my-news-alerts");
                    else this.route.navigateByUrl("/myorders");
                }, 2000);
            }, (err) => {
                this.loader = false;
                console.log(err);
            })
        }
    }

}
