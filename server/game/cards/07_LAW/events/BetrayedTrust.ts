import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityRestriction, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BetrayedTrust extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7069221067',
            internalName: 'betrayed-trust',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'An enemy unit can\'t deal combat damage for this phase',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.DealCombatDamage),
                    ongoingEffectDescription: 'prevent {0} from dealing combat damage'
                })
            }
        });
    }
}