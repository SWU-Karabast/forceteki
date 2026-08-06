import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MosEspaWatermonger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7582205705',
            internalName: 'mos-espa-watermonger',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Draw a card',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.draw(),
            ifYouDo: {
                title: 'Discard a card',
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({ target: context.player, amount: 1 })),
            }
        });
    }
}