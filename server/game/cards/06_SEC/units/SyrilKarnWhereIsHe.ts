import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class SyrilKarnWhereIsHe extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8108381803',
            internalName: 'syril-karn#where-is-he',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        const aspects = [Aspect.Aggression, Aspect.Aggression, Aspect.Villainy];
        registrar.addOnAttackAbility({
            title: `Disclose ${Helpers.aspectString(aspects)} to choose a unit. Deal 2 damage to that unit unless its controller discards a card from their hand`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Choose a unit to deal 2 damage unless its controller discard a card',
                targetResolvers: {
                    targetUnit: {
                        cardTypeFilter: WildcardCardType.Unit
                    },
                    controllerChoice: {
                        mode: TargetMode.Select,
                        dependsOn: 'targetUnit',
                        choosingPlayer: (context) => EnumHelpers.asRelativePlayer(context.player, context.targets.targetUnit.controller),
                        choices: (context) => ({
                            [`${context.targets.targetUnit.title} takes 2 damage`]: abilityHelper.immediateEffects.damage({
                                target: context.targets.targetUnit,
                                amount: 2
                            }),
                            ['Discard a card']: abilityHelper.immediateEffects.discardCardsFromOwnHand({
                                target: context.targets.targetUnit.controller,
                                amount: 1
                            })
                        })
                    }
                }
            }
        });
    }
}
