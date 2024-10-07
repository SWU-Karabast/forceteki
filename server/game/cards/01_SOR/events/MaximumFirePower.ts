import { EventCard } from '../../../core/card/EventCard';
import {
    RelativePlayer,
    Trait,
    WildcardCardType,
    WildcardLocation
} from '../../../core/Constants';
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
                    dependsOn: 'firstImperial',
                    locationFilter: WildcardLocation.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (_, context) => (context.player.getUnitsInPlay(WildcardLocation.AnyArena, (card) =>
                        card.hasSomeTrait(Trait.Imperial)).length > 0),
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) =>
                        ({ amount: context.targets.firstImperial.getPower() })),
                }
            },
            then: (context) => ({
                title: 'Then, another friendly Imperial unit deals damage equal to its power to the same unit.',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    locationFilter: WildcardLocation.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial) && card !== context.targets.firstImperial,
                    immediateEffect: AbilityHelper.immediateEffects.conditional((context2) => ({
                        condition: EnumHelpers.isArena(context.targets.selectedTarget.location),
                        onTrue: AbilityHelper.immediateEffects.damage({ target: context.targets.selectedTarget, amount: context2.target.getPower() }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    }))
                }
            })

        });
    }
}

MaximumFirePower.implemented = true;
