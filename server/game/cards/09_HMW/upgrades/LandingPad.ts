import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { ZoneName } from '../../../core/Constants';

export default class LandingPad extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0920001727',
            internalName: 'landing-pad',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainConstantAbilityTargetingAttached({
            title: 'Friendly space units gain +1/+0',
            gainCondition: (context) => context.source.parentCard?.isBase(),
            matchTarget: (card, context) =>
                card.controller === context.player && card.isUnit() && card.zoneName === ZoneName.SpaceArena,
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
