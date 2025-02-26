import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class GeneralDodonnaMassassiGroupCommander extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9799982630',
            internalName: 'general-dodonna#massassi-group-commander',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Other friendly Rebel units get +1/+1',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Rebel),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
