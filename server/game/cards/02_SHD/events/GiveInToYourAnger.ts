import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Duration, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class GiveInToYourAnger extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3012322434',
            internalName: 'give-in-to-your-anger',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 1 damage to an enemy unit. Its controller’s next action this phase must be an attack action with that unit, if able. It must attack a unit, if able.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.sequential((context) => ([
                    AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    AbilityHelper.immediateEffects.cardLastingEffect({
                        duration: Duration.Custom,
                        until: {
                            onPhaseEnded: () => true,
                            onActionTaken: (event) => event.player === context.player.opponent,
                        },
                        effect: AbilityHelper.ongoingEffects.mustAttack({
                            targetUnitIfAble: true,
                        }),
                    }),
                ])),
            },
        });
    }
}
