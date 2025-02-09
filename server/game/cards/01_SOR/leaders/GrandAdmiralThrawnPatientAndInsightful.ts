import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, TargetMode, WildcardCardType } from '../../../core/Constants';
import type { UnitCard } from '../../../core/card/CardTypes';

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
                    ['Reveal the top card of your deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.getTopCardOfDeck(),
                    })),
                    ['Reveal the top card of the opponent\'s deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.opponent.getTopCardOfDeck(),
                    }))
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust a unit that costs the same as or less than the revealed card',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card: UnitCard) => card.cost <= ifYouDoContext.events[0].card[0].cost,
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
                    ['Reveal the top card of your deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.getTopCardOfDeck(),
                    })),
                    ['Reveal the top card of the opponent\'s deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.source.controller.opponent.getTopCardOfDeck(),
                    }))
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust a unit that costs the same as or less than the revealed card',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card: UnitCard) => card.cost <= ifYouDoContext.events[0].card[0].cost,
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
            immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => {
                const ownTopCard = context.source.controller.getTopCardOfDeck();
                const opponentTopCard = context.source.controller.opponent.getTopCardOfDeck();

                const target = [];
                const displayTextByCardUuid = new Map<string, string>();

                this.checkAddTopCard(ownTopCard, 'Yourself', target, displayTextByCardUuid);
                this.checkAddTopCard(opponentTopCard, 'Opponent', target, displayTextByCardUuid);

                return { target, displayTextByCardUuid, useDisplayPrompt: true };
            })
        });
    }

    private checkAddTopCard(card, title, targetsList, displayTextByCardUuid) {
        if (card != null) {
            targetsList.push(card);
            displayTextByCardUuid.set(card.uuid, title);
        }
    }
}
