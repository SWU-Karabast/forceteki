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

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Use the Force. If you do, take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it',
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Take control of a non-leader unit. At the start of the regroup phase, its owner takes control of it',
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
                                newController: context.target.owner,
                                excludeLeaderUnit: false,
                            })
                        }))
                    ])
                }
            }
        });
    }
}