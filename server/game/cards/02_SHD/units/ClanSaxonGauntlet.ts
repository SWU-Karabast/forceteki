import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ClanSaxonGauntlet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8228196561',
            internalName: 'clan-saxon-gauntlet'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give an experience token to a unit',
            when: {
                onAttackDeclared: (event, context) => event.attack.target === context.source,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
