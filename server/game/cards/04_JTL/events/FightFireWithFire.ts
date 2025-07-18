import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class FightFireWithFire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3885807284',
            internalName: 'fight-fire-with-fire',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a friendly unit and an enemy unit in the same arena. If you do, deal 3 damage to each of them.',
            targetResolvers: {
                firstUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                },
                secondUnit: {
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => card.zone === context.targets.firstUnit.zone && card !== context.targets.firstUnit,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.damage((context) => ({
                            amount: 3,
                            target: context.targets.firstUnit,
                        })),
                        AbilityHelper.immediateEffects.damage((context) => ({
                            amount: 3,
                            target: context.targets.secondUnit,
                        })),
                    ]),
                }
            },
        });
    }
}
