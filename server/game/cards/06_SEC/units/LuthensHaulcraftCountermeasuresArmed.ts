import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class LuthensHaulcraftCountermeasuresArmed extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'luthens-haulcraft#countermeasures-armed-id',
            internalName: 'luthens-haulcraft#countermeasures-armed',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression, Aspect.Aggression, Aspect.Heroism];
        registrar.addWhenDefeatedAbility({
            title: `Disclose ${Helpers.aspectString(aspects)} to make your opponent discards 2 cards from their hand`,
            immediateEffect: AbilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Your opponent discards 2 cards from their hand',
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    amount: 2,
                    target: context.player.opponent
                })),
            }
        });
    }
}
