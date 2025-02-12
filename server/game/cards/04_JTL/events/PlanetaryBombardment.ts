import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, Trait, WildcardZoneName } from '../../../core/Constants';

export default class PlanetaryBombardment extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0425156332',
            internalName: 'planetary-bombardment',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Deal 8 indirect damage to a player. If you control a Capital Ship unit, deal 12 indirect damage instead',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.hasSomeTrait(Trait.CapitalShip)).length > 0,
                    onTrue: AbilityHelper.immediateEffects.indirectDamage({ amount: 12 }),
                    onFalse: AbilityHelper.immediateEffects.indirectDamage({ amount: 8 })
                })
            }
        });
    }
}
