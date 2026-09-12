import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Nightfall extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'nightfall-id',
            internalName: 'nightfall',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Deal 1 damage to an enemy unit. If you control an ${TextHelper.Trait.Endor} base, you may attack with a unit. It gets +2/+0 for this attack`,
            targetResolvers: {
                damageUnit: {
                    activePromptTitle: 'Deal 1 damage to an enemy unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                },
                attackUnit: {
                    activePromptTitle: 'Attack with a unit. It gets +2/+0 for this attack',
                    optional: true,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (c) => c.player.base.hasSomeTrait(Trait.Endor),
                        onTrue: AbilityHelper.immediateEffects.attack({
                            attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                        })
                    })
                }
            }
        });
    }
}