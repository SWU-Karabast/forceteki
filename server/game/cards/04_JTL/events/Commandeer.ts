import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { PhaseName, Trait, WildcardCardType } from '../../../core/Constants';

export default class Commandeer extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8105698374',
            internalName: 'commandeer',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Take control of a non-leader Vehicle unit that costs 6 or less without a Pilot on it. At the start of the regroup phase, return that unit to its owner\'s hand.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle) && card.isUnit() && card.cost <= 6 && !card.upgrades.some((u) => u.hasSomeTrait(Trait.Pilot)),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                        newController: context.player,
                    })),
                    AbilityHelper.immediateEffects.delayedCardEffect({
                        title: 'Return that unit to its owner\'s hand.',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                    })
                ])
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Ready it',
                immediateEffect: AbilityHelper.immediateEffects.ready({ target: ifYouDoContext.target }),
            })
        });
    }
}
