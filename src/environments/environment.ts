// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { apiNames, commonMessages, regexPatterns, promotionalBanner, promotionalBannerIds } from './common';
export const environment = {
  production: false,
  login: 'http://dev-user-service.us-east-2.elasticbeanstalk.com',
  userService: 'http://qa-signup-service.us-west-1.elasticbeanstalk.com/user/v1/public',
  profileInterestPublic: 'http://dev-consumer-profile.us-east-2.elasticbeanstalk.com/consumer/v1/public',
  profileInterest: 'http://dev-consumer-profile.us-east-2.elasticbeanstalk.com/consumer/v1',
  // productList: 'http://qa-product-service.us-west-1.elasticbeanstalk.com/api/products/public',
  productList: "http://dev-product-service.us-east-2.elasticbeanstalk.com/api/products/public",
  makeOfferList:'http://dev-product-service.us-east-2.elasticbeanstalk.com/api/products',
  geoCode: 'https://maps.googleapis.com/maps/api/geocode/json',
  s3: 'https://s3.us-east-2.amazonaws.com/',
  checkout: 'http://qa-order-service.us-east-1.elasticbeanstalk.com/order/v1',
  card: 'http://qa-order-service.us-east-1.elasticbeanstalk.com/order/v1',
  shippingMethod: 'http://qa-retailer-service.us-west-1.elasticbeanstalk.com',
  sellOnKala : 'http://dev-retailer-service-mongo.us-east-1.elasticbeanstalk.com',
  catImagePath: 'https://mykala-dev-images.s3.us-east-2.amazonaws.com/product/place_banners/',
  kalaUIURL:'http://consumer-qa.mykala.s3-website.us-east-2.amazonaws.com',
  stripePK: 'pk_test_pNeF3FuRWQ99HxWEMvVbLlKN',
  apis: apiNames,
  regex: regexPatterns,
  commonMsg: commonMessages,
  promotionalBanner: promotionalBanner,
  promotionalBannerIds:promotionalBannerIds
};


// import { apiNames, commonMessages, regexPatterns, promotionalBanner, promotionalBannerIds } from './common';
// export const environment = {
//   production: true,
//   login: 'https://api.mykala.com',
//   userService: 'https://api.mykala.com/user/v1/public',
//   profileInterestPublic: 'https://api.mykala.com/consumer/v1/public',
//   profileInterest: 'https://api.mykala.com/consumer/v1',
//   // productList: 'http://qa-product-service.us-west-1.elasticbeanstalk.com/api/products/public',
//   productList: "https://api.mykala.com/api/products/public",
//   makeOfferList:'https://api.mykala.com/api/products',
//   geoCode: 'https://maps.googleapis.com/maps/api/geocode/json',
//   s3: 'https://s3.us-east-2.amazonaws.com/',
//   checkout: 'https://api.mykala.com/order/v1',
//   card: 'https://api.mykala.com/order/v1',
//   shippingMethod: 'https://api.mykala.com',
//   sellOnKala : 'https://api.mykala.com',
//   stripePK: 'pk_live_T02kMUsUVyEI6hVucQ042WsT',
//   kalaUIURL:'https://www.mykala.com',
//   catImagePath: 'https://mykala-dev-images.s3.us-east-2.amazonaws.com/product/place_banners/',
//   apis: apiNames,
//   regex: regexPatterns,
//   commonMsg: commonMessages,
//   promotionalBanner: promotionalBanner,
//   promotionalBannerIds:promotionalBannerIds
// };

