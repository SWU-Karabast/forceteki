import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SavageOpressMonster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8540765053',
            internalName: 'savage-opress#monster',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Ready this unit.',
            immediateEffect: AbilityHelper.immediateEffects.conditional(
                {
                    condition: (context) => {
                        const player = context.source.controller;
                        const opponent = player.opponent;
                        return player.getUnitsInPlay().length < opponent.getUnitsInPlay().length;
                    },
                    onTrue: AbilityHelper.immediateEffects.ready(),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }
            )
        });
    }
}

SavageOpressMonster.implemented = true;
