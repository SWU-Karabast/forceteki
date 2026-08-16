import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class SinisterWarMemorial extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'sinister-war-memorial-id',
            internalName: 'sinister-war-memorial',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Heal 1 damage from this base',
            when: {
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.lastKnownInformation.controller === context.player,
            },
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ target: context.source, amount: 1 })),
        });
    }
}
