import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class DarthSidiousThereIsNoMercy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-sidious#there-is-no-mercy-id',
            internalName: 'darth-sidious#there-is-no-mercy',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust this leader to deal 1 damage to a different unit or base',
            optional: true,
            when: {
                onDamageDealt: (event, context) => this.dealtFourOrMoreDamage(event, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal 1 damage to a different unit or base',
                targetResolver: {
                    cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                    cardCondition: (card) => card !== ifYouDoContext.event.card,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a different unit or base',
            optional: true,
            when: {
                onDamageDealt: (event, context) => this.dealtFourOrMoreDamage(event, context)
            },
            targetResolver: {
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                cardCondition: (card, context) => card !== context.event.card,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    private dealtFourOrMoreDamage(event, context): boolean {
        if (!(event.card.isUnit() || event.card.isBase())) {
            return false;
        }

        const amount = event.amount ?? event.sourceEventForExcessDamage?.availableExcessDamage;

        if (amount == null || amount < 4) {
            return false;
        }

        switch (event.damageSource.type) {
            case DamageSourceType.Attack:
                // For attacks, it counts if a unit we control dealt the damage.
                return event.damageSource.damageDealtBy.some((unit) => unit.controller === context.player);
            case DamageSourceType.Ability:
                // Ability/event/indirect damage counts if you control the source.
                return event.damageSource.player === context.player;
            default:
                return false;
        }
    }
}
