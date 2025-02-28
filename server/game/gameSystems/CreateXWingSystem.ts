import type { AbilityContext } from '../core/ability/AbilityContext';
import { CreateTokenUnitSystem, type ICreateTokenUnitProperties } from './CreateTokenUnitSystem';
import { TokenUnitName } from '../core/Constants';

export type ICreateXWingProperties = Omit<ICreateTokenUnitProperties, 'tokenType'>;

export class CreateXWingSystem<TContext extends AbilityContext = AbilityContext> extends CreateTokenUnitSystem<TContext> {
    public override readonly name = 'create x-wing';

    protected override getTokenType() {
        return TokenUnitName.XWing;
    }
}
