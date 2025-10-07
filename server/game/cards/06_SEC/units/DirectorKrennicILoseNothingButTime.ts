import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DirectorKrennicILoseNothingButTime extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'director-krennic#i-lose-nothing-but-me-id',
            internalName: 'director-krennic#i-lose-nothing-but-me',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Discard a card from your deck. If it\'s a unit, you may return it to your hand',
            when: {
                onAttackDeclared: (event, context) => {
                    return event.attack.getAllTargets().some((x) => x === context.source);
                },
            },
            immediateEffect: abilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: (context) => ({
                title: 'Return the discard card to your hand',
                ifYouDoCondition: () => context.events[0].card.isUnit(),
                optional: true,
                immediateEffect: abilityHelper.immediateEffects.returnToHand({
                    target: context.events[0].card
                })
            })
        });
    }
}
