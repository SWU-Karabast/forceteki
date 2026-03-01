import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class StaccatoLightningRepeater extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '9671644417',
            internalName: 'staccato-lightning-repeater',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to each of up to 3 different ground units',
            targetResolver: {
                mode: TargetMode.UpTo,
                canChooseNoCards: true,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
