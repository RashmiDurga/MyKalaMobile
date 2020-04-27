export const regexPatterns = {
    numberRegex: new RegExp('^(?!0{5})[0-9_.-]*$'),
    numberValueRegex: new RegExp('^(?!0{5})[0-9.-]*$'),
    zipcodeRegex: new RegExp('^(?![0]{5})[0-9]*$'),
    phoneNumberRegex: new RegExp('^(?![0.-]{10})[0-9.-]*$'),
    textRegex: new RegExp("^[a-zA-Z 0-9\n_.!@#$%^&*'\"\\(\\)\\[\\]\\{\\}\\:\\;\\<\\>\\?\\,=+\\|-]*$"),
    // textRegex: new RegExp("^[a-zA-Z 0-9_.!@#$%^&*'\\(\\)\\[\\]\\{\\}\\:\\;\\<\\>\\?\\,=+\\|-]*$"),
    nameRegex: new RegExp("^[a-zA-Z 0-9_.'-\]*$"),
    emailRegex: new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+[\.]+[a-zA-Z0-9]{2,4}$'),
    password: new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
};
