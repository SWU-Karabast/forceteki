import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class PointRainReclaimer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8496220683',
            internalName: 'point-rain-reclaimer',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If you control a Jedi unit, give an Experience token to this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.isTraitInPlay(Trait.Jedi),
                onTrue: AbilityHelper.immediateEffects.giveExperience(),
            })
        });
    }
}