import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';

export default class AdmiralHoldoWereNotAlone extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8943696478',
            internalName: 'admiral-holdo#were-not-alone',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Give a Resistance unit or a unit with a Resistance upgrade on it +2/+2 for this phase',
            cost: [AbilityHelper.costs.abilityResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && this.isResistanceOrHasResistanceUpgrade(card),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Give another Resistance unit or a unit with a Resistance upgrade on it +2/+2 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.isUnit() && this.isResistanceOrHasResistanceUpgrade(card),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                }),
            }
        });
    }

    private isResistanceOrHasResistanceUpgrade(card: IUnitCard) {
        return card.hasSomeTrait(Trait.Resistance) || card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Resistance));
    }
}


