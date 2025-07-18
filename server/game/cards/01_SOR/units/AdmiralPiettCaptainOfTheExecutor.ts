import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer } from '../../../core/Constants';

export default class AdmiralPiettCaptainOfTheExecutor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4566580942',
            internalName: 'admiral-piett#captain-of-the-executor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly non-leader unit that costs 6 or more gains Ambush',
            targetController: RelativePlayer.Self,
            matchTarget: (card) => card.isNonLeaderUnit() && card.cost >= 6,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
