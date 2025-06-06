import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class T6Shuttle1974StayClose extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2134957922',
            internalName: 't6-shuttle-1974#stay-close'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give an experience token to this unit',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
        });
    }
}
