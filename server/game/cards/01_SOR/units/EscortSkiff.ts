import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';

export default class EscortSkiff extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2027289177',
            internalName: 'escort-skiff'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'Gain Ambush while you control another Command unit',
            condition: (context) => context.player.isAspectInPlay(Aspect.Command, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
        });
    }
}
