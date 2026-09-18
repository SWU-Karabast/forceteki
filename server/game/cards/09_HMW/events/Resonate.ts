import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class Resonate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2493874586',
            internalName: 'resonate'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Heal 4 damage from a unit or base',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaCard({ type: WildcardCardType.NonLeaderUnit, trait: context.player.getLeaderCards()
                    .flatMap((leader) => Array.from(leader.traits)) }),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Any,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 4 })
                })
            })
        });
    }
}