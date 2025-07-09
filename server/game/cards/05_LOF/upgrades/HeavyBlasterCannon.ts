import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class HeavyBlasterCannon extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1759165041',
            internalName: 'heavy-blaster-cannon',
        };
    }

    protected override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'You may deal 1 damage to a ground unit. Then, deal 1 damage to the same unit. Then, deal 1 damage to the same unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.damage({ amount: 1 })
                ])
            }
        });
    }
}