import { CardConstructor } from './NewCard';

export function Hp<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithHp extends BaseClass {
        private _printedHp = 30;
        private _damage = 0;

        public get damage(): number {
            return this._damage;
        }

        protected set damage(value: number) {
            this._damage = value;
        }

        public get hp(): number {
            return this._printedHp;
        }

        protected get printedHp(): number {
            return this._printedHp;
        }

        protected override readCardData(cardData: any) {
            super.readCardData(cardData);
            this._printedHp = cardData.hp;
        }
    };
}