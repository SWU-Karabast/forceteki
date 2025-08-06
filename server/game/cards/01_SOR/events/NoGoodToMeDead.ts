import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityRestriction, WildcardCardType } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class NoGoodToMeDead extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8800836530',
            internalName: 'no-good-to-me-dead',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a unit. That unit can\'t ready this round (including during the regroup phase)',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.forThisRoundCardEffect({
                        effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready)
                    })
                ])
            },
        });
    }
}
