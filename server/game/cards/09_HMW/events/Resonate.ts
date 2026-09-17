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
            title: 'If a friendly non-leader unit shares a Trait with a friendly Leader, heal 4 damage from a unit or base',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaCard({ type: WildcardCardType.NonLeaderUnit, trait: context.player.getLeaderCards()
                    .flatMap((leader) => Array.from(leader.traits)) }),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 4 })
                })
            })
        });
    }
}