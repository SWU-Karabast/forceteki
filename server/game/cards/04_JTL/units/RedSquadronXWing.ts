import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RedSquadronXWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5751831621',
            internalName: 'red-squadron-xwing',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
