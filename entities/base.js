

export default class Base {
    constructor() {
    }

    toJSON() {
        let props = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
        let json = {};
        
        for(let prop of props) {
            if (prop !== 'constructor') {
                json[prop] = this[prop];
            }
        }
        return json;
    }
}