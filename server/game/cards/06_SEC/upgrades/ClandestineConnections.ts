import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType } from '../../../core/Constants';

export default class ClandestineConnections extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5776543759',
            internalName: 'clandestine-connections',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Pay 2 resources to deal 2 damage to a base',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResourceCost((context) => ({
                target: context.player,
                amount: 2
            })),
            ifYouDo: {
                title: 'Deal 2 damage to a base',
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            }
        });
    }
}