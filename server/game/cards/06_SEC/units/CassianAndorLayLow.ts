import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { DamagePreventionType, RelativePlayer } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class CassianAndorLayLow extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'cassian-andor#lay-low-id',
            internalName: 'cassian-andor#lay-low',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is defending, the attacker gets -2/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isAttacking() && context.source.isDefending(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })

        });

        // registrar.addReplacementEffectAbility({
        //     title: 'If an enemy card ability would do damage to this unit, prevent 2 of that damage',
        //     when: { onDamageDealt: (event, context) =>
        //         event.card === context.source &&
        //         !event.isIndirect && event.damageSource.type !== DamageSourceType.Attack && event.damageSource.player !== context.source.controller },
        //     replaceWith: {
        //         replacementImmediateEffect: new DamageSystem((context) => ({
        //             target: context.source,
        //             amount: Math.max(context.event.amount - 2, 0),
        //             source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy.Opponent,
        //             type: context.event.type,
        //         }))
        //     },
        //     effect: 'prevent 2 damage to {1}',
        //     effectArgs: (context) => [context.source]
        // });

        registrar.addDamagePreventionAbility({
            title: 'If an enemy card ability would do damage to this unit, prevent 2 of that damage',
            preventionType: DamagePreventionType.Reduce,
            preventDamageFromSource: RelativePlayer.Opponent,
            preventDamageFrom: DamageSourceType.Ability,
            preventionAmount: 2
        });
    }
}