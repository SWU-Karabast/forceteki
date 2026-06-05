import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TatooineRepulsorTrain extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9629363501',
            internalName: 'tatooine-repulsor-train',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit can\'t be attacked while you control 2 or more exhausted units',
            condition: (context) => this.getFriendlyExhaustedUnitCount(context) >= 2,
            ongoingEffect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });

        registrar.addOnAttackAbility({
            title: 'Deal 2 damage to a ground unit for each friendly exhausted unit',
            targetResolver: {
                activePromptTitle: (context) => `Choose a ground unit to deal ${this.getAttackDamage(context)} damage to`,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: this.getAttackDamage(context) })),
            }
        });
    }

    private getFriendlyExhaustedUnitCount(context): number {
        return context.player.getArenaUnits({ condition: (card) => card.exhausted }).length;
    }

    private getAttackDamage(context): number {
        return 2 * this.getFriendlyExhaustedUnitCount(context);
    }
}
