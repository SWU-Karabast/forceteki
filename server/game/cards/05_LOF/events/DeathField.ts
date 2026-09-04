import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DeathField extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4092125792',
            internalName: 'death-field',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Deal 2 damage to each non-${TextHelper.Trait.Vehicle} enemy unit. If you control a ${TextHelper.Trait.Force} unit, draw a card`,
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 2,
                    target: context.player.opponent.getArenaUnits({ condition: (unit) => !unit.hasSomeTrait(Trait.Vehicle) }),
                })),
                AbilityHelper.immediateEffects.conditional((context) => ({
                    condition: context.player.hasSomeArenaUnit({ trait: Trait.Force }),
                    onTrue: AbilityHelper.immediateEffects.draw(),
                })),
            ]),
        });
    }
}
