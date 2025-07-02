import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Trait } from '../../../core/Constants';

export default class DeathField extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4092125792',
            internalName: 'death-field',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Deal 2 damage to each non-Vehicle enemy unit. If you control a Force unit, draw a card',
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
