import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import { Card } from '../../../core/card/Card';

export default class MandalorianArmor extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3514010297',
            internalName: 'mandalorian-armor'
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addWhenPlayedAbility({
            title: 'If attached unit is a Mandalorian, give a Shield token to it.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({ target: context.source.parentCard,
                condition: context.source.parentCard?.hasSomeTrait(Trait.Mandalorian),
                onTrue: AbilityHelper.immediateEffects.giveShield(),
                onFalse: AbilityHelper.immediateEffects.noAction() }),
            )
        });
    }
}

MandalorianArmor.implemented = true;