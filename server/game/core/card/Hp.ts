import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type Constructor = new (...args: any[]) => {};

export function Hp<TBaseClass extends Constructor>(BaseClass: TBaseClass) {
    return class WithHp extends BaseClass {
        private readonly printedHp: number = 30;
        private readonly _damage: number = 0;

        public get damage(): number {
            return this._damage;
        }
    };
}