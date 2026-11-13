import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamageModificationType, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class YodaADisturbingPuzzle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6032765584',
            internalName: 'yoda#a-disturbing-puzzle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Prevent all combat damage that would be dealt to and dealt by an enemy unit for this phase',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainDamageModificationAbility({
                        title: 'Prevent all combat damage that would be dealt to and dealt by this unit',
                        type: AbilityType.DamageModification,
                        modificationType: DamageModificationType.PreventAll,
                        damageOfType: DamageSourceType.Attack,
                        shouldCardHaveDamageModification: (card, context) =>
                            card === context.source || context.event.damageSource.damageDealtBy?.includes(context.source)
                    })
                })
            }
        });
    }
}
