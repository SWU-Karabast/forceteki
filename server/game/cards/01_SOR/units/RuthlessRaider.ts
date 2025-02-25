import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RuthlessRaider extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1047592361',
            internalName: 'ruthless-raider'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal 2 damage to an enemy base and 2 damage to an enemy unit',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }),
                AbilityHelper.immediateEffects.damage((context) => ({ amount: 2, target: context.player.opponent.base }))
            ])
        });
    }
}
