import AbilityHelper from '../../../AbilityHelper';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, Location, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import * as Contract from '../../../core/utils/Contract';


export default class BlizzardAssaultAtat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3830969722',
            internalName: 'blizzard-assault-atat',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Deal the excess damage from the attack to an enemy ground unit',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttackerDamage &&
                    event.defeatSource.attack.attacker === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                locationFilter: Location.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    type: DamageType.Excess,
                    sourceEventForExcessDamage: context.event.defeatSource.event
                }))
            }
        });
    }
}

BlizzardAssaultAtat.implemented = true;
