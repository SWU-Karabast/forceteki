import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class HeartlessTactics extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2384695376',
            internalName: 'heartless-tactics',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Exhaust a unit and give it –2/–0 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                    })
                ])
            },
            then: (thenContext) => ({
                title: 'If it has 0 power and isn\'t a leader, return it to its owner\'s hand',
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: () => thenContext.target.isNonLeaderUnit() && thenContext.target.getPower() === 0,
                    onTrue: AbilityHelper.immediateEffects.returnToHand({ target: thenContext.target }),
                })
            })
        });
    }
}
