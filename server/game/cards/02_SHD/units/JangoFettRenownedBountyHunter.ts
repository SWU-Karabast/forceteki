import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class JangoFettRenownedBountyHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6769342445',
            internalName: 'jango-fett#renowned-bounty-hunter',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While attacking a unit with Bounty, this unit gets +3/+0 and gains Overwhelm.',
            condition: (context) => {
                const attackTarget = context.source.activeAttack?.target;
                return attackTarget?.isUnit() && attackTarget?.isInPlay() && attackTarget?.hasSomeKeyword(KeywordName.Bounty);
            },
            ongoingEffect: [AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm), AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 0 })],
        });

        this.addTriggeredAbility({
            title: 'Draw a card',
            when: {
                onCardDefeated: (event, context) =>
                    // TODO: update trigger condition so that defender being defeated by attacker at the 'on attack' stage will also work
                    event.isDefeatedByAttackerDamage &&
                    event.defeatSource.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.draw(),
        });
    }
}

JangoFettRenownedBountyHunter.implemented = true;
