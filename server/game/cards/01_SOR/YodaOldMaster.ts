import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../core/Constants';

export default class YodaOldMaster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4405415770',
            internalName: 'yoda#old-master'
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Choose any number of players to draw 1 card',
            targetResolver: {
                mode: TargetMode.Select,
                choices: (context) => ({
                    //TODO: Make this selection prompt less awkward: create a way to select any number of options from an arbitrary list.
                    ['Me']: AbilityHelper.immediateEffects.draw({ target: context.source.owner }),
                    ['Opponent']: AbilityHelper.immediateEffects.draw({ target: context.source.owner.opponent }),
                    ['Me and Opponent']: AbilityHelper.immediateEffects.draw({ target: [context.source.owner, context.source.owner.opponent] }),
                    ['No one']: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

YodaOldMaster.implemented = true;