import {EventCard} from '../../../core/card/EventCard';
import {Location, RelativePlayer, Trait, WildcardCardType, WildcardLocation} from '../../../core/Constants';
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
            title: 'A friendly Imperial unit deals damage equal to its power to a unit.',
            targetResolvers: {
                firstImperial: {
                    controller: RelativePlayer.Self,
                    locationFilter: WildcardLocation.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                },
                selectedTarget: {
                    cardTypeFilter: WildcardCardType.Unit,
                    locationFilter: WildcardLocation.AnyArena,
                    dependsOn: 'firstImperial',
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => {
                        return { target: context.targets.selectedTarget, amount: context.targets.firstImperial.getPower() };
                    }),
                },
            },
            then: (context) => ({
                title: 'Then, another friendly Imperial unit deals damage equal to its power to the same unit.',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    locationFilter: WildcardLocation.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial) && card !== context.targets.firstImperial,
                    /*immediateEffect: AbilityHelper.immediateEffects.damage((context2) =>
                        ({ target: context.targets.selectedTarget, amount: context2.target.getPower() })),*/
                    immediateEffect: AbilityHelper.immediateEffects.conditional((context2) => ({
                        condition: context.targets.selectedTarget.location === Location.Discard,
                        onTrue: AbilityHelper.immediateEffects.damage({ target: context.targets.selectedTarget, amount: context2.target.getPower() }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    }))
                }
            }),
        });
    }
}

MaximumFirePower.implemented = true;
