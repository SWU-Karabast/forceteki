import AbilityHelper from '../../../AbilityHelper';
import { AbilityType, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';

export default class PyrrhicAssault extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9415708584',
            internalName: 'pyrrhic-assault',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'For this phase, each friendly unit gains: "When Defeated: Deal 2 damage to an enemy unit."',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.gainAbility({
                    type: AbilityType.Triggered,
                    title: 'Deal 2 damage to an enemy unit.',
                    when: { onCardDefeated: (event, context) => event.card === context.source },
                    targetResolver: {
                        controller: RelativePlayer.Opponent,
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                    }
                }),
                target: context.source.controller.getUnitsInPlay()
            }))
        });
    }
}

PyrrhicAssault.implemented = true;