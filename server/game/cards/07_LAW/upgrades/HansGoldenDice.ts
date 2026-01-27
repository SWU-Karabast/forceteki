import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { EventName } from '../../../core/Constants';

export default class HansGoldenDice extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6269526870',
            internalName: 'hans-golden-dice',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Discard a card from your deck',
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: {
                title: 'Create a Credit token',
                ifYouDoCondition: (context) => this.discardedCardIsOddCost(context),
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken()
            }
        });
    }

    private discardedCardIsOddCost(context): boolean {
        const discardedCards = context.events
            .filter((e) => e.name === EventName.OnCardDiscarded)
            .map((e) => e.card);

        if (discardedCards.length !== 1) {
            return false;
        }

        return discardedCards[0].cost % 2 === 1;
    }
}