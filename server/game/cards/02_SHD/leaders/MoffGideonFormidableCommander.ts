import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, WildcardZoneName } from '../../../core/Constants';

export default class MoffGideonFormidableCommander extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2503039837',
            internalName: 'moff-gideon#formidable-commander',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Attack with a unit that costs 3 or less. If it\'s attacking a unit, it gets +1/+0 for this attack',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: {
                        condition: (attack) => attack.target.isUnit(),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                    }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'Each friendly unit that costs 3 or less gets +1/+0 and gains Overwhelm while attacking an enemy unit',
            targetZoneFilter: WildcardZoneName.AnyArena,
            matchTarget: (card, context) => card.isUnit() && card.isAttacking() && card.controller === context.source.controller && card.cost <= 3 && card.activeAttack?.target?.isUnit(),
            ongoingEffect: [AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm), AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })],
        });
    }
}