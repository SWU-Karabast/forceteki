import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class KnightsSaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6885149318',
            internalName: 'knights-saber',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Jedi) && !card.hasSomeTrait(Trait.Vehicle));
    }
}