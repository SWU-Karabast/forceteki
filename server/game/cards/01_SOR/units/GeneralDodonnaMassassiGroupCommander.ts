import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class GeneralDodonnaMassassiGroupCommander extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9799982630',
            internalName: 'general-dodonna#massassi-group-commander',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Other friendly Rebel units get +1/+1',
            targetController: RelativePlayer.Self,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Rebel),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
