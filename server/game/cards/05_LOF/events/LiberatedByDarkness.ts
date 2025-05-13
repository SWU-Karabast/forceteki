import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { PhaseName, WildcardCardType } from '../../../core/Constants';

export default class LiberatedByDarkness extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7691597101',
            internalName: 'liberated-by-darkness',
        };
    }

    protected override setupCardAbilities() {
        this.setEventAbility({
            title: 'Use the Force',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it.',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            newController: context.player,
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
            }
        });
    }
}