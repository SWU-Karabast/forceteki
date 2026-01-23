import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class TheTreeRemembers extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3767887103',
            internalName: 'the-tree-remembers',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a unit. It loses all abilities for this phase. If it costs 3 or less, defeat it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.loseAllAbilities(),
                        ongoingEffectDescription: 'remove all abilities from'
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.cost <= 3,
                        onTrue: AbilityHelper.immediateEffects.defeat()
                    })
                ]),
            },
        });
    }
}
