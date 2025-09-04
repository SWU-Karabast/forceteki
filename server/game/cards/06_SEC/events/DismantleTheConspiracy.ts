import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class DismantleTheConspiracy extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8062787049',
            internalName: 'dismantle-the-conspiracy',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'A friendly unit captures any number of enemy non leader units with 7 or less HP',
            targetResolvers: {
                friendlyUnit: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                },
                captureUnit: {
                    canChooseNoCards: true,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    mode: TargetMode.Unlimited,
                    multiSelectCardCondition: (card, selectedCards) => card.isNonLeaderUnit() && selectedCards.reduce((totalHp, selectedCard) => totalHp + (selectedCard as IUnitCard).remainingHp, card.remainingHp) <= 7,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                        captor: context.targets.friendlyUnit
                    }))
                }
            }
        });
    }
}