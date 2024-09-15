import AbilityHelper from '../../AbilityHelper';
import { UnitCard } from '../../core/card/CardTypes';
import { EventCard } from '../../core/card/EventCard';
import { Trait } from '../../core/Constants';

export default class Headhunting extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5896817672',
            internalName: 'headhunting',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Attack with up to 3 units',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                this.buildBountyHunterAttackEffect(),
                this.buildBountyHunterAttackEffect(),
                this.buildBountyHunterAttackEffect()
            ])
        });
    }

    private buildBountyHunterAttackEffect() {
        return AbilityHelper.immediateEffects.selectCard({
            innerSystem: AbilityHelper.immediateEffects.attack({
                targetCondition: (card) => !card.isBase(),
                attackerLastingEffects: AbilityHelper.ongoingEffects.conditionalAttackStatBonus({
                    bonusCondition: (attacker: UnitCard) => attacker.hasSomeTrait(Trait.BountyHunter),
                    statBonus: { power: 2, hp: 0 }
                }),
                optional: true
            })
        });
    }
}

Headhunting.implemented = true;
