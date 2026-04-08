import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BackedByBlackSun extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'backed-by-black-sun-id',
            internalName: 'backed-by-black-sun',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Deal 1 damage to an enemy unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.damage({
                    amount: 1
                })
            },
            then: {
                title: 'Deal damage to a unit equal to the number of damaged enemy units',
                optional: true,
                targetResolver: {
                    activePromptTitle: (context) => `Deal ${context.player.opponent.getArenaUnits({ condition: (x) => x.canBeDamaged() && x.damage > 0 }).length} damage to a unit`,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                        amount: context.player.opponent.getArenaUnits({ condition: (x) => x.canBeDamaged() && x.damage > 0 }).length,
                    }))
                }
            }
        });
    }
}