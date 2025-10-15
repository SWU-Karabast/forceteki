import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class NemiksManifesto extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'nemiks-manifesto-id',
            internalName: 'nemiks-manifesto',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addConstantAbilityTargetingAttached({
            title: 'Give the Rebel trait to the attached card',
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Rebel),
        });
        registrar.addGainWhenDefeatedAbilityTargetingAttached({
            title: 'Deal 1 damage to each enemy base for each other friendly rebel unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: context.player.getArenaUnits({ condition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Rebel) }).length,
                target: context.player.opponent.base
            })),
        });
    }
}