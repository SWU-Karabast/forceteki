import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class AlwaysTwo extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0463147975',
            internalName: 'always-two',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose 2 friendly unique Sith units. Give 2 Shield tokens and 2 Experience tokens to each chosen unit.',
            targetResolvers: {
                firstUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card) =>
                        card.unique &&
                        card.hasSomeTrait(Trait.Sith),
                },
                secondUnit: {
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    cardCondition: (card, context) =>
                        card.unique &&
                        card.hasSomeTrait(Trait.Sith) &&
                        card !== context.targets.firstUnit,
                    immediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.simultaneous([
                            AbilityHelper.immediateEffects.giveShield((context) => ({
                                target: [context.targets.firstUnit, context.targets.secondUnit],
                                amount: 2
                            })),
                            AbilityHelper.immediateEffects.giveExperience((context) => ({
                                target: [context.targets.firstUnit, context.targets.secondUnit],
                                amount: 2
                            })),
                        ]),
                        AbilityHelper.immediateEffects.defeat((context) => ({
                            target: context.player.getArenaUnits({
                                condition: (card) => ![
                                    context.targets.firstUnit,
                                    context.targets.secondUnit
                                ].some((value) => value === card)
                            })
                        }))
                    ])
                }
            }
        });
    }
}