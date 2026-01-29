import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, ZoneName } from '../../../core/Constants';

export default class BT1Blastomech extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bt1#blastomech-id',
            internalName: 'bt1#blastomech'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Discard a card from your deck. If it\'s Aggression, you may deal 1 damage to a ground unit.',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: (context) => ({
                title: 'Deal 1 damage to a ground unit',
                optional: true,
                ifYouDoCondition: () => context.events[0].card.hasSomeAspect(Aspect.Aggression),
                targetResolver: {
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            })
        });
    }
}