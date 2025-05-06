import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class DarthMalakCovetousApprentice extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2285555274',
            internalName: 'darth-malak#covetous-apprentice'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'If you control a Sith leader unit, you may ready this unit.',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ trait: Trait.Sith, condition: (card) => card.isLeaderUnit() }),
                onTrue: AbilityHelper.immediateEffects.ready()
            })
        });
    }
}
