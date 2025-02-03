import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import type Player from '../../../core/Player';

export default class LegalAuthority extends UpgradeCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '8877249477',
            internalName: 'legal-authority',
        };
    }

    public override canAttach(targetCard: Card, controller: Player): boolean {
        return targetCard.isUnit() && targetCard.controller === controller;
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Attached unit captures an enemy non-leader unit with less power than it',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.isUnit() && card.getPower() <= context.source.parentCard.getPower(),
                immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                    captor: context.source.parentCard
                }))
            }
        });
    }
}
