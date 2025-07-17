import type { ICardDataJson } from '../../../../utils/cardData/CardDataInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import type { Player } from '../../../core/Player';

export default class Shield extends TokenUpgradeCard {
    /** Indicates that the shield be prioritized for removal if multiple shields are present (currently only for Jetpack) */
    public readonly highPriorityRemoval: boolean;

    protected override getImplementationId() {
        return {
            id: '8752877738',
            internalName: 'shield',
        };
    }

    public constructor(
        owner: Player,
        cardData: ICardDataJson,
        additionalProperties?: any
    ) {
        super(owner, cardData);

        this.highPriorityRemoval = !!additionalProperties?.highPriorityRemoval;
    }

    public override isShield(): this is Shield {
        return true;
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addReplacementEffectAbility({
            title: 'Defeat shield to prevent attached unit from taking damage',
            when: {
                onDamageDealt: (event, context) => event.card === context.source.parentCard && !event.isIndirect,
            },
            replaceWith: {
                target: this,
                replacementImmediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            effect: 'prevent {1} from taking damage',
            effectArgs: (context) => [context.source.parentCard],
        });
    }
}
