import { Validators, FormGroup, FormControl, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Injectable } from '@angular/core';

@Injectable()
export class ValidatorExt {
    getValidators(_f) {
        return Object.keys(_f).reduce((a, b) => {
            const v = _f[b][1];
            if (v && (v === Validators.required || v.indexOf(Validators.required) > -1)) {
                if (!a[b]) { a[b] = {}; }
                a[b]['required'] = true;
            }
            return a;
        }, {});
    }
    validateAllFormFields(formGroup: FormGroup) {
        if (formGroup) {
            Object.keys(formGroup.controls).forEach(field => {
                const control = formGroup.get(field);
                if (control instanceof FormControl) {
                    control.markAsTouched({ onlySelf: true });
                } else if (control instanceof FormGroup) {
                    this.validateAllFormFields(control);
                }
            });
        }
    }
    isFieldValid(field: AbstractControl) {
        if (field && field.valid && field.parent.touched) {
            return field.valid && field.touched;
        }
        return true;
    }
    displayFieldCss(field: AbstractControl) {
        return {
            'has-error': this.isFieldValid(field),
            'has-feedback': this.isFieldValid(field),
            'required': this.hasRequiredField(field)
        };
    }
    hasRequiredField = (abstractControl: AbstractControl): boolean => {
        if (abstractControl && abstractControl.parent && abstractControl.parent.controls) {
            if (abstractControl.validator) {
                const validator = abstractControl.validator({} as AbstractControl);
                if (validator && validator.required) {
                    return true;
                }
            }
            if (abstractControl['controls']) {
                for (const controlName in abstractControl['controls']) {
                    if (abstractControl['controls'][controlName]) {
                        if (this.hasRequiredField(abstractControl['controls'][controlName])) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    getControlName = (abstractControl: AbstractControl): string | null => {
        if (abstractControl && abstractControl.parent && abstractControl.parent.controls) {
            const formGroup = abstractControl.parent.controls;
            return Object.keys(formGroup).find(name => abstractControl === formGroup[name]) || null;
        }
    }
    remainingCharacters = (abstractControl: AbstractControl, requiredCharacters: number): number | null => {
        if (abstractControl && abstractControl.parent && abstractControl.parent.controls) {
            const valuelength = abstractControl && abstractControl.value ? abstractControl.value.length : 0;
            return requiredCharacters > valuelength ? requiredCharacters - valuelength : 0 || null;
        }
    }
    getRV(isRequired) {
        if (isRequired) {
            return Validators.required;
        }
        return Validators.nullValidator;
    }
}
export function ValidateAllZeros(control: AbstractControl) {
    if (!(/^0*$/.test(control.value))) {
        return { ValidNumber: true };
    }
    return null;
}

