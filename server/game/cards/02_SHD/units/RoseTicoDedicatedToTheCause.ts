import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class RoseTicoDedicatedToTheCause extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5080989992',
            internalName: 'rose-tico#dedicated-to-the-cause'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat a Shield token on a friendly unit. If you do, give 2 Experience tokens to that unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.isShield() && card.parentCard.controller === context.player,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give 2 Experience tokens to that unit',
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    target: ifYouDoContext.events[0].lastKnownInformation.parentCard,
                    amount: 2
                })
            })
        });
    }
}
