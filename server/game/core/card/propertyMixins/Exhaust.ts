import { Location } from '../../Constants';
import Contract from '../../utils/Contract';
import { CardConstructor } from '../NewCard';

export function Exhaust<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithExhaust extends BaseClass {
        private _exhausted = null;
        private exhaustEnabled = false;

        public get exhausted() {
            Contract.assertTrue(this.exhaustEnabled);
            return this._exhausted;
        }

        public exhaust() {
            Contract.assertTrue(this.exhaustEnabled);
            this._exhausted = true;
        }

        public ready() {
            Contract.assertTrue(this.exhaustEnabled);
            this._exhausted = false;
        }

        protected enableExhaust(enabledStatus: boolean) {
            this.exhaustEnabled = enabledStatus;
            this._exhausted = enabledStatus ? true : null;
        }
    };
}