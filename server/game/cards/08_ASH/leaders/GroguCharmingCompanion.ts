import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class GroguCharmingCompanion extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grogu#charming-companion-id',
            internalName: 'grogu#charming-companion',
        };
    }

    protected override deployActionAbilityProps(AbilityHelper: IAbilityHelper) {
        // Grogu deploys only via his triggered ability; suppress the Epic Action deploy from the base class
        return { condition: () => false };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Deploy Grogu',
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player &&
                    event.card.isUnit() &&
                    event.card.unique &&
                    event.card.cost >= 4
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => !context.source.exhausted,
                onTrue: AbilityHelper.immediateEffects.deploy()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addConstantAbility({
            title: 'While another friendly unit is defending, it gets +1/+0',
            matchTarget: (card, context) =>
                card !== context.source &&
                card.isUnit() &&
                card.isInPlay() &&
                card.isDefending(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        registrar.addConstantAbility({
            title: 'While another friendly unit is attacking, the defending unit gets -1/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) =>
                card.isUnit() &&
                card.isInPlay() &&
                card.isDefending() &&
                card.activeAttack.attacker.controller === context.player &&
                card.activeAttack.attacker !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
