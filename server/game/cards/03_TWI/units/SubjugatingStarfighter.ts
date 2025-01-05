import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SubjugatingStarfighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4824842849',
            internalName: 'subjugating-starfighter',
        };
    }

    public override setupCardAbilities () {
        this.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                onCardPlayed: (event, context) => context.source.controller.hasInitiative(),
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}

SubjugatingStarfighter.implemented = true;
