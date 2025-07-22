import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ClanSaxonGauntlet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8228196561',
            internalName: 'clan-saxon-gauntlet'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an experience token to a unit',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
