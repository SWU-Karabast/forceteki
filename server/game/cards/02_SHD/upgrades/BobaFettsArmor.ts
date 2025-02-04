import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import AbilityHelper from '../../../AbilityHelper';

export default class BobaFettsArmor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5738033724',
            internalName: 'boba-fetts-armor'
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addReplacementEffectAbility({
            title: 'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
            when: {
                onDamageDealt: (event, context) => event.card === context.source.parentCard && context.source.parentCard.title === 'Boba Fett'
            },
            replaceWith: {
                replacementImmediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    target: context.source.parentCard,
                    amount: () => (Math.max(context.event.amount - 2, 0)),
                    source: context.event.damageSource.damageDealtBy,
                }))
            },
            effect: 'Boba Fett\s armor prevents 2 damage to {1}',
            effectArgs: (context) => [context.source.parentCard]
        });
    }
}