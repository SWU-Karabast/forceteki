import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityType, CardType, DamageModificationType } from '../../../core/Constants';

export default class CloseTheShieldGate extends EventCard {
    protected override getImplementationId () {
        return {
            id: '8736422150',
            internalName: 'close-the-shield-gate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a base. The next time that base would be dealt damage this phase, prevent that damage.',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'Prevent the next damage dealt to this base',
                        type: AbilityType.DamageModification,
                        modificationType: DamageModificationType.PreventAll,
                        limit: AbilityHelper.limit.perPhase(1)
                    })
                })
            }
        });
    }
}
