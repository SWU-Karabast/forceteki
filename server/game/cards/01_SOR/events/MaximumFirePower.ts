import {EventCard} from '../../../core/card/EventCard';
import {RelativePlayer, Trait, WildcardCardType, WildcardLocation} from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class MaximumFirePower extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2758597010',
            internalName: 'maximum-firepower',
        };
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'A friendly Imperial unit deals damage equal to its power to a unit.  Then, another friendly Imperial unit deals damage equal to its power to the same unit.',
            targetResolvers: {
                firstImperial: {
                    controller: RelativePlayer.Self,
                    locationFilter: WildcardLocation.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                    immediateEffect: AbilityHelper.immediateEffects.noAction(),
                },
                targetCard: {
                    cardTypeFilter: WildcardCardType.Unit,
                    locationFilter: WildcardLocation.AnyArena,
                    dependsOn: 'firstImperial',
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => {
                        return { target: context.targets.targetCard, amount: context.targets.firstImperial.getPower() };
                    })
                },
                secondImperial: {
                    controller: RelativePlayer.Self,
                    dependsOn: 'targetCard',
                    locationFilter: WildcardLocation.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card.hasSomeTrait(Trait.Imperial) && context.target.firstImperial !== card,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => EnumHelpers.isArena(context.targets.targetCard.Location),
                        onTrue: AbilityHelper.immediateEffects.damage((context) => {
                            return { target: context.targets.targetCard, amount: context.targets.secondImperial.getPower() };
                        }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                }
            },
            effect: 'A {1} deals damage equal to its power to a {2}. Then, another {3} deals damage equal to its power to the same {2}.',
            effectArgs: (context) => [context.targets.firstImperial, context.targets.targetCard, context.targets.secondImperial],
        });
    }
}

MaximumFirePower.implemented = true;
