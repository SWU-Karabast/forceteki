import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class QiraMasterOfTerasKasi extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'qira#master-of-teras-kasi-id',
            internalName: 'qira#master-of-teras-kasi',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets -1/-0 for each card in your hand.',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((_, context) => {
                const powerDiff = -1 * context.player.hand.length;
                return { power: powerDiff, hp: 0 };
            })
        });

        registrar.addWhenPlayedAbility({
            title: 'Discard a card from your hand. If you do, deal 3 damage to a unit',
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player,
                optional: true,
            })),
            ifYouDo: {
                title: 'Deal 3 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });
    }
}