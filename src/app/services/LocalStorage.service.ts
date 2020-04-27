import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
    setItem(key, jsonData, expiration) {
        // if (!Modernizr.localstorage){return false;}
        const expirationMS = expiration * 1000;
        const record = { value: JSON.stringify(jsonData), timestamp: new Date().getTime() + expirationMS };
        localStorage.setItem(key, JSON.stringify(record));
        return jsonData;
    }
    getItem(key) {
        // if (!Modernizr.localstorage){return false;}
        const record = JSON.parse(localStorage.getItem(key));
        if (!record) { return ''; }
        else if (new Date().getTime() < record.timestamp && JSON.parse(record.value)) {
            return record.value;
        }
    }
    removeItem(key) {
        localStorage.removeItem(key);
    }
}
