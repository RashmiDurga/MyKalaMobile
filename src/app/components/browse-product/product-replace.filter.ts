import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'replaceUnderscore'})
export class ReplaceUnderscorePipe implements PipeTransform {
  transform(value: string): string {
    return value? value.replace(/ /g, "_") : value;
  }
}

@Pipe({name: 'replaceHTTPWithHTTPS'})
export class ReplaceHTTPPipe implements PipeTransform {
  transform(value: string): string {
    return (value && value.includes("http:")) ? value.replace(/http:/g, "https:") : value;
  }
}

@Pipe({name: 'replaceSpace20'})
export class Replaceperc20Pipe implements PipeTransform {
  transform(value: string): string {
    return value? value.replace(/%20/g, " ") : value;
  }
}