import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class KazudaXionoBestPilotInTheGalaxy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4531112134',
            internalName: 'kazuda-xiono#best-pilot-in-the-galaxy'
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Select a friendly unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    innerSystem: AbilityHelper.immediateEffects.forThisRoundCardEffect({
                        effect: AbilityHelper.ongoingEffects.loseAllAbilities()
                    })
                })
            ])
        });
    }
}