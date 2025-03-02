import * as Contract from '../../utils/Contract';
import type { Card, CardConstructor } from '../Card';

export interface ICardWithPrintedPowerProperty extends Card {
    readonly printedPower: number;
    readonly upgradePower?: number;
    getPower(): number;
    getUpgradePower(): number;
}

/** Mixin function that adds the `printedPower` property to a base class. */
export function WithPrintedPower<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithPrintedPower extends BaseClass {
        public readonly printedPower: number;
        public readonly upgradePower?: number;

        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertNotNullLike(cardData.power);
            this.printedPower = cardData.power;
            if (cardData.upgradePower) {
                this.upgradePower = cardData.upgradePower;
            }
        }

        public getPower(): number {
            return this.printedPower;
        }

        public getUpgradePower(): number {
            return this.upgradePower;
        }
    };
}