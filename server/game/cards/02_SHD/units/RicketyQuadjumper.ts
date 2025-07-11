import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RicketyQuadjumper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7291903225',
            internalName: 'rickety-quadjumper'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Reveal a card. If it’s not a unit, give an Experience token to another unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.reveal((context) => ({
                target: context.player.getTopCardOfDeck(),
                useDisplayPrompt: true
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give an Experience token to another unit',
                ifYouDoCondition: () => !ifYouDoContext.events[0].cards[0].isUnit(),
                targetResolver: {
                    cardCondition: (card, context) => card !== context.source,
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
                }
            })
        });
    }
}
