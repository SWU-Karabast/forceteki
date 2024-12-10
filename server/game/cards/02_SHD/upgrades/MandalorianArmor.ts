import AbilityHelper from '../../../AbilityHelper';
import { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class MandalorianArmor extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '3514010297',
            internalName: 'mandalorian-armor',
        };
    }

    public override setupCardAbilities () {
        this.setAttachCondition((card: Card) => !card.hasSomeTrait(Trait.Vehicle));

        this.addWhenPlayedAbility({
            title: 'Shield attached unit when Mandalorian',
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Mandalorian),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}

MandalorianArmor.implemented = true;
