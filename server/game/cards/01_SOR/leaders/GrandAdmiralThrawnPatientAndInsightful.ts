import AbilityHelper from '../../../AbilityHelper';
import type { IBasicAbilityRegistrar, ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { ILeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PhaseName, TargetMode } from '../../../core/Constants';

export default class GrandAdmiralThrawnPatientAndInsightful extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1951911851',
            internalName: 'grand-admiral-thrawn#patient-and-insightful',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        this.addLookTrigger(registrar);

        registrar.addActionAbility({
            title: 'Reveal the top card of any player\'s deck',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                mode: TargetMode.Select,
                showUnresolvable: true,
                choices: {
                    ['Reveal the top card of your deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.getTopCardOfDeck(),
                    })),
                    ['Reveal the top card of the opponent\'s deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.opponent.getTopCardOfDeck(),
                    }))
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust a unit that costs the same as or less than the revealed card',
                targetResolver: {
                    cardCondition: (card) => card.isUnit() && card.cost <= ifYouDoContext.events[0].card[0].cost,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        this.addLookTrigger(registrar);

        registrar.addOnAttackAbility({
            title: 'Reveal the top card of any player\'s deck',
            optional: true,
            targetResolver: {
                mode: TargetMode.Select,
                showUnresolvable: true,
                choices: {
                    ['Reveal the top card of your deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.getTopCardOfDeck(),
                    })),
                    ['Reveal the top card of the opponent\'s deck']: AbilityHelper.immediateEffects.reveal((context) => ({
                        target: context.player.opponent.getTopCardOfDeck(),
                    }))
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust a unit that costs the same as or less than the revealed card',
                targetResolver: {
                    cardCondition: (card) => card.isUnit() && card.cost <= ifYouDoContext.events[0].card[0].cost,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            })
        });
    }

    private addLookTrigger(registrar: IBasicAbilityRegistrar<ILeaderUnitCard>) {
        registrar.addTriggeredAbility({
            title: 'Look at the top card of each player\'s deck',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Action
            },
            immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => {
                const ownTopCard = context.player.getTopCardOfDeck();
                const opponentTopCard = context.player.opponent.getTopCardOfDeck();

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
