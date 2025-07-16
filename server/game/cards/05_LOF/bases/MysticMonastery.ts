import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import * as ChatHelpers from '../../../core/chat/ChatHelpers';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class MysticMonastery extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '9434212852',
            internalName: 'mystic-monastery',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const limit = AbilityHelper.limit.perPlayerPerGame(3);

        registrar.addActionAbility({
            title: 'The Force is with you',
            limit: limit,
            effect: 'gain the Force ({1} left)',
            effectArgs(context) {
                const currentUses = limit.currentForPlayer(context.player);
                const usesLeft = limit.max - currentUses;
                return [ChatHelpers.pluralize(usesLeft, '1 use', 'uses')];
            },
            immediateEffect: AbilityHelper.immediateEffects.theForceIsWithYou()
        });
    }
}
