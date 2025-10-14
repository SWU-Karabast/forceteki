import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class ExiledFromTheForce extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9803203270',
            internalName: 'exiled-from-the-force',
        };
    }

    public override setupCardAbilities(
        registrar: IUpgradeAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addGainKeywordTargetingAttached({ keyword: KeywordName.Grit });
        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit loses the Force trait and all abilities except Grit',
            ongoingEffect: [
                AbilityHelper.ongoingEffects.loseTrait(Trait.Force),
                AbilityHelper.ongoingEffects.loseAllAbilities({ excludedAbilities: [KeywordName.Grit] })
            ]
        });
    }
}