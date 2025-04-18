import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';

export default class BlackOneScourgeOfStarkillerBase extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8429598559',
            internalName: 'black-one#scourge-of-starkiller-base'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Discard your hand',
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.discardEntireHand((context) => ({ target: context.player })),
            ifYouDo: {
                title: 'Draw 3 cards',
                immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 3 })
            }
        });
    }
}
