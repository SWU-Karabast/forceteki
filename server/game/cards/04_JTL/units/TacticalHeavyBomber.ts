import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class TacticalHeavyBomber extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6228218834',
            internalName: 'tactical-heavy-bomber',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Deal indirect damage equal to this unit\'s power to the defending player. If a base is damaged this way, draw a card',
            immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                amount: context.source.getPower(),
                target: context.player.opponent,
            })),
            ifYouDo: {
                title: 'Draw a card',
                ifYouDoCondition: (context) => context.events.some((event) =>
                    event.name === EventName.OnDamageDealt &&
                    (event.card as Card).isBase() &&
                    event.damageSource.type === DamageSourceType.Ability &&
                    event.damageSource.card === context.source &&
                    event.isIndirect
                ),
                immediateEffect: AbilityHelper.immediateEffects.draw(),
            }
        });
    }
}
