import Contract from '../utils/Contract';
import { CardConstructor } from './NewCard';

export function Hp<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithHp extends BaseClass {
        private readonly _printedHp: number;
        private _damage?: number;

        /** Used to flag whether the card is in a zone where damage can be applied */
        private _damageEnabled = false;

        // see NewCard constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            this._printedHp = cardData.hp;
        }

        protected enableDamage(enabledStatus: boolean) {
            this._damageEnabled = enabledStatus;
        }

        public get damage(): number {
            Contract.assertTrue(this._damageEnabled);
            return this._damage;
        }

        protected set damage(value: number) {
            Contract.assertTrue(this._damageEnabled);
            this._damage = value;
        }

        public get hp(): number {
            return this._printedHp;
        }

        protected get printedHp(): number {
            return this._printedHp;
        }
    };
}