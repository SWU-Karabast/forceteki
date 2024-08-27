import AbilityHelper from '../../AbilityHelper';
import { TokenUpgradeCard } from '../../core/card/TokenCards';
import Player from '../../core/Player';
import Contract from '../../core/utils/Contract';

export default class Shield extends TokenUpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8752877738',
            internalName: 'shield',
        };
    }

    public constructor(owner: Player, cardData: any) {
        // even though shield is printed as 0/0 its cardData has nulls for these, which requires special handling
        Contract.assertTrue(cardData.power === null);
        Contract.assertTrue(cardData.hp === null);

        cardData.power = 0;
        cardData.hp = 0;

        super(owner, cardData);
    }

    public override setupCardAbilities() {
        this.addReplacementEffectAbility({
            title: 'Defeat shield to prevent attached unit from taking damage',
            when: {
                onDamageDealt: (event) => event.card === this.parentCard
            },
            replaceWith: {
                target: this,
                replacementImmediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            effect: 'shield prevents {1} from taking damage',
            effectArgs: () => [this.parentCard],
        });
    }
}

Shield.implemented = true;
