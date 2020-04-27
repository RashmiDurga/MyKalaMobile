export class PaymentCardModal {
    number: String; // 16-digit credit card number
    expMonth: number; // expiry month
    expYear: number; // expiry year
    cvc: String; // CVC / CCV
    name: String; // card holder name (optional)
    address_line1?: String; // address line 1 (optional)
    address_line2?: String; // address line 2 (optional)
    address_city?: String; // city (optional)
    address_state?: String; // state/province (optional)
    address_country?: String; // country (optional)
    postal_code: String; // Postal Code / Zip Code (optional)
    currency?: String // Three-letter ISO currency code (optional)
}