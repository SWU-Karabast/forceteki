import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RexNoOtherOption extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2792883006',
            internalName: 'rex#no-other-option',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: 'The next event you play this phase costs 1 resource less',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.readyEnemyUnit()
            ],
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                ongoingEffectDescription: 'discount the next event {0} play',
                ongoingEffectTargetDescription: 'they',
                effect: AbilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: CardType.Event,
                    limit: AbilityHelper.limit.perPhase(1),
                    amount: 1
                })
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Ready an exhausted enemy unit to discount the next event you play this phase',
            optional: true,
            targetResolver: {
                activePromptTitle: 'Ready an exhausted enemy unit',
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.exhausted,
                immediateEffect: AbilityHelper.immediateEffects.ready()
            },
            ifYouDo: {
                title: 'The next event you play this phase costs 2 resources less',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                    ongoingEffectDescription: 'discount the next event {0} play',
                    ongoingEffectTargetDescription: 'they',
                    effect: AbilityHelper.ongoingEffects.decreaseCost({
                        cardTypeFilter: CardType.Event,
                        limit: AbilityHelper.limit.perPhase(1),
                        amount: 2
                    })
                })
            }
        });
    }
}