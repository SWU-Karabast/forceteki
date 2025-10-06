import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class DarthNihilusLordOfHunger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6372477584',
            internalName: 'darth-nihilus#lord-of-hunger',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 3 damage to the unit with the least remaining HP among other units. (If multiple units are tied, choose one.). If it\'s a non-Vehicle unit, give an Experience token to this unit.',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => {
                    if (!card.isUnit() || card === context.source) {
                        return false;
                    }
                    const otherUnits = context.game.getArenaUnits().filter((u) => u !== context.source);
                    if (otherUnits.length === 0) {
                        return false;
                    }
                    const minHp = Math.min(...otherUnits.map((u) => u.remainingHp));
                    return card.remainingHp === minHp;
                },
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.target.isUnit() && !context.target.hasSomeTrait(Trait.Vehicle),
                    onTrue: abilityHelper.immediateEffects.simultaneous([
                        abilityHelper.immediateEffects.damage({ amount: 3 }),
                        abilityHelper.immediateEffects.giveExperience((context) => ({ target: context.source }))
                    ]),
                    onFalse: abilityHelper.immediateEffects.damage({ amount: 3 })
                })
            }
        });
    }
}
