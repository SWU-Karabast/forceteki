import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TextHelper } from '../../../core/utils/TextHelper';
import { WildcardCardType } from '../../../core/Constants';

export default class TheInvisibleHandConfederateMight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9343717289',
            internalName: 'the-invisible-hand#confederate-might',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `The next card you play this phase costs ${TextHelper.resource(9)} less`,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: abilityHelper.ongoingEffects.decreaseCost({
                    cardTypeFilter: WildcardCardType.Playable,
                    limit: abilityHelper.limit.perGame(1),
                    amount: 9
                })
            })
        });
    }
}
