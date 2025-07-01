import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { TargetMode, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class DarthMaulSithRevealed extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0024560758',
            internalName: 'darth-maul#sith-revealed',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Deal 1 damage to a unit and 1 damage to a different unit',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.useTheForce()
            ],
            targetResolver: {
                activePromptTitle: 'Choose units to deal 1 damage to',
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                numCardsFunc: (context) => Math.min(2, context.game.getArenaUnits().length),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'Deal 1 damage to a unit and 1 damage to a different unit',
            targetResolver: {
                activePromptTitle: 'Choose units to deal 1 damage to',
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: WildcardRelativePlayer.Any,
                numCardsFunc: (context) => Math.min(2, context.game.getArenaUnits().length),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}