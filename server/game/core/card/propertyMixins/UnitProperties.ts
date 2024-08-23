import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import { AbilityRestriction, Arena, CardType, EffectName, Location, StatType } from '../../Constants';
import StatsModifierWrapper from '../../ongoingEffect/effectImpl/StatsModifierWrapper';
import { IOngoingCardEffect } from '../../ongoingEffect/IOngoingCardEffect';
import Contract from '../../utils/Contract';
import { InPlayCard, InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { UnitCard } from '../CardTypes';
import { WithDamage } from './Damage';
import { WithPrintedPower } from './PrintedPower';
import type { WithPrintedHp } from './PrintedHp';
import * as EnumHelpers from '../../utils/EnumHelpers';
import { UpgradeCard } from '../UpgradeCard';
import { Card } from '../Card';
import { ITriggeredAbilityProps } from '../../../Interfaces';

export const UnitPropertiesCard = WithUnitProperties(InPlayCard);

/**
 * Mixin function that adds the standard properties for a unit (leader or non-leader) to a base class.
 * Specifically it gains:
 * - hp, damage, and power (from the corresponding mixins {@link WithPrintedHp}, {@link WithDamage}, and {@link WithPrintedPower})
 * - the ability for hp and power to be modified by effects
 * - the {@link InitiateAttackAction} ability so that the card can attack
 * - the ability to have attached upgrades
 */
export function WithUnitProperties<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    // create a "base" class that has the damage, hp, and power properties from other mixins
    const StatsAndDamageClass = WithDamage(WithPrintedPower(BaseClass));

    return class AsUnit extends StatsAndDamageClass {
        // ************************************* FIELDS AND PROPERTIES *************************************
        public readonly defaultArena: Arena;

        protected _upgrades: UpgradeCard[] = [];

        public override get hp(): number {
            return this.getModifiedStatValue(StatType.Hp);
        }

        public override get power(): number {
            return this.getModifiedStatValue(StatType.Power);
        }

        public get upgrades(): UpgradeCard[] {
            return this._upgrades;
        }

        // ****************************************** CONSTRUCTOR ******************************************
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertTrue(EnumHelpers.isUnit(this.printedType));

            Contract.assertNotNullLike(cardData.arena);
            switch (cardData.arena) {
                case 'space':
                    this.defaultArena = Location.SpaceArena;
                    break;
                case 'ground':
                    this.defaultArena = Location.GroundArena;
                    break;
                default:
                    Contract.fail(`Unknown arena type in card data: ${cardData.arena}`);
            }

            this.defaultActions.push(new InitiateAttackAction(this));
        }

        public override isUnit() {
            return true;
        }

        // ***************************************** ATTACK HELPERS *****************************************
        /**
         * Check if there are any effect restrictions preventing this unit from attacking the passed target.
         * Only checks effects, **does not** check basic attack rules (e.g. target card type).
         */
        public canAttack(target: Card) {
            if (this.hasEffect(EffectName.CannotAttackBase) && target.isBase()) {
                return false;
            }

            return true;
        }

        protected addAttackAbility(properties:Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
            const triggeredProperties = Object.assign(properties, { when: { onAttackDeclared: (event) => event.attack.attacker === this } });
            this.addTriggeredAbility(triggeredProperties);
        }

        // ***************************************** STAT HELPERS *****************************************
        private getModifiedStatValue(statType: StatType, floor = true, excludeModifiers = []) {
            const wrappedModifiers = this.getStatModifiers(excludeModifiers);

            const baseStatValue = StatsModifierWrapper.fromPrintedValues(this);

            const stat = wrappedModifiers.reduce((total, wrappedModifier) => total + wrappedModifier.modifier[statType], baseStatValue.modifier[statType]);

            // TODO EFFECTS: need a check around here somewhere to defeat the unit if effects have brought hp to 0

            return floor ? Math.max(0, stat) : stat;
        }

        // TODO: add a summary method that logs these modifiers (i.e., the names, amounts, etc.)
        private getStatModifiers(exclusions): StatsModifierWrapper[] {
            if (!exclusions) {
                exclusions = [];
            }

            let rawEffects;
            if (typeof exclusions === 'function') {
                rawEffects = this.getEffects().filter((effect) => !exclusions(effect));
            } else {
                rawEffects = this.getEffects().filter((effect) => !exclusions.includes(effect.type));
            }

            const modifierEffects: IOngoingCardEffect[] = rawEffects.filter((effect) => effect.type === EffectName.ModifyStats);
            const wrappedStatsModifiers = modifierEffects.map((modifierEffect) => StatsModifierWrapper.fromEffect(modifierEffect, this));

            // add stat bonuses from attached upgrades
            this.upgrades.forEach((upgrade) => wrappedStatsModifiers.push(StatsModifierWrapper.fromPrintedValues(upgrade)));

            return wrappedStatsModifiers;
        }

        // *************************************** UPGRADE HELPERS ***************************************
        /**
         * Checks whether an attachment can be played on a given card.  Intended to be
         * used by cards inheriting this class
         */
        public canPlayOn(card) {
            return true;
        }

        /**
         * This removes an attachment from this card's attachment Array.  It doesn't open any windows for
         * game effects to respond to.
         * @param {Card} upgrade
         */
        public removeUpgrade(upgrade) {
            this._upgrades = this.upgrades.filter((card) => card.uuid !== upgrade.uuid);
        }

        /** Attach the passed upgrade to this card, ignoring event windows. This should only be used for manual mode or debugging. */
        public manualAttach(upgrade) {
            upgrade.moveTo(this.location);
            this._upgrades.push(upgrade);
            upgrade.parentCard = this;
        }

        public override leavesPlay() {
            // TODO CAPTURE: use this for capture logic
            // // Remove any cards underneath from the game
            // const cardsUnderneath = this.controller.getCardPile(this.uuid).map((a) => a);
            // if (cardsUnderneath.length > 0) {
            //     cardsUnderneath.forEach((card) => {
            //         this.controller.moveCard(card, Location.RemovedFromGame);
            //     });
            //     this.game.addMessage(
            //         '{0} {1} removed from the game due to {2} leaving play',
            //         cardsUnderneath,
            //         cardsUnderneath.length === 1 ? 'is' : 'are',
            //         this
            //     );
            // }

            super.leavesPlay();
        }
    };
}