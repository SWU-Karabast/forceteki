import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, PlayType, Trait } from '../../../core/Constants';

export default class BB8HappyBeeps extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2283726359',
            internalName: 'bb8#happy-beeps',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingAbility({
            type: AbilityType.Triggered,
            when: {
                onCardPlayed: (event, context) =>
                    event.card === context.source &&
                    event.playType === PlayType.Piloting
            },
            title: 'Pay 2 resources',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResourceCost((context) => ({
                amount: 2,
                target: context.player
            })),
            ifYouDo: {
                title: 'Ready a Resistance unit',
                targetResolver: {
                    activePromptTitle: 'Choose a Resistance unit to ready',
                    cardCondition: (card) => card.hasSomeTrait(Trait.Resistance),
                    immediateEffect: AbilityHelper.immediateEffects.ready()
                }
            }
        });
    }
}