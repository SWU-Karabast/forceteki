import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class Fulcrum extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: 'fulcrum-id',
            internalName: 'fulcrum',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit gains the Rebel trait',
            ongoingEffect: abilityHelper.ongoingEffects.gainTrait(Trait.Rebel)
        });

        registrar.addGainConstantAbilityTargetingAttached({
            title: 'Each other friendly Rebel unit gets +2/+2',
            matchTarget: (card, context) => card !== context.source && card.controller === context.player && card.hasSomeTrait(Trait.Rebel),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
        });
    }
}
