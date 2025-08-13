import type { AbilityContext } from '../core/ability/AbilityContext';
import { CreateTokenUnitSystem, type ICreateTokenUnitProperties } from './CreateTokenUnitSystem';
import { TokenUnitName } from '../core/Constants';

export type ICreateSpyProperties = Omit<ICreateTokenUnitProperties, 'tokenType'>;

export class CreateSpySystem<TContext extends AbilityContext = AbilityContext> extends CreateTokenUnitSystem<TContext> {
    public override readonly name = 'create spy';

    protected override getTokenType() {
        return TokenUnitName.Spy;
    }
}
