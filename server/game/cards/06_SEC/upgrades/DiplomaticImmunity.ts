import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Aspect } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class DiplomaticImmunity extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'diplomatic-immunity-id',
            internalName: 'diplomatic-immunity',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Vigilance, Aspect.Vigilance, Aspect.Heroism, Aspect.Heroism];
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: `Disclose ${EnumHelpers.aspectString(aspects)}. If you do, the attacker gets -2/-0 for this attack`,
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give -2/-0 to the attacker for this attack',
                immediateEffect: AbilityHelper.immediateEffects.forThisAttackCardEffect({
                    target: ifYouDoContext.event.attack.attacker,
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 }),
                }),
            }),
        });
    }
}