import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class EmergencyPowers extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6782724617',
            internalName: 'emergency-powers',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a unit and pay any number of resources. Give an Experience token to that unit for each resource paid.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
            },
            then: (thenContext) => ({
                title: 'Pay any number of resources. Give an Experience token to that unit for each resource paid.',
                thenCondition: (context) =>
                    context.player.readyResourceCount > 0 && context.game.hasSomeArenaUnit(),
                targetResolver: {
                    mode: TargetMode.DropdownList,
                    options: (context) => Array.from({ length: context.player.readyResourceCount + 1 }, (_x, i) => `${i}`),
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.payResourcesWithoutAdjustment((context) => ({
                            amount: parseInt(context.select),
                            target: context.player
                        })),
                        AbilityHelper.immediateEffects.giveExperience((context) => ({
                            amount: parseInt(context.select),
                            target: thenContext.target
                        }))
                    ]),
                },
            })
        });
    }
}