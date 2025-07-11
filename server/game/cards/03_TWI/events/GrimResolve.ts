import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName } from '../../../core/Constants';

export default class GrimResolve extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6669050232',
            internalName: 'grim-resolve',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Attack with a non-leader unit. It gains Grit for this attack',
            initiateAttack: {
                attackerCondition: (card) => card.isNonLeaderUnit(),
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit),
                }
            },
        });
    }
}
