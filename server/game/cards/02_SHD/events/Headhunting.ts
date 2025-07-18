import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Attack } from '../../../core/attack/Attack';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class Headhunting extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5896817672',
            internalName: 'headhunting',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with up to 3 units',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                this.buildBountyHunterAttackEffect(AbilityHelper),
                this.buildBountyHunterAttackEffect(AbilityHelper),
                this.buildBountyHunterAttackEffect(AbilityHelper)
            ])
        });
    }

    private buildBountyHunterAttackEffect(AbilityHelper: IAbilityHelper) {
        return AbilityHelper.immediateEffects.selectCard({
            immediateEffect: AbilityHelper.immediateEffects.attack({
                targetCondition: (card) => !card.isBase(),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                    condition: (attack: Attack) => attack.attacker.hasSomeTrait(Trait.BountyHunter)
                },
                optional: true
            })
        });
    }
}
