import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor } from '../Card';

export interface ICardWithPrintedHpProperty extends Card {
    readonly printedHp: number;
    readonly upgradeHp?: number;
    getHp(): number;
    getUpgradeHp(): number;
}

/**
 * Mixin function that adds the `printedHp` and `hp` properties to a base class.
 * Note that this _does not_ add the damage property. See {@link WithDamage} for that.
 */
export function WithPrintedHp<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPrintedHp extends BaseClass implements ICardWithPrintedHpProperty {
        public readonly printedHp: number;
        public readonly upgradeHp?: number;

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.hp);
            this.printedHp = cardData.hp;

            if (cardData.upgradeHp) {
                this.upgradeHp = cardData.upgradeHp;
            }
        }

        public getHp(): number {
            return this.printedHp;
        }

        public getUpgradeHp(): number {
            return this.upgradeHp;
        }
    };
}