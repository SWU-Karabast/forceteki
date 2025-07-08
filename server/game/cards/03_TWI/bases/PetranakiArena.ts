import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';
import { CardType, RelativePlayer } from '../../../core/Constants';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class PetranakiArena extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '9652861741',
            internalName: 'petranaki-arena',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Each leader unit you control gets +1/+0',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.LeaderUnit,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });
    }
}
