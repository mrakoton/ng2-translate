import {Injectable} from "@angular/core";
import {isDefined} from "./util";

export abstract class TranslateParser {
    /**
     * Interpolates a string to replace parameters
     * "This is a {{ key }}" ==> "This is a value", with params = { key: "value" }
     * @param expr
     * @param params
     * @returns {string}
     */
    abstract interpolate(expr: string, params?: any): string;

    /**
     * Gets a value from an object by composed key
     * parser.getValue({ key1: { keyA: 'valueI' }}, 'key1.keyA') ==> 'valueI'
     * @param target
     * @param key
     * @returns {string}
     */
    abstract getValue(target: any, key: string): string;

    abstract setInterpolate(interpolate:Function): void;
}

@Injectable()
export class DefaultTranslateParser extends TranslateParser {
    templateMatcher: RegExp = /{{\s?([^{}\s]*)\s?}}/g;
    private _interpolate:Function;

    construct() {
        this._interpolate = (expr: string, params?: any) => {
            if(typeof expr !== 'string' || !params) {
                return expr;
            }

            return expr.replace(this.templateMatcher, (substring: string, b: string) => {
                let r = this.getValue(params, b);
                return isDefined(r) ? r : substring;
            });
        };
    }

    public setInterpolate(interpolate:Function) {
        this._interpolate = interpolate;
    }

    public interpolate(expr: string, params?: any): string {
        return this._interpolate(expr, params);
    }

    getValue(target: any, key: string): string {
        let keys = key.split('.');
        key = '';
        do {
            key += keys.shift();
            if(isDefined(target) && isDefined(target[key]) && (typeof target[key] === 'object' || !keys.length)) {
                target = target[key];
                key = '';
            } else if(!keys.length) {
                target = undefined;
            } else {
                key += '.';
            }
        } while(keys.length);

        return target;
    }
}
