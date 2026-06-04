import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Reforge extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5423601343',
            internalName: 'reforge',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat an upgrade on a friendly unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => card.isUpgrade() && card.parentCard.controller === context.player,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Search the top 8 cards of your deck for an upgrade that can attach to ${ifYouDoContext.events[0].lastKnownInformation.parentCard.title}, reveal it, and play it on that unit. It costs ${TextHelper.resource(4)} less`,
                immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 8,
                    activePromptTitle: `Search the top 8 cards of your deck for an upgrade that can attach to ${ifYouDoContext.events[0].lastKnownInformation.parentCard.title}`,
                    cardCondition: (card) => card.isUpgrade(),
                    selectedCardsImmediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 4 },
                        playAsType: WildcardCardType.Upgrade,
                        attachTargetCondition: (attachTarget) => attachTarget === ifYouDoContext.events[0].lastKnownInformation.parentCard,
                    }),
                }),
            }),
        });
    }
}
