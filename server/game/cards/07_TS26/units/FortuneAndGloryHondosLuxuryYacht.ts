import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class FortuneAndGloryHondosLuxuryYacht extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'fortune-and-glory#hondos-luxury-yacht-id',
            internalName: 'fortune-and-glory#hondos-luxury-yacht',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'This unit captures a non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.capture((context) => ({
                    captor: context.source
                }))
            }
        });

        registrar.addBountyAbility({
            title: 'A friendly unit captures a non-leader unit',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardTypeFilter: WildcardCardType.NonUnit,
                    immediateEffect: abilityHelper.immediateEffects.capture((context) => ({
                        captor: context.targets.friendlyUnit
                    }))
                }
            }
        });
    }
}