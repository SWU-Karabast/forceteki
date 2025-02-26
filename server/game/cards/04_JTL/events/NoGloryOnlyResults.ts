import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class NoGloryOnlyResults extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9810057689',
            internalName: 'no-glory-only-results',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Take control of a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                    newController: context.player,
                }))
            },
            then: (thenContext) => ({
                title: `Defeat ${thenContext.target.title}`,
                immediateEffect: AbilityHelper.immediateEffects.defeat({
                    target: thenContext.target,
                })
            }),
        });
    }
}
