import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName } from '../../../core/Constants';

export default class InfiltratorsSkill extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '0797226725',
            internalName: 'infiltrators-skill',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainKeywordTargetingAttached({
            keyword: KeywordName.Saboteur
        });
    }
}
