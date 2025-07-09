import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class JangoFettRenownedBountyHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6769342445',
            internalName: 'jango-fett#renowned-bounty-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While attacking a unit with Bounty, this unit gets +3/+0 and gains Overwhelm.',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.targetIsUnit((card) => card.hasSomeKeyword(KeywordName.Bounty)),
            ongoingEffect: [AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm), AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })],
        });

        registrar.addTriggeredAbility({
            title: 'Draw a card',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.draw(),
        });
    }
}
