import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import { CardType, EffectName, StatType } from '../../Constants';
import StatsModifierWrapper from '../../ongoingEffect/effectImpl/StatsModifierWrapper';
import { IOngoingCardEffect } from '../../ongoingEffect/IOngoingCardEffect';
import Contract from '../../utils/Contract';
import { InPlayCard, InPlayCardConstructor } from '../baseClasses/InPlayCard';
import { UnitCard } from '../CardTypes';
import { WithDamage } from './Damage';
import { WithPrintedPower } from './PrintedPower';
import type { WithPrintedHp } from './PrintedHp';
import * as EnumHelpers from '../../utils/EnumHelpers';

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
        // *************************************** PROPERTY GETTERS ***************************************
        public override get hp(): number {
            return this.getModifiedStatValue(StatType.Hp);
        }

        public override get power(): number {
            return this.getModifiedStatValue(StatType.Power);
        }

        // ****************************************** CONSTRUCTOR ******************************************
        // see Card constructor for list of expected args
        public constructor(...args: any[]) {
            super(...args);
            Contract.assertTrue(EnumHelpers.isUnit(this.printedType));

            this.defaultActions.push(new InitiateAttackAction(this));
        }

        public override isUnit() {
            return true;
        }

        // ***************************************** STAT HELPERS *****************************************
        private getModifiedStatValue(statType: StatType, floor = true, excludeModifiers = []) {
            const wrappedModifiers = this.getWrappedStatModifiers(excludeModifiers);

            const baseStatValue = StatsModifierWrapper.fromPrintedValues(this);

            const stat = wrappedModifiers.reduce((total, wrappedModifier) => total + wrappedModifier.modifier[statType], baseStatValue.modifier[statType]);
            if (isNaN(stat)) {
                return 0;
            }

            // TODO EFFECTS: need a check around here somewhere to defeat the unit if effects have brought hp to 0

            return floor ? Math.max(0, stat) : stat;
        }

        // TODO: add a summary method that logs these modifiers (i.e., the names, amounts, etc.)
        private getWrappedStatModifiers(exclusions) {
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

            return wrappedStatsModifiers;
        }

        // TODO UPGRADES: this whole section for managing upgrades on a unit
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
         * @param {Card} attachment
         */
        public removeAttachment(attachment) {
            this._upgrades = this.upgrades.filter((card) => card.uuid !== attachment.uuid);
        }

        // /**
        //  * Checks 'no attachment' restrictions for this card when attempting to
        //  * attach the passed attachment card.
        //  */
        // public allowAttachment(attachment) {
        //     if (this.allowedAttachmentTraits.some((trait) => attachment.hasSomeTrait(trait))) {
        //         return true;
        //     }

        //     return this.isBlank() || this.allowedAttachmentTraits.length === 0;
        // }

        // attachmentConditions(properties: AttachmentConditionProps): void {
        //     const effects = [];
        //     if (properties.limit) {
        //         effects.push(Effects.attachmentLimit(properties.limit));
        //     }
        //     if (properties.myControl) {
        //         effects.push(Effects.attachmentMyControlOnly());
        //     }
        //     if (properties.opponentControlOnly) {
        //         effects.push(Effects.attachmentOpponentControlOnly());
        //     }
        //     if (properties.unique) {
        //         effects.push(Effects.attachmentUniqueRestriction());
        //     }
        //     if (properties.faction) {
        //         const factions = Array.isArray(properties.faction) ? properties.faction : [properties.faction];
        //         effects.push(Effects.attachmentFactionRestriction(factions));
        //     }
        //     if (properties.trait) {
        //         const traits = Array.isArray(properties.trait) ? properties.trait : [properties.trait];
        //         effects.push(Effects.attachmentTraitRestriction(traits));
        //     }
        //     if (properties.limitTrait) {
        //         const traitLimits = Array.isArray(properties.limitTrait) ? properties.limitTrait : [properties.limitTrait];
        //         traitLimits.forEach((traitLimit) => {
        //             const trait = Object.keys(traitLimit)[0];
        //             effects.push(Effects.attachmentRestrictTraitAmount({ [trait]: traitLimit[trait] }));
        //         });
        //     }
        //     if (properties.cardCondition) {
        //         effects.push(Effects.attachmentCardCondition(properties.cardCondition));
        //     }
        //     if (effects.length > 0) {
        //         this.persistentEffect({
        //             location: Location.Any,
        //             effect: effects
        //         });
        //     }
        // }

        // isAttachmentBonusModifierSwitchActive() {
        //     const switches = this.getEffectValues(EffectName.SwitchAttachmentSkillModifiers).filter(Boolean);
        //     // each pair of switches cancels each other. Need an odd number of switches to be active
        //     return switches.length % 2 === 1;
        // }

        // applyAttachmentBonus() {
        //     const militaryBonus = parseInt(this.cardData.military_bonus);
        //     const politicalBonus = parseInt(this.cardData.political_bonus);
        //     if (!isNaN(militaryBonus)) {
        //         this.persistentEffect({
        //             match: (card) => card === this.parent,
        //             targetController: RelativePlayer.Any,
        //             effect: AbilityHelper.effects.attachmentMilitarySkillModifier(() =>
        //                 this.isAttachmentBonusModifierSwitchActive() ? politicalBonus : militaryBonus
        //             )
        //         });
        //     }
        //     if (!isNaN(politicalBonus)) {
        //         this.persistentEffect({
        //             match: (card) => card === this.parent,
        //             targetController: RelativePlayer.Any,
        //             effect: AbilityHelper.effects.attachmentPoliticalSkillModifier(() =>
        //                 this.isAttachmentBonusModifierSwitchActive() ? militaryBonus : politicalBonus
        //             )
        //         });
        //     }
        // }

        // checkForIllegalAttachments() {
        //     let context = this.game.getFrameworkContext(this.controller);
        //     const illegalAttachments = new Set(
        //         this.upgrades.filter((attachment) => !this.allowAttachment(attachment) || !attachment.canAttach(this))
        //     );
        //     for (const effectCard of this.getEffectValues(EffectName.CannotHaveOtherRestrictedAttachments)) {
        //         for (const card of this.upgrades) {
        //             if (card.isRestricted() && card !== effectCard) {
        //                 illegalAttachments.add(card);
        //             }
        //         }
        //     }

        //     const attachmentLimits = this.upgrades.filter((card) => card.anyEffect(EffectName.AttachmentLimit));
        //     for (const card of attachmentLimits) {
        //         let limit = Math.max(...card.getEffectValues(EffectName.AttachmentLimit));
        //         const matchingAttachments = this.upgrades.filter((attachment) => attachment.id === card.id);
        //         for (const card of matchingAttachments.slice(0, -limit)) {
        //             illegalAttachments.add(card);
        //         }
        //     }

        //     const frameworkLimitsAttachmentsWithRepeatedNames =
        //         this.game.gameMode === GameMode.Emerald || this.game.gameMode === GameMode.Obsidian;
        //     if (frameworkLimitsAttachmentsWithRepeatedNames) {
        //         for (const card of this.upgrades) {
        //             const matchingAttachments = this.upgrades.filter(
        //                 (attachment) =>
        //                     !attachment.allowDuplicatesOfAttachment &&
        //                     attachment.id === card.id &&
        //                     attachment.controller === card.controller
        //             );
        //             for (const card of matchingAttachments.slice(0, -1)) {
        //                 illegalAttachments.add(card);
        //             }
        //         }
        //     }

        //     for (const object of this.upgrades.reduce(
        //         (array, card) => array.concat(card.getEffectValues(EffectName.AttachmentRestrictTraitAmount)),
        //         []
        //     )) {
        //         for (const trait of Object.keys(object)) {
        //             const matchingAttachments = this.upgrades.filter((attachment) => attachment.hasSomeTrait(trait));
        //             for (const card of matchingAttachments.slice(0, -object[trait])) {
        //                 illegalAttachments.add(card);
        //             }
        //         }
        //     }
        //     let maximumRestricted = 2 + this.sumEffects(EffectName.ModifyRestrictedAttachmentAmount);
        //     if (this.upgrades.filter((card) => card.isRestricted()).length > maximumRestricted) {
        //         this.game.promptForSelect(this.controller, {
        //             activePromptTitle: 'Choose an attachment to discard',
        //             waitingPromptTitle: 'Waiting for opponent to choose an attachment to discard',
        //             cardCondition: (card) => card.parent === this && card.isRestricted(),
        //             onSelect: (player, card) => {
        //                 this.game.addMessage(
        //                     '{0} discards {1} from {2} due to too many Restricted attachments',
        //                     player,
        //                     card,
        //                     card.parent
        //                 );

        //                 if (illegalAttachments.size > 0) {
        //                     this.game.addMessage(
        //                         '{0} {1} discarded from {3} as {2} {1} no longer legally attached',
        //                         Array.from(illegalAttachments),
        //                         illegalAttachments.size > 1 ? 'are' : 'is',
        //                         illegalAttachments.size > 1 ? 'they' : 'it',
        //                         this
        //                     );
        //                 }

        //                 illegalAttachments.add(card);
        //                 this.game.applyGameAction(context, { discardFromPlay: Array.from(illegalAttachments) });
        //                 return true;
        //             },
        //             source: 'Too many Restricted attachments'
        //         });
        //         return true;
        //     } else if (illegalAttachments.size > 0) {
        //         this.game.addMessage(
        //             '{0} {1} discarded from {3} as {2} {1} no longer legally attached',
        //             Array.from(illegalAttachments),
        //             illegalAttachments.size > 1 ? 'are' : 'is',
        //             illegalAttachments.size > 1 ? 'they' : 'it',
        //             this
        //         );
        //         this.game.applyGameAction(context, { discardFromPlay: Array.from(illegalAttachments) });
        //         return true;
        //     }
        //     return false;
        // }
    };
}