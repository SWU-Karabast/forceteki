import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import Player from '../Player';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Constructor = new (...args: any[]) => {};

export function Hp<TBaseClass extends Constructor>(BaseClass: TBaseClass) {
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

        protected readCardData(cardData: any) {
            this._printedHp = cardData.hp;
        }
    };
}