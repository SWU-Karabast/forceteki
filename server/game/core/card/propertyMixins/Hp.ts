import Contract from '../../utils/Contract';
import { CardConstructor } from '../NewCard';

export function Hp<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithHp extends BaseClass {
        public readonly printedHp: number;
        private _damage?: number;

        // TODO THIS PR: all of the stat modifier code

        /** Used to flag whether the card is in a zone where damage can be applied */
        private damageEnabled = false;

        public get damage(): number {
            Contract.assertTrue(this.damageEnabled);
            return this._damage;
        }

        protected set damage(value: number) {
            Contract.assertTrue(this.damageEnabled);
            this._damage = value;
        }

        public get hp(): number {
            return this.printedHp;
        }

        // see NewCard constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.hp);
            this.printedHp = cardData.hp;
        }

        protected enableDamage(enabledStatus: boolean) {
            this.damageEnabled = enabledStatus;
            this._damage = enabledStatus ? 0 : null;
        }
    };
}