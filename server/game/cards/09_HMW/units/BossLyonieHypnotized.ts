import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import { Contract } from '../../../core/utils/Contract';

export default class BossLyonieHypnotized extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2305570577',
            internalName: 'boss-lyonie#hypnotized',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose a token upgrade attached to another unit. Give another one of those tokens to that unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) =>
                    card.isTokenUpgrade() && card.parentCard != null && card.parentCard !== context.source,
                immediateEffect: abilityHelper.immediateEffects.giveTokenUpgrade((context) => {
                    const token = context.target;
                    Contract.assertTrue(token.isTokenUpgrade());

                    return {
                        target: token.parentCard,
                        tokenType: token.tokenName,
                    };
                }),
            }
        });
    }
}
