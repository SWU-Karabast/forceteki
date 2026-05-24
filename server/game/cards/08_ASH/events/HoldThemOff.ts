import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class HoldThemOff extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'hold-them-off-id',
            internalName: 'hold-them-off',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a friendly unit. That unit deals damage equal to its power divided as you choose among any number of units in its arena.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong((context) => ({
                    amountToDistribute: context.target?.getPower(),
                    canChooseNoTargets: true,
                    controller: WildcardRelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: context.target?.zoneName,
                    source: context.target
                }))
            },
        });
    }
}