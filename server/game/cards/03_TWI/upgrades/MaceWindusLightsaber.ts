import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import AbilityHelper from '../../../AbilityHelper';

export default class MaceWindusLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6410481716',
            internalName: 'mace-windus-lightsaber',
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addWhenPlayedAbility({
            title: 'Draw 2 cards',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                target: context.source.parentCard,
                condition: context.source.parentCard?.title === 'Mace Windu',
                onTrue: AbilityHelper.immediateEffects.draw({
                    target: context.player,
                    amount: 2
                }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            }))
        });
    }
}

