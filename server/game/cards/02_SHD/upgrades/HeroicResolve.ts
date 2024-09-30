import AbilityHelper from '../../../AbilityHelper';
import { AbilityContext } from '../../../core/ability/AbilityContext';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import Player from '../../../core/Player';

export default class HeroicResolve extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4085341914',
            internalName: 'heroic-resolve',
        };
    }

    public override setupCardAbilities() {
        this.addGainActionAbilityTargetingAttached({
            title: 'Attack with this unit. It gains +4/+0 and Overwhelm for this attack.',
            cost: [
                AbilityHelper.costs.abilityResourceCost(2),
                AbilityHelper.costs.defeat({
                    cardCondition: (card, context) => card.isUpgrade() && card.parentCard === context.source && card.title === 'Heroic Resolve',
                    controller: RelativePlayer.Any,
                    cardTypeFilter: WildcardCardType.Upgrade
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.attack({
                attackerLastingEffects: [
                    { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 }) },
                    { effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm) }
                ]
            })
        });
    }
}

HeroicResolve.implemented = true;
