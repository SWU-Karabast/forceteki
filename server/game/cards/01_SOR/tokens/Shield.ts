import AbilityHelper from '../../../AbilityHelper';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import type Player from '../../../core/Player';

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
        super(owner, cardData);
    }

    public override isShield(): this is Shield {
        return true;
    }

    public override setupCardAbilities() {
        this.addReplacementEffectAbility({
            title: 'Defeat shield to prevent attached unit from taking damage',
            when: {
                onDamageDealt: (event, context) => event.card === context.source.parentCard && !!event.isIndirect
            },
            replaceWith: {
                target: this,
                replacementImmediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            effect: 'shield prevents {1} from taking damage',
            effectArgs: (context) => [context.source.parentCard],
        });
    }
}
