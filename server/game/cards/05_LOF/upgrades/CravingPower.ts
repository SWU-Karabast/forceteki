import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class CravingPower extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3848295601',
            internalName: 'craving-power',
        };
    }

    public override canAttach(targetCard: Card, _context: AbilityContext, controller: Player): boolean {
        return targetCard.isUnit() && targetCard.controller === controller;
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Deal damage to an enemy unit equal to attached unit\'s power',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.parentCard?.getPower()
                })),
            }
        });
    }
}