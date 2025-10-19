import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class FerrixUprising extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8492928317',
            internalName: 'ferrix-uprising'
        };
    }

    private getDamageFromContext(context: AbilityContext): number {
        const target = context.targets.target;
        if (!target) {
            return 0;
        }
        
        // Determine which arena the target is in and count units there
        const targetZone = (target as any).zoneName;
        const arenaUnits = context.player.getArenaUnits().filter(
            (card) => (card as any).zoneName === targetZone
        );
        
        return arenaUnits.length * 2;
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal damage to a unit equal to twice the number of units you control in its arena.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({
                    amount: this.getDamageFromContext(context)
                }))
            }
        });
    }
}