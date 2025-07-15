import AbilityHelper from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Colossus extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '1029978899',
            internalName: 'colossus',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Draw 1 less card in starting hands',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStartingHandSize({
                amount: -1
            })
        });
    }
}

