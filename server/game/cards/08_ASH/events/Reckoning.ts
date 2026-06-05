import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Reckoning extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0632920954',
            internalName: 'reckoning',
        };
    }

    private getDamageAmount(context: AbilityContext): number {
        return context.player.getArenaUnits().reduce((total, unit) => total + unit.damage, 0);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal damage to a unit equal to total damage on all your units',
            targetResolver: {
                activePromptTitle: (context) => `Choose a unit to deal ${this.getDamageAmount(context)} damage to`,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (_card, context) => this.getDamageAmount(context) > 0,
                immediateEffect: AbilityHelper.immediateEffects.damage(
                    (context) => ({ amount: this.getDamageAmount(context) })
                ),
            }
        });
    }
}
