import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { Attack } from '../../../core/attack/Attack';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, DamageType, EntryType, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import type { IDamagedOrDefeatedByAttack } from '../../../IDamageOrDefeatSource';

export default class AsajjVentressDeathFromAbove extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'asajj-ventress#death-from-above-id',
            internalName: 'asajj-ventress#death-from-above',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const cost = TextHelper.resourceCost(5, [Aspect.Cunning, Aspect.Villainy]);

        registrar.addReplacementEffectAbility({
            title: `Reveal Asajj Ventress and pay ${cost} to return the attacker to its owner's hand and put her into play as the attacker`,
            contextTitle: (context) => `Reveal ${context.source.title} and pay ${cost} to return ${this.getAttacker(context.event).title} to its owner's hand and put ${context.source.title} into play as the attacker`,
            zoneFilter: ZoneName.Hand,
            optional: true,
            when: {
                onDamageDealt: (event, context) => this.isFriendlyGroundAttackerDamagingBase(event, context)
            },
            onlyIfYouDoEffect: AbilityHelper.immediateEffects.sequential({
                resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                gameSystems: [
                    AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source })),
                    AbilityHelper.immediateEffects.payResources((context) => ({
                        amount: 5,
                        aspects: [Aspect.Cunning, Aspect.Villainy],
                        target: context.player
                    }))
                ]
            }),
            replaceWith: (context) => ({
                effect: `return ${this.getAttacker(context.event).title} to its owner's hand and put ${context.source.title} into play as the attacker`,
                replacementImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.returnToHand({ target: this.getAttacker(context.event) }),
                    AbilityHelper.immediateEffects.putIntoPlay({ target: context.source, entryType: EntryType.PutIntoPlay }),
                    AbilityHelper.immediateEffects.replaceAttacker({ target: context.source, attack: this.getAttack(context.event) }),
                    AbilityHelper.immediateEffects.attackerCombatDamage({ target: context.event.card, attack: this.getAttack(context.event) })
                ])
            })
        });
    }

    private isFriendlyGroundAttackerDamagingBase(event, context: TriggeredAbilityContext): boolean {
        if (event.type !== DamageType.Combat || !event.card.isBase() || event.amount <= 0) {
            return false;
        }

        const attacker = this.getAttacker(event);

        return attacker.controller === context.player &&
          attacker.isNonLeaderUnit() &&
          attacker.zoneName === ZoneName.GroundArena;
    }

    private getAttack(event): Attack {
        return (event.damageSource as IDamagedOrDefeatedByAttack).attack;
    }

    /** The attacker that would have dealt this combat damage */
    private getAttacker(event): IUnitCard {
        return (event.damageSource as IDamagedOrDefeatedByAttack).damageDealtBy[0];
    }
}
