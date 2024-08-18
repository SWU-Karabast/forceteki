import { CardConstructor } from './NewCard';

export function Exhaust<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithExhaust extends BaseClass {
        protected exhausted = false;
    };
}