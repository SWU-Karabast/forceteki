import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, TargetMode } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class GuerillaSoldier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2711104544',
            internalName: 'guerilla-soldier',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 3 indirect damage to a player. If a base is damaged this way, ready this unit',
            targetResolver: {
                activePromptTitle: 'Choose a player to deal 3 indirect damage to',
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 3 })
            },
            ifYouDo: {
                title: 'Ready this unit',
                ifYouDoCondition: (context) => context.events.some((event) =>
                    event.name === EventName.OnDamageDealt &&
                    (event.card as Card).isBase() &&
                    event.damageSource.type === DamageSourceType.Ability &&
                    event.damageSource.card === context.source &&
                    event.isIndirect
                ),
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}
