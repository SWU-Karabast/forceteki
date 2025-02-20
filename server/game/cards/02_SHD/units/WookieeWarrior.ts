import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class WookieeWarrior extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1477806735',
            internalName: 'wookiee-warrior'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Draw if you control an another Wookie unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.isTraitInPlay(Trait.Wookiee, context.source),
                onTrue: AbilityHelper.immediateEffects.draw(),
            })
        });
    }
}
