import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import type Player from '../../../core/Player';

export default class TheMandaloriansRifle extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0754286363',
            internalName: 'the-mandalorians-rifle',
        };
    }

    public override canAttach(targetCard: Card, controller: Player): boolean {
        return targetCard.isUnit() && !targetCard.hasSomeTrait(Trait.Vehicle) && targetCard.controller === controller;
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If attached unit is The Mandalorian, he captures an exhausted enemy non-leader unit',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.parentCard.title === 'The Mandalorian',
                    onTrue: AbilityHelper.immediateEffects.capture((context) => ({
                        captor: context.source.parentCard
                    }))
                })
            }
        });
    }
}
