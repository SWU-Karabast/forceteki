import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class CountDookuSilverTongued extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'count-dooku#silvertongued-id',
            internalName: 'count-dooku#silvertongued',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each opponent can\'t ready more than 1 ground unit and 1 space unit during the regroup phase',
            targetController: RelativePlayer.Opponent,
            ongoingEffect: AbilityHelper.ongoingEffects.limitReadyDuringRegroup({
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.Unit,
                numCardsFunc: (candidates) => new Set(candidates.map((card) => card.zoneName)).size,
                multiSelectCardCondition: (card, selectedCards) => selectedCards.every((selected) => selected.zoneName !== card.zoneName),
                activePromptTitle: (candidates) => {
                    const hasGround = candidates.some((card) => card.zoneName === ZoneName.GroundArena);
                    const hasSpace = candidates.some((card) => card.zoneName === ZoneName.SpaceArena);
                    if (hasGround && hasSpace) {
                        return 'Choose a ground unit and a space unit to ready';
                    }
                    return hasSpace ? 'Choose a space unit to ready' : 'Choose a ground unit to ready';
                }
            })
        });

        registrar.addWhenPlayedAbility({
            title: 'Exhaust a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}
