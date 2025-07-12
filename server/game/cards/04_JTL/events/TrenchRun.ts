import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityType, EventName, Trait } from '../../../core/Constants';
import * as Contract from '../../../core/utils/Contract';

export default class TrenchRun extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2995807621',
            internalName: 'trench-run',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a Fighter unit. For this attack, it gets +4/+0 and gains: "On Attack: Discard 2 cards from the defending player\'s deck. Deal unpreventable damage equal to the difference in the discarded cards\' costs to this unit."',
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Fighter),
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: [
                        { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 }) },
                        {
                            effect: AbilityHelper.ongoingEffects.gainAbility({
                                title: 'Discard 2 cards from the defending player\'s deck. Deal unpreventable damage equal to the difference in the discarded cards\' costs to this unit.',
                                type: AbilityType.Triggered,
                                when: { onAttack: true },
                                immediateEffect: AbilityHelper.immediateEffects.sequential([
                                    AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                                        target: context.player.opponent,
                                        amount: 2
                                    })),
                                    AbilityHelper.immediateEffects.damage((context) => {
                                        const discardEvents = context.events.filter((event) => event.name === EventName.OnCardDiscarded);
                                        if (discardEvents.length < 2) {
                                            return { target: null, amount: 0 };
                                        }

                                        Contract.assertTrue(discardEvents.length === 2, `Found ${discardEvents.length} discard events, expected 2`);

                                        const [card1, card2] = discardEvents.map((event) => event.card);
                                        Contract.assertTrue((card1 as Card).hasCost() && (card2 as Card).hasCost());

                                        const costDiff = Math.abs(card1.cost - card2.cost);

                                        return { target: context.source, amount: costDiff, isUnpreventable: true };
                                    })
                                ])
                            })
                        }
                    ]
                })
            }
        });
    }
}

