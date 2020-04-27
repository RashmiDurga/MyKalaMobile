import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnsureAuthenticated } from './services/ensure-authenticated.service';
import { HomeComponent } from './components/home/home.component';
import { BrowseProductComponent } from './components/browse-product/browse-product.component';
import { ViewProductComponent } from './components/view-product/view-product.component';
import { MycartComponent } from './components/mycart/mycart.component';
import { SearchResultComponent } from './components/search-result/search-result.component';
import { GetOfferComponent } from './components/get-offer/get-offer.component';
import { MyNewsAlertsComponent } from './components/my-news-alerts/my-news-alerts.component';
import { MyaccountComponent } from './components/myaccount/myaccount.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { StatusComponent } from './components/status/status.component';
import { MyordersComponent } from './components/myorders/myorders.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { TrackOrderComponent } from './components/track-order/track-order.component';
import { MyoffersComponent } from './components/myoffers/myoffers.component';
import { ElasticSearchResult } from './components/elastic-search-result/elastic-search-result.component';
import { LeaveReviewComponent } from './components/leave-review/leave-review.component';
import { ViewOfferComponent } from './components/view-offer/view-offer.component';
import { MailEntryRoutingModule } from './components/mail-entry/mail-entry-routing.module';
import { BrowseSubcategoriesComponent } from './components/browse-subcategories/browse-subcategories.component';
import { BrowseSubcategoriesgroupComponent } from './components/browse-subcategoriesgroup/browse-subcategoriesgroup.component';
import { PromotionalBannerResult } from './components/promotional-banner-result/promotional-banner-result.component';
import { GuestCartComponent } from './components/guest-cart/guest-cart.component';

const appRoutes: Routes = [
    {
        path: 'browse-product',
        component: BrowseProductComponent,
        data: { header: 'header2' }
    },
    {
        path: 'view-product',
        component: ViewProductComponent,
        data: { header: 'header1' }
    },
    {
        path: 'view-offer',
        component: ViewOfferComponent,
        data: { header: 'header1' }
    },
    {
        path: 'mycart',
        component: MycartComponent,
        data: { header: 'header1' }
    },
    {
        path: 'guest-cart',
        component: GuestCartComponent,
        data: { header: 'header1' }
    },
    {
        path: 'home',
        component: HomeComponent,
        data: { header: 'header2' }
    },
    {
        path: 'browse-product',
        component: BrowseProductComponent,
        data: { header: 'header2' }
    },
    {
        path: 'browse-subcat',
        component: BrowseSubcategoriesComponent,
        data: { header: 'header2' }
    },
    {
        path: 'browse-subcatgroup',
        component: BrowseSubcategoriesgroupComponent,
        data: { header: 'header2' }
    },
    {
        path: 'search-result',
        component: SearchResultComponent,
        data: { header: 'header2' },
        canDeactivate: [EnsureAuthenticated]
    },
    {
        path: 'my-news-alerts',
        component: MyNewsAlertsComponent,
        data: { header: 'header2' }
    },
    {
        path: 'promo-banner-product',
        component: PromotionalBannerResult,
        data: { header: 'header2' }
    },
    {
        path: 'myaccount',
        component: MyaccountComponent,
        data: { header: 'header2' }
    },
    {
        path: 'myorders',
        component: MyordersComponent,
        data: { header: 'header2' }
    },
    {
        path: 'elastic-product',
        component: ElasticSearchResult,
        data: { header: 'header2' }
    },
    {
        path: 'get-offer',
        component: GetOfferComponent,
        data: { header: 'header2' }
    },
    {
        path: 'app-login',
        component: LoginComponent,
        data: { header: 'header2' }
    },
    {
        path: 'app-logout',
        component: LogoutComponent,
        data: { header: 'header2' }
    },
    {
        path: 'status',
        component: StatusComponent,
        data: { header: 'header2' }
    },
    {
        path: 'app-checkout',
        component: CheckoutComponent,
        data: { header: 'header2' }

    },
    {
        path: 'app-track-order',
        component: TrackOrderComponent,
        data: { header: 'header2' }

    },
    {
        path: 'app-myoffers',
        component: MyoffersComponent,
        data: { header: 'header2' }

    },
    {
        path: 'app-leave-review',
        component: LeaveReviewComponent,
        data: { header: 'header2' }
    },
    {
        path: '**',
        redirectTo: '/home'
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home'
    },
];

@NgModule({
    imports: [MailEntryRoutingModule, RouterModule.forRoot(appRoutes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
