import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, EventName } from '../../../core/Constants';

export default class BoShekCharismaticSmuggler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5673100759',
            internalName: 'boshek#charismatic-smuggler',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingAbility({
            title: 'Discard 2 cards from your deck. Return each of those cards with an odd cost to your hand',
            type: AbilityType.Triggered,
            when: {
                whenPlayed: true,
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
