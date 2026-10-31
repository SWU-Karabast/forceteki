import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SeparatistHarbinger extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5001649174',
            internalName: 'separatist-harbinger',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'An opponent chooses a unit or base they control. You may deal 2 damage to it',
            when: {
                whenPlayed: true,
                onAttack: true
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                choosingPlayer: RelativePlayer.Opponent,
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
            },
            then: (context) => ({
                title: `Deal 2 damage to ${context.target.title}`,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: context.target,
                    amount: 2,
                }),
            })
        });
    }
}