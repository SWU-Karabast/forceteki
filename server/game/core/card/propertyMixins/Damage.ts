import Contract from '../../utils/Contract';
import { CardConstructor } from '../NewCard';
import { PrintedHp } from './PrintedHp';

/**
 * Mixin function that adds the `damage` property and corresponding methods to a base class.
 * This is effectively a subclass of the mixin {@link PrintedHp}.
 */
export function Damage<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    const HpClass = PrintedHp(BaseClass);

    return class WithDamage extends HpClass {
        private _damage?: number;

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

        public addDamage(amount: number) {
            if (
                !Contract.assertNotNullLikeOrNan(this.damage) ||
                !Contract.assertNotNullLikeOrNan(this.hp) ||
                !Contract.assertNonNegative(amount)
            ) {
                return;
            }

            if (amount === 0) {
                return;
            }

            this.damage += amount;

            // TODO EFFECTS: the win and defeat effects should almost certainly be handled elsewhere, probably in a game state check
            if (this.damage >= this.hp) {
                if (this.isBase()) {
                    this.game.recordWinner(this.owner.opponent, 'base destroyed');
                } else {
                    this.owner.defeatCard(this);
                }
            }
        }

        /** @returns True if any damage was healed, false otherwise */
        public removeDamage(amount: number): boolean {
            if (
                !Contract.assertNotNullLikeOrNan(this.damage) ||
                !Contract.assertNotNullLikeOrNan(this.hp) ||
                !Contract.assertNonNegative(amount)
            ) {
                return false;
            }

            if (amount === 0 || this.damage === 0) {
                return false;
            }

            this.damage -= Math.min(amount, this.damage);
            return true;
        }

        protected enableDamage(enabledStatus: boolean) {
            this.damageEnabled = enabledStatus;
            this._damage = enabledStatus ? 0 : null;
        }
    };
}