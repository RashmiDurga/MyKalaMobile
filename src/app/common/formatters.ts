export function formatPhoneNumber(value) {
    const f_val = value.replace(/\D[^\.]/g, '');
    return `${f_val.slice(0, 3)}-${f_val.slice(3, 6)}-${f_val.slice(6)}`;
}
export function removeDuplicates(string: string, char: string) {
    const result = [];
    let previous = null;
    if (!char) {
        for (let i = 0; i < string.length; i++) {
            const current = string.charAt(i);
            if (current !== previous) { result.push(current); }
            previous = current;
        }
    } else {
        for (let i = 0; i < string.length - 1; i++) {
            if (char === string.charAt(i) && char === string.charAt(i + 1)) {
            } else {
                result.push(string.charAt(i));
            }
        }
    }
    return result.join('').startsWith(',') ? result.join('').substr(1) : result.join('');
}
export function toAddressString(strings: string[]) {
    let result = '';
    strings.forEach(element => {
        if (element && element.trim() !== '') {
            result += element + ', ';
        }
    });
    return result;
}
