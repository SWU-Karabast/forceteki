import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, ZoneName, RelativePlayer, WildcardCardType } from '../../../core/Constants';


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
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.excessDamage((context) => ({
                    type: DamageType.Excess,
                    sourceEventForExcessDamage: context.event.defeatSource.event
                }))
            }
        });
    }
}

BlizzardAssaultAtat.implemented = true;
