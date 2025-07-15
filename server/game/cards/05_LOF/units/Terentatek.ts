import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class Terentatek extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8660042329',
            internalName: 'terentatek',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While an opponent controls a Force unit, this unit gains Ambush.',
            condition: (context) => context.player.opponent.hasSomeArenaUnit({ trait: Trait.Force }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
        });
    }
}
