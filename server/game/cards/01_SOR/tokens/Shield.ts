import type { ICardDataJson } from '../../../../utils/cardData/CardDataInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TokenUpgradeCard } from '../../../core/card/TokenCards';
import { DamagePreventionType } from '../../../core/Constants';
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
        registrar.addDamagePreventionAbility({
            title: 'Defeat Shield to prevent attached unit from taking damage',
            preventionType: DamagePreventionType.Replace,
            targetCondition(card, context) {
                if (context.source.isUpgrade() && card === context.source.parentCard) {
                    return true;
                }
                return false;
            },
            replaceWithSystem: AbilityHelper.immediateEffects.defeat({
                target: this
            }),
        });
    }
}
