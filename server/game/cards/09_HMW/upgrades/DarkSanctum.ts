import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PhaseName } from '../../../core/Constants';

export default class DarkSanctum extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'dark-sanctum-id',
            internalName: 'dark-sanctum',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Draw a card and deal 2 damage to this base',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            gainCondition: (context) => context.source.parentCard?.isBase(),
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
                abilityHelper.immediateEffects.damage((context) => ({ target: context.source, amount: 2 }))
            ])
        });
    }
}
