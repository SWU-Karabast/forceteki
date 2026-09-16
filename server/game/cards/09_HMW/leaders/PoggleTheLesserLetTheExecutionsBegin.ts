import type {IAbilityHelper} from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import {LeaderUnitCard} from '../../../core/card/LeaderUnitCard';
import {RelativePlayer, Trait, WildcardCardType} from '../../../core/Constants';
import {TextHelper} from '../../../core/utils/TextHelper';

export default class PoggleTheLesserLetTheExecutionsBegin extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'poggle-the-lesser#let-the-executions-begin-id',
            internalName: 'poggle-the-lesser#let-the-executions-begin',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: `Ready a friendly ${TextHelper.Trait.Creature} unit and deal 1 damage to it`,
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Creature),
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage({ amount: 1 }),
                    abilityHelper.immediateEffects.ready()
                ])
            },
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Beast Token',
            when: {
                onLeaderDeployed: (event, context) =>
                    event.card === context.source
            },
            immediateEffect: abilityHelper.immediateEffects.createBeast()
        });

        registrar.addOnAttackAbility({
            title: `You may ready a friendly ${TextHelper.Trait.Creature} unit and deal 1 damage to it`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Creature),
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage({ amount: 1 }),
                    abilityHelper.immediateEffects.ready()
                ])
            },
        });
    }
}