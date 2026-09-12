import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class FettsFirespraySettlingTheScore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'fetts-firespray#settling-the-score-id',
            internalName: 'fetts-firespray#settling-the-score',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Friendly units can attack bases while using ${TextHelper.Ambush}`,
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            ongoingEffect: AbilityHelper.ongoingEffects.canAttackBaseWhileUsingAmbush()
        });
    }
}
