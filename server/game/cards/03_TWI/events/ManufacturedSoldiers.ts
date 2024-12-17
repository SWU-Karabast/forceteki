import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { TargetMode } from '../../../core/Constants';

export default class ManufacturedSoldiers extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1192349217',
            internalName: 'manufactured-soldiers',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Create 2 Clone Trooper tokens or 3 Battle Droid tokens',
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Create 2 Clone Trooper tokens']: AbilityHelper.immediateEffects.createCloneTrooper({ amount: 2 }),
                    ['Create 3 Battle Droid tokens']: AbilityHelper.immediateEffects.createBattleDroid({ amount: 3 }),
                }
            }
        });
    }
}

ManufacturedSoldiers.implemented = true;
