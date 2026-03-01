import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class WhenHasBecomeNow extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8210990735',
            internalName: 'when-has-become-now',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play a card with Plot from your resources. If you do, put the top card of your deck into play as a resource',
            targetResolver: {
                activePromptTitle: 'Choose a card with Plot',
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Playable,
                cardCondition: (card) => card.hasSomeKeyword(KeywordName.Plot),
                immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                    playAsType: WildcardCardType.Any,
                    canPlayFromAnyZone: true,
                })
            },
            ifYouDo: {
                title: 'Put the top card of your deck into play as a resource',
                immediateEffect: abilityHelper.immediateEffects.resourceCard((context) => ({
                    target: context.player.getTopCardOfDeck()
                }))
            }
        });
    }
}