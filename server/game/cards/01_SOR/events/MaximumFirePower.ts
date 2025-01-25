import { EventCard } from '../../../core/card/EventCard';
import {
    RelativePlayer,
    Trait,
    WildcardCardType,
    WildcardZoneName
} from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

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
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial),
                },
                damageTarget: {
                    dependsOn: 'firstImperial',
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (_, context) => (context.player.getUnitsInPlay(WildcardZoneName.AnyArena,
                        (card) => card.hasSomeTrait(Trait.Imperial)).length > 0),
                    immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: context.targets.firstImperial.getPower(),
                        source: context.targets.firstImperial,
                    })),
                }
            },
            then: (thenContext) => ({
                title: 'Another friendly Imperial unit deals damage equal to its power to the same unit.',
                targetResolver: {
                    controller: RelativePlayer.Self,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Imperial) && card !== thenContext.targets.firstImperial,
                    immediateEffect: AbilityHelper.immediateEffects.damage((damageContext) => ({
                        target: thenContext.targets.damageTarget,
                        amount: damageContext.target.getPower(),
                        source: damageContext.target,
                    })),
                }
            })
        });
    }
}
