import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class AdmiralMottiChainOfCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0007562874',
            internalName: 'admiral-motti#chain-of-command',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Friendly leader units get +2/+2',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.LeaderUnit,
            ongoingEffect: [
                abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
            ]
        });
    }
}