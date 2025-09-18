import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CrosshairFilledWithDoubt extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'crosshair#filled-with-doubt-id',
            internalName: 'crosshair#filled-with-doubt',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to another friendly unit. If you do, deal 2 damage to the defending player\'s base',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
            },
            ifYouDo: {
                title: 'Deal 2 damage to the defending player\'s base',
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.source.activeAttack.getDefendingPlayer().base
                }))
            }
        });
    }
}