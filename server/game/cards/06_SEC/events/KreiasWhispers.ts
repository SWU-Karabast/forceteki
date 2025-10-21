import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';

export default class KreiasWhispers extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3661373584',
            internalName: 'kreias-whispers',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Draw 3 cards, then put one card from your hand on the top of your deck and another card from your hand on the bottom of your deck',
            immediateEffect: AbilityHelper.immediateEffects.draw({ amount: 3 }),
            then: {
                title: 'Put a card from your hand on top of your deck and another card from your hand on the bottom of your deck',
                targetResolvers: {
                    topCard: {
                        activePromptTitle: 'Choose a card to put on top of your deck',
                        mode: TargetMode.Single,
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Hand,
                    },
                    bottomCard: {
                        activePromptTitle: 'Choose a card to put on the bottom of your deck',
                        mode: TargetMode.Single,
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Hand,
                        cardCondition: (card, context) => context.targets.topCard !== card,
                        immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => ([
                            AbilityHelper.immediateEffects.moveToTopOfDeck({ target: context.targets.topCard }),
                            AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.targets.bottomCard }),
                        ]))
                    },
                },
            },
        });
    }
}