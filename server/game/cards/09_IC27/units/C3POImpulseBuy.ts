import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class C3POImpulseBuy extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'c3po#impulse-buy-id',
            internalName: 'c3po#impulse-buy',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Give an Experience token to another unit. Then, if it has 6 or more power, draw a card',
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            },
            then: (thenContext) => ({
                title: 'If that unit has 6 or more power, draw a card',
                thenCondition: (thenContext) => thenContext?.target.getPower() >= 6,
                immediateEffect: abilityHelper.immediateEffects.draw()
            }),
        });
    }
}