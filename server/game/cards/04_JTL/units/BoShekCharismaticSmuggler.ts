import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, EventName, PlayType } from '../../../core/Constants';

export default class BoShekCharismaticSmuggler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5673100759',
            internalName: 'boshek#charismatic-smuggler',
        };
    }

    public override setupCardAbilities() {
        this.addPilotingAbility({
            title: 'Discard 2 cards from your deck',
            type: AbilityType.Triggered,
            when: {
                onCardPlayed: (event, context) =>
                    event.card === context.source &&
                    event.playType === PlayType.Piloting
            },
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 2,
                target: context.player
            })),
            ifYouDo: (context) =>
                ({
                    title: 'Return each of those cards with an odd cost to your hand',
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand(() => ({
                        target: context.events.filter((e) => e.name === EventName.OnCardDiscarded && e.card.cost % 2 === 1).map((e) => e.card)
                    }))
                })
        });
    }
}
