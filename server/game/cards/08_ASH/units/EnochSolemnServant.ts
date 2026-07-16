import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EnochSolemnServant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0694894752',
            internalName: 'enoch#solemn-servant',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Deal up to 6 damage to your base. If you do, the next unit you play costs one less for every teo damage dealt this way',
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                amountToDistribute: 6,
                canDistributeLess: true,
                controller: RelativePlayer.Self,
                canChooseNoTargets: true,
                cardTypeFilter: CardType.Base,
                maxTargets: 1,
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'The next unit you play costs one less for every two damage dealt this way',
                contextTitle: () => `The next unit you play costs ${Math.floor(ifYouDoContext.events[0].totalDistributed / 2)} less`,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                    effect: AbilityHelper.ongoingEffects.decreaseCost({
                        cardTypeFilter: WildcardCardType.Unit,
                        limit: AbilityHelper.limit.perPlayerPerGame(1),
                        amount: Math.floor(ifYouDoContext.events[0].totalDistributed / 2)
                    })
                })
            })
        });
    }
}