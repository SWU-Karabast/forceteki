import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class CollateralDamage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3101172453',
            internalName: 'collateral-damage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a unit. Then, deal 2 damage to a base or another unit in the same arena',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    amount: 2
                })
            },
            then: (thenContext) => ({
                title: 'Deal 2 damage to a base or another unit in the same arena',
                targetResolver: {
                    activePromptTitle: () => {
                        const lki = thenContext.events[0]?.lastKnownInformation;
                        const arena = lki ? lki.arena : thenContext.target?.zoneName;
                        if (arena) {
                            return `Deal 2 damage to a base or a ${arena === ZoneName.GroundArena ? 'ground' : 'space'} unit`;
                        }
                        return 'Deal 2 damage to a base';
                    },
                    cardCondition: (card) => {
                        const lki = thenContext.events[0]?.lastKnownInformation;
                        const arena = lki ? lki.arena : thenContext.target?.zoneName;
                        const lkiCard = lki ? lki.card : thenContext.target;

                        return card !== lkiCard && (card.isBase() || (card.isUnit() && card.zoneName === arena));
                    },
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: 2
                    })
                }
            })
        });
    }
}
