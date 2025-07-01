import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TIEAmbushSquadron extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0097256640',
            internalName: 'tie-ambush-squadron'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Create a TIE Fighter token.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter()
        });
    }
}
