import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class FinnThisIsARescue extends LeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9596662994',
            internalName: 'finn#this-is-a-rescue',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.controller === context.player,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token to that unit',
                immediateEffect: AbilityHelper.immediateEffects.giveShield({
                    target: ifYouDoContext.events[0].lastKnownInformation.parentCard
                }),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Defeat a friendly upgrade on a unit. If you do, give a Shield token to that unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.controller === context.player,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Shield token to that unit',
                immediateEffect: AbilityHelper.immediateEffects.giveShield({
                    target: ifYouDoContext.events[0].lastKnownInformation.parentCard
                }),
            })
        });
    }
}
