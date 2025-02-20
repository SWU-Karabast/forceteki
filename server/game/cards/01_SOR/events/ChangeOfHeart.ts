import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { PhaseName, WildcardCardType } from '../../../core/Constants';

export default class ChangeOfHeart extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1626462639',
            internalName: 'change-of-heart',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        newController: context.source.controller
                    })),
                    AbilityHelper.immediateEffects.delayedCardEffect((context) => ({
                        title: 'Owner takes control',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                            newController: context.target.owner
                        })
                    }))
                ])
            }
        });
    }
}
