import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HonorBoundPartisan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6722304652',
            internalName: 'honorbound-partisan',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to a base',
            targetResolver: {
                cardCondition: (card) => card.isBase(),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
        registrar.addWhenDefeatedAbility({
            title: 'The next unit you play this phase costs 1 resource less',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                ongoingEffectDescription: 'discount the next unit played by',
                ongoingEffectTargetDescription: 'them',
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Unit,
                    limit: AbilityHelper.limit.perPlayerPerGame(1),
                    amount: 1
                })
            }),
        });
    }
}