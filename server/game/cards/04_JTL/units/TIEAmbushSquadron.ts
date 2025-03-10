import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TIEAmbushSquadron extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0097256640',
            internalName: 'tie-ambush-squadron'
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Create a TIE Fighter token.',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter()
        });
    }
}
