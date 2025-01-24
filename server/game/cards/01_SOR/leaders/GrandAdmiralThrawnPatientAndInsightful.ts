import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, TargetMode, WildcardCardType } from '../../../core/Constants';
import { UnitCard } from '../../../core/card/CardTypes';

export default class GrandAdmiralThrawnPatientAndInsightful extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1951911851',
            internalName: 'grand-admiral-thrawn#patient-and-insightful',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addLookTrigger();

        this.addActionAbility({
            title: 'Reveal the top card of any player\'s deck',
            cost: [AbilityHelper.costs.abilityResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Reveal your top deck cards']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.getTopCardOfDeck(),
                    })),
                    ['Reveal opponent top deck cards']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.opponent.getTopCardOfDeck(),
                    })),
                }
            },
            then: (thenContext) => ({
                title: 'Exhaust a unit that costs the same as or less than the revealed card',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card: UnitCard) => card.cost <= thenContext.events[0].card[0].cost,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addLookTrigger();

        this.addOnAttackAbility({
            title: 'Reveal the top card of any player\'s deck',
            optional: true,
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Reveal your top deck cards']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.getTopCardOfDeck(),
                    })),
                    ['Reveal opponent top deck cards']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.opponent.getTopCardOfDeck(),
                    })),
                }
            },
            then: (thenContext) => ({
                title: 'Exhaust a unit that costs the same as or less than the revealed card',
                thenCondition: () => thenContext.events != null && thenContext.events[0].card != null && thenContext.events[0].card[0] != null,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card: UnitCard) => card.cost <= thenContext.events[0].card[0].cost,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            })
        });
    }

    private addLookTrigger() {
        this.addTriggeredAbility({
            title: 'Look at the top card of each player\'s deck',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Action
            },
            immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => ({
                target: [context.source.controller.getTopCardOfDeck(), context.source.controller.opponent.getTopCardOfDeck()]
            }))
        });
    }
}

GrandAdmiralThrawnPatientAndInsightful.implemented = true;
