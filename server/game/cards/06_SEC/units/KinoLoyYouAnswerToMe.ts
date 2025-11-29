import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KinoLoyYouAnswerToMe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9354864848',
            internalName: 'kino-loy#you-answer-to-me',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Gets +1/+0 for each other exhausted friendly unit',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((target, context) => ({
                power: context.player.getArenaUnits({
                    condition: (card) => card.isUnit() && card.exhausted,
                    otherThan: context.source
                }).length,
                hp: 0,
            }))
        });
    }
}
