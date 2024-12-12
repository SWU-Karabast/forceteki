import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class _501stLiberator extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7252148824',
            internalName: '501st-liberator',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'If you control another Republic unit, you may heal 3 damage from a base.',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.controller.isTraitInPlay(Trait.Republic, context.source),
                onTrue: AbilityHelper.immediateEffects.heal((context) => ({ amount: 3, target: context.source.controller.base })),
                onFalse: AbilityHelper.immediateEffects.noAction()
            }),
        });
    }
}

_501stLiberator.implemented = true;
