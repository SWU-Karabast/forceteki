import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import { Arena, CardType, EffectName, KeywordName, Location, StatType } from '../../Constants';
import StatsModifierWrapper from '../../ongoingEffect/effectImpl/StatsModifierWrapper';
import { IOngoingCardEffect } from '../../ongoingEffect/IOngoingCardEffect';
import Contract from '../../utils/Contract';
import { InPlayCard, InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { WithDamage } from './Damage';
import { WithPrintedPower } from './PrintedPower';
import * as EnumHelpers from '../../utils/EnumHelpers';
import { UpgradeCard } from '../UpgradeCard';
import { Card } from '../Card';
import { ITriggeredAbilityProps } from '../../../Interfaces';
import { KeywordWithNumericValue } from '../../ability/KeywordInstance';
import TriggeredAbility from '../../ability/TriggeredAbility';
import { IConstantAbility } from '../../ongoingEffect/IConstantAbility';
import { RestoreAbility } from '../../../abilities/keyword/RestoreAbility';
import { ShieldedAbility } from '../../../abilities/keyword/ShieldedAbility';
import { Attack } from '../../attack/Attack';
import type { UnitCard } from '../CardTypes';
import { SaboteurAbility } from '../../../abilities/keyword/SaboteurAbility';

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

        private _activeAttack?: Attack = null;
        private _attackKeywordAbilities: (TriggeredAbility | IConstantAbility)[] | null = null;
        private _whenPlayedKeywordAbilities: (TriggeredAbility | IConstantAbility)[] | null = null;


        public setActiveAttack(attack: Attack) {
            // this.assertPropertyEnabled(this._activeAttack, 'activeAttack');
            this._activeAttack = attack;
        }

        public get activeAttack() {
            return this._activeAttack;
        }

        public override get hp(): number {
            return this.getModifiedStatValue(StatType.Hp);
        }

        public override get power(): number {
            return this.getModifiedStatValue(StatType.Power);
        }

        public get upgrades(): UpgradeCard[] {
            return this._upgrades;
        }

        public hasUpgradeWithName(name: string): boolean {
            return this._upgrades.some((upgrade) => upgrade.title === name);
        }

        public isAttacking(): boolean {
            return (this as Card) === (this._activeAttack?.attacker as Card);
        }

        public isDefending(): boolean {
            return (this as Card) === (this._activeAttack?.target as Card);
        }


        // ****************************************** CONSTRUCTOR ******************************************
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            const [Player, cardData] = this.unpackConstructorArgs(...args);

            Contract.assertTrue(EnumHelpers.isUnit(this.printedType) || this.printedType === CardType.Leader);

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

        public override isUnit(): this is UnitCard {
            return true;
        }

        // ***************************************** ATTACK HELPERS *****************************************
        /**
         * Check if there are any effect restrictions preventing this unit from attacking the passed target.
         * Returns true if so.
         */
        public effectsPreventAttack(target: Card) {
            if (this.hasEffect(EffectName.CannotAttackBase) && target.isBase()) {
                return true;
            }

            return false;
        }

        protected addOnAttackAbility(properties:Omit<ITriggeredAbilityProps, 'when' | 'aggregateWhen'>): void {
            const triggeredProperties = Object.assign(properties, { when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source } });
            this.addTriggeredAbility(triggeredProperties);
        }

        public override getTriggeredAbilities(): TriggeredAbility[] {
            let triggeredAbilities = super.getTriggeredAbilities();

            // add any temporarily registered attack abilities from keywords
            if (this._attackKeywordAbilities !== null || this.isBlank()) { //TODO: Why is this isBlank check even here?
                triggeredAbilities = triggeredAbilities.concat(this._attackKeywordAbilities.filter((ability) => ability instanceof TriggeredAbility));
            }
            if (this._whenPlayedKeywordAbilities !== null || this.isBlank()) {
                // TODO: does it even make sense for there to be non-triggered when played keyword abilities? I think not. Maybe Smuggle?
                triggeredAbilities = triggeredAbilities.concat(this._whenPlayedKeywordAbilities as TriggeredAbility[]);
            }

            return triggeredAbilities;
        }

        public override getConstantAbilities(): IConstantAbility[] {
            let constantAbilities = super.getConstantAbilities();

            // add any temporarily registered attack abilities from keywords
            if (this._attackKeywordAbilities !== null) {
                constantAbilities = constantAbilities.concat(
                    this._attackKeywordAbilities.filter((ability) => !(ability instanceof TriggeredAbility))
                        .map((ability) => ability as IConstantAbility)
                );
            }

            return constantAbilities;
        }

        // *************************************** KEYWORD HELPERS ***************************************
        /**
         * For the "numeric" keywords (e.g. Raid), finds all instances of that keyword that are active
         * for this card and adds up the total of their effect values.
         * @returns value of the total effect if enabled, `null` if the effect is not present
         */
        public getNumericKeywordSum(keywordName: KeywordName.Restore | KeywordName.Raid): number | null {
            let keywordValueTotal = 0;

            for (const keyword of this.keywords.filter((keyword) => keyword.name === keywordName)) {
                keywordValueTotal += (keyword as KeywordWithNumericValue).value;
            }

            return keywordValueTotal > 0 ? keywordValueTotal : null;
        }

        /**
         * Registers any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         */
        public registerWhenPlayedKeywords() {
            if (!Contract.assertTrue(
                this._whenPlayedKeywordAbilities === null,
                `Failed to unregister when played abilities from previous play: ${this._whenPlayedKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            )) {
                return;
            }

            this._whenPlayedKeywordAbilities = [];

            // shielded
            if (this.hasSomeKeyword(KeywordName.Shielded)) {
                const shieldedAbility = this.createTriggeredAbility(ShieldedAbility.buildShieldedAbilityProperties());
                shieldedAbility.registerEvents();
                this._whenPlayedKeywordAbilities.push(shieldedAbility);
            }

            // TODO: uncomment once Veld does engine work
            // ambush
            // if (this.hasSomeKeyword(KeywordName.Ambush)) {
            //     const ambushAbility = this.createTriggeredAbility(AmbushAbility.buildAmbushAbilityProperties());
            //     ambushAbility.registerEvents();
            //     this._whenPlayedKeywordAbilities.push(ambushAbility);
            // }
        }

        /**
         * Unegisters any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         */
        public unregisterWhenPlayedKeywords() {
            if (!Contract.assertTrue(
                Array.isArray(this._whenPlayedKeywordAbilities),
                'Ability when played registration was skipped'
            )) {
                return;
            }

            for (const ability of this._whenPlayedKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                }
            }

            this._whenPlayedKeywordAbilities = null;
        }

        /**
         * Registers any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         *
         * Note: Check rule 7.5 to see if a keyword should be here. Only keywords that are
         *      "On Attack" keywords should go here. As of Set 2 (SHD) this is only Restore
         *      and the defeat all shields portion of Saboteur.
         */
        public registerAttackKeywords() {
            if (!Contract.assertTrue(
                this._attackKeywordAbilities === null,
                `Failed to unregister attack abilities from previous attack: ${this._attackKeywordAbilities?.map((ability) => ability.title).join(', ')}`
            )) {
                return;
            }

            this._attackKeywordAbilities = [];

            // restore
            const restoreAmount = this.getNumericKeywordSum(KeywordName.Restore);
            if (restoreAmount !== null) {
                const restoreAbility = this.createTriggeredAbility(RestoreAbility.buildRestoreAbilityProperties(restoreAmount));
                restoreAbility.registerEvents();
                this._attackKeywordAbilities.push(restoreAbility);
            }

            if (this.hasSomeKeyword(KeywordName.Saboteur)) {
                const saboteurAbility = this.createTriggeredAbility(SaboteurAbility.buildSaboteurAbilityProperties());
                saboteurAbility.registerEvents();
                this._attackKeywordAbilities.push(saboteurAbility);
            }
        }

        /**
         * Unegisters any keywords which need to be explicitly registered for the attack process.
         * These should be unregistered after the end of the attack.
         */
        public unregisterAttackKeywords() {
            if (!Contract.assertTrue(
                Array.isArray(this._attackKeywordAbilities),
                'Ability attack registration was skipped'
            )) {
                return;
            }

            for (const ability of this._attackKeywordAbilities) {
                if (ability instanceof TriggeredAbility) {
                    ability.unregisterEvents();
                } else {
                    this.removeEffectFromEngine(ability.registeredEffects[0]);
                }
            }

            this._attackKeywordAbilities = null;
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

            if (this.hasSomeKeyword(KeywordName.Grit)) {
                const gritModifier = { power: this.damage, hp: 0 };
                wrappedStatsModifiers.push(new StatsModifierWrapper(gritModifier, 'Grit', false, this.type));
            }

            const raidAmount = this.getNumericKeywordSum(KeywordName.Raid);
            if (this.isAttacking() && raidAmount > 0) {
                const raidModifier = { power: raidAmount, hp: 0 };
                wrappedStatsModifiers.push(new StatsModifierWrapper(raidModifier, 'Raid', false, this.type));
            }

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
         * Removes an upgrade from this card's upgrade list
         * @param {UpgradeCard} upgrade
         */
        public unattachUpgrade(upgrade) {
            this._upgrades = this.upgrades.filter((card) => card.uuid !== upgrade.uuid);
        }

        /**
         * Add the passed card to this card's upgrade list. Upgrade must already be moved to the correct arena.
         */
        public attachUpgrade(upgrade) {
            if (
                !Contract.assertEqual(upgrade.location, this.location) ||
                !Contract.assertTrue(this.controller.getCardPile(this.location).includes(upgrade))
            ) {
                return;
            }

            this._upgrades.push(upgrade);
        }

        public override leavesPlay() {
            this.unregisterWhenPlayedKeywords();
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