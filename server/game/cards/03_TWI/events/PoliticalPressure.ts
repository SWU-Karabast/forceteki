import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer } from '../../../core/Constants';

export default class PoliticalPressure extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3357486161',
            internalName: 'political-pressure',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Discard a random card from your hand. If you do not, the opponent creates 2 Battle Droid Tokens',
            optional: true,
            playerChoosingOptional: RelativePlayer.Opponent,
            optionalButtonTextOverride: 'Opponent creates 2 Battle Droid Tokens',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                random: true,
                target: context.player.opponent
            })),
            ifYouDoNot: {
                title: 'Opponent creates 2 Battle Droid Tokens',
                immediateEffect: AbilityHelper.immediateEffects.createBattleDroid({ amount: 2 })
            }
        });
    }
}

