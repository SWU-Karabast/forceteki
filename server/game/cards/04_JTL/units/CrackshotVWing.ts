import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class CrackshotVWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4159101997',
            internalName: 'crackshot-vwing',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Defeat this unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({
                    trait: Trait.Fighter,
                    otherThan: context.source
                }),
                onFalse: AbilityHelper.immediateEffects.damage((context) => ({
                    target: context.source,
                    amount: 1
                })),
            }),
        });
    }
}
