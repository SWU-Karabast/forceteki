import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class CaughtInTheCrossfire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5013139687',
            internalName: 'caught-in-the-crossfire',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Choose 2 enemy units in the same arena. Each of those units deals damage equal to its power to the other.',
            targetResolver: {
                activePromptTitle: 'Choose 2 enemy units in the same arena',
                mode: TargetMode.Exactly,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => EnumHelpers.isArena(card.zoneName) && card.controller.getArenaUnits({ arena: card.zoneName }).length > 1,
                multiSelectCardCondition: (card, selectCards) => selectCards.length === 0 || card.zone === selectCards[0].zone,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.damage((context) => ({
                        source: context.target[0],
                        amount: context.target[0]?.getPower(),
                        target: context.target[1],
                    })),
                    AbilityHelper.immediateEffects.damage((context) => ({
                        source: context.target[1],
                        amount: context.target[1]?.getPower(),
                        target: context.target[0],
                    })),
                ])
            }
        });
    }
}
