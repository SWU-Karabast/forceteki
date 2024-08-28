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

    public constructor(
        owner: Player,
        cardData: any,

        /** Indicates that the shield be prioritized for removal if multiple shields are present (currently only for Jetpack) */
        public readonly highPriorityRemoval: boolean = false
    ) {
        // even though shield is printed as 0/0 its cardData has nulls for stats
        const cardDataWithStats = { ...cardData };
        cardDataWithStats.power = 0;
        cardDataWithStats.hp = 0;

        super(owner, cardDataWithStats);
    }

    public override isShield(): this is Shield {
        return true;
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
