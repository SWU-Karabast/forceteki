import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class _000TranslationAndTorture extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '000#translation-and-torture-id',
            internalName: '000#translation-and-torture',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Put an Aggression card from your discard pile on the bottom of your deck. If you do, deal 1 damage to each enemy base',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeAspect(Aspect.Aggression),
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
            },
            ifYouDo: {
                title: 'Deal 1 damage to each enemy base',
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: 1,
                    target: context.player.opponent.base
                }))
            }
        });
    }
}