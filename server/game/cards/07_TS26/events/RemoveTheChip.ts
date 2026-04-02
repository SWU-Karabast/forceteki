import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class RemoveTheChip extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'remove-the-chip-id',
            internalName: 'remove-the-chip',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a unit. If it\'s a Clone, ready it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage({ amount: 2 }),
                    abilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.isUnit() && context.target.hasSomeTrait(Trait.Clone),
                        onTrue: abilityHelper.immediateEffects.ready()
                    })
                ])
            }
        });
    }
}