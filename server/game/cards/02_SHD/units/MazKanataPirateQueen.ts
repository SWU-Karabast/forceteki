import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MazKanataPirateQueen extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9850906885',
            internalName: 'maz-kanata#pirate-queen',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give an experience token to Maz Kanata',
            when: {
                onCardPlayed: (event, context) =>
                    event.card.isUnit() &&
                    event.card.controller === context.source.controller &&
                    event.card !== context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
        });
    }
}
