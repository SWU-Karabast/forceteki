import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class Equalize extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5013214638',
            internalName: 'equalize',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a unit –2/–2 for this phase. Then, if you control fewer units than that unit\'s controller, give another unit –2/–2 for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                })
            },
            then: (thenContext) => ({
                title: 'Give another unit –2/–2 for this phase',
                thenCondition: (context) => context.player.getArenaUnits().length < context.player.opponent.getArenaUnits().length,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => thenContext.target !== card,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                    })
                }
            })
        });
    }
}
