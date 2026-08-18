import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class WicketFewGreaterBattlesToFight extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'wicket#few-greater-battles-to-fight-id',
            internalName: 'wicket#few-greater-battles-to-fight',
        };
    }

    protected override setupLeaderSideAbilities (registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Exhaust this leader to draw a card',
            when: {
                onAttackDeclared: (e, c) => {
                    return e.attack.attacker.controller === c.player &&
                      e.attack.getLegalTargets().some((u) => u.isUnit() && u.cost > e.attack.attacker.cost);
                }
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Draw a card',
                immediateEffect: abilityHelper.immediateEffects.draw()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities (registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Draw a card',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (c) => c.player.hasSomeArenaUnit({ condition: (ca) => ca.isUnit() && ca.cost <= 3 }),
                onTrue: abilityHelper.immediateEffects.draw(),
            })
        });
    }
}
