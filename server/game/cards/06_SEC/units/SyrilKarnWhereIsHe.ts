import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, NamedAction, TargetMode, WildcardCardType } from '../../../core/Constants';
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
            title: `Disclose ${EnumHelpers.aspectString(aspects)} to choose a unit. Deal 2 damage to that unit unless its controller discards a card from their hand`,
            immediateEffect: abilityHelper.immediateEffects.disclose({ aspects }),
            ifYouDo: {
                title: 'Choose a unit to deal 2 damage unless its controller discard a card',
                targetResolvers: {
                    targetUnit: {
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: abilityHelper.immediateEffects.conditional({
                            condition: (context) => context.targets.targetUnit.controller.hand.length === 0,
                            onTrue: abilityHelper.immediateEffects.damage({ amount: 2 }),
                            onFalse: abilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                        })
                    },
                    controllerChoice: {
                        mode: TargetMode.Select,
                        dependsOn: 'targetUnit',
                        condition: (context) => context.targets.targetUnit.controller.hand.length > 0,
                        choosingPlayer: (context) => EnumHelpers.asRelativePlayer(context.player, context.targets.targetUnit.controller),
                        activePromptTitle: (context) => `${this.buildCardName(context.targets.targetUnit)} takes 2 [Damage] or [Discard] a card`,
                        choices: (context) => ({
                            [NamedAction.Damage]: abilityHelper.immediateEffects.damage({
                                target: context.targets.targetUnit,
                                amount: 2
                            }),
                            [NamedAction.Discard]: abilityHelper.immediateEffects.discardCardsFromOwnHand({
                                target: context.targets.targetUnit.controller,
                                amount: 1
                            })
                        }),
                        highlightCards: (context) => context.targets.targetUnit,
                    }
                }
            }
        });
    }

    private buildCardName(card: Card): string {
        return `${card.title}${card.subtitle ? ', ' + card.subtitle : ''}`;
    }
}
