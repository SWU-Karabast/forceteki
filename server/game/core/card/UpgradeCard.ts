import Player from '../Player';
import { Hp } from './propertyMixins/Hp';
import { NewCard } from './NewCard';
import { Exhaust } from './propertyMixins/Exhaust';
import { Cost } from './propertyMixins/Cost';
import { ArenaAbilities } from './propertyMixins/ArenaAbilities';
import { Power } from './propertyMixins/Power';
import { InitiateAttackAction } from '../../actions/InitiateAttackAction';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import Contract from '../utils/Contract';
import { CardType, Location } from '../Constants';

const UpgradeCardParent = ArenaAbilities(Power(Hp(Cost(Exhaust(NewCard)))));

export class UpgradeCard extends UpgradeCardParent {
    public constructor(
        owner: Player,
        cardData: any
    ) {
        super(owner, cardData);
        Contract.assertTrue(this.printedTypes.has(CardType.Upgrade));

        // TODO UPGRADES: add play event action to this._actions (see Unit.ts for reference)
    }

    public override isUpgrade() {
        return true;
    }

    protected override initializeForCurrentLocation(): void {
        super.initializeForCurrentLocation();

        switch (this.location) {
            case Location.Resource:
                this.enableExhaust(true);
                break;

            default:
                this.enableExhaust(false);
                break;
        }
    }

    // TODO UPGRADES: this was in the L5R code as "updateEffectContext()", not sure yet what the need is
    protected updateConstantAbilityContexts() {
        for (const constantAbility of this.constantAbilities) {
            if (constantAbility.registeredEffects) {
                for (const effect of constantAbility.registeredEffects) {
                    effect.refreshContext();
                }
            }
        }
    }
}