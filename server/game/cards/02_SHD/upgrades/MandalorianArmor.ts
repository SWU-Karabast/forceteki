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
            title: 'Give a Shield token.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({ condition: context.source.parentCard?.hasSomeTrait(Trait.Mandalorian),
                onTrue: AbilityHelper.immediateEffects.giveShield({ target: context.source.parentCard }),
                onFalse: AbilityHelper.immediateEffects.noAction() }),
            )
        });
    }
}

MandalorianArmor.implemented = true;