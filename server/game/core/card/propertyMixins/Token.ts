import type { IInPlayCard, InPlayCardConstructor } from '../baseClasses/InPlayCard';
import * as Contract from '../../utils/Contract';
import { ZoneName } from '../../Constants';
import type { IPlayableCard } from '../baseClasses/PlayableOrDeployableCard';

export interface ITokenCard extends IInPlayCard {
    removeFromGame(): void;
}

/** Mixin function that creates a version of the base class that is a Token. */
export function AsToken<TBaseClass extends InPlayCardConstructor>(BaseClass: TBaseClass) {
    return class AsToken extends BaseClass {
        public removeFromGame() {
            Contract.assertTrue(this.zone.name === ZoneName.OutsideTheGame, `Attempting to remove token ${this.internalName} from the game but it is in zone ${this.zone}`);

            this.zone.removeCard(this);
            this.zone = null;
        }

        public override isToken(): this is ITokenCard {
            return true;
        }

        public override isPlayable(): this is IPlayableCard {
            return false;
        }
    };
}