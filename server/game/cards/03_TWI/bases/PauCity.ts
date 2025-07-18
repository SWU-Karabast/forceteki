import { BaseCard } from '../../../core/card/BaseCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CardType, RelativePlayer } from '../../../core/Constants';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class PauCity extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '6594935791',
            internalName: 'pau-city',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each leader unit you control gets +0/+1',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.LeaderUnit,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}
