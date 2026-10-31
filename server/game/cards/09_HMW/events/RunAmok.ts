import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class RunAmok extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6376056191',
            internalName: 'run-amok',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Create a Beast token. Deal 1 damage to a friendly ground unit and an enemy ground unit',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.createBeast(),
                AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 1 damage to a friendly ground unit',
                        zoneFilter: ZoneName.GroundArena,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Self,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                    }),
                    AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 1 damage to an enemy ground unit',
                        zoneFilter: ZoneName.GroundArena,
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                    }),
                ])
            ])
        });
    }
}