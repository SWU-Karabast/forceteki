import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class YodaMyAllyIsTheForce extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5098263349',
            internalName: 'yoda#my-ally-is-the-force'
        };
    }

    private getDamageFromContext(context: AbilityContext): number {
        const unitsControlled = context.player.getArenaUnits().length;
        return unitsControlled * 2;
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // When Played: You may use the Force. If you do, heal 5 damage from a base.
        registrar.addWhenPlayedAbility({
            title: 'Use the Force to heal 5 damage from a base',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Heal 5 damage from a base',
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 5 })
                }
            }
        });

        registrar.addTriggeredAbility({
            title: 'When you use the Force',
            when: {
                onForceUsed: (event, context) => event.player === context.player
            },
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => `Choose a unit to deal ${this.getDamageFromContext(context)} damage to`,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: this.getDamageFromContext(context) })),
            }
        });
    }
}
