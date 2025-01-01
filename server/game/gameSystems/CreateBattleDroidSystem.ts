import type { AbilityContext } from '../core/ability/AbilityContext';
import { TokenUnitName } from '../core/Constants';
import type { ICreateTokenUnitProperties } from './CreateTokenUnitSystem';
import { CreateTokenUnitSystem } from './CreateTokenUnitSystem';

export type ICreateBattleDroidProperties = Omit<ICreateTokenUnitProperties, 'tokenType'>;

export class CreateBattleDroidSystem<TContext extends AbilityContext = AbilityContext> extends CreateTokenUnitSystem<TContext> {
    public override readonly name = 'create battle droid';

    protected override getTokenType() {
        return TokenUnitName.BattleDroid;
    }
}
