import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, ZoneName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class BlizzardAssaultAtat extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3830969722',
            internalName: 'blizzard-assault-atat',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Deal the excess damage from the attack to an enemy ground unit',
            optional: true,
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
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
