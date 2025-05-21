import type { IExactlyXCardSelectorProperties } from './ExactlyXCardSelector';
import { ExactlyXCardSelector } from './ExactlyXCardSelector';
import type { IExactlyVariableXCardSelectorProperties } from './ExactlyVariableXCardSelector';
import { ExactlyVariableXCardSelector } from './ExactlyVariableXCardSelector';
import type { IMaxStatCardSelectorProperties } from './MaxStatCardSelector';
import { MaxStatCardSelector } from './MaxStatCardSelector';
import type { ISingleCardSelectorProperties } from './SingleCardSelector';
import { SingleCardSelector } from './SingleCardSelector';
import type { IUnlimitedCardSelectorProperties } from './UnlimitedCardSelector';
import { UnlimitedCardSelector } from './UnlimitedCardSelector';
import type { IUpToXCardSelectorProperties } from './UpToXCardSelector';
import { UpToXCardSelector } from './UpToXCardSelector';
import type { IUpToVariableXCardSelectorProperties } from './UpToVariableXCardSelector';
import { UpToVariableXCardSelector } from './UpToVariableXCardSelector';
import { TargetMode } from '../Constants';
import type { IBetweenVariableXYCardSelectorProperties } from './BetweenVariableXYCardSelector';
import { BetweenVariableXYCardSelector } from './BetweenVariableXYCardSelector';
import type { AbilityContext } from '../ability/AbilityContext';
import type { BaseCardSelector } from './BaseCardSelector';
import * as Contract from '../utils/Contract';
import type { ICardTargetResolver } from '../../TargetInterfaces';

export function create<TContext extends AbilityContext>(
    properties: IBetweenVariableXYCardSelectorProperties<TContext> |
      IExactlyXCardSelectorProperties<TContext> |
      IExactlyVariableXCardSelectorProperties<TContext> |
      IMaxStatCardSelectorProperties<TContext> |
      ISingleCardSelectorProperties<TContext> |
      IUnlimitedCardSelectorProperties<TContext> |
      IUpToXCardSelectorProperties<TContext> |
      IUpToVariableXCardSelectorProperties<TContext> |
      ICardTargetResolver<TContext>
): BaseCardSelector<TContext> {
    if (!properties.mode) {
        properties.mode = TargetMode.Single;
    }

    switch (properties.mode) {
        case TargetMode.AutoSingle:
            return new SingleCardSelector(properties);
        case TargetMode.BetweenVariable:
            return new BetweenVariableXYCardSelector(properties);
        case TargetMode.Exactly:
            return new ExactlyXCardSelector({ ...properties, mode: TargetMode.Exactly });
        case TargetMode.ExactlyVariable:
            return new ExactlyVariableXCardSelector({ ...properties, mode: TargetMode.ExactlyVariable });
        case TargetMode.MaxStat:
            return new MaxStatCardSelector({ ...properties, mode: TargetMode.MaxStat });
        case TargetMode.Single:
            return new SingleCardSelector({ ...properties, mode: TargetMode.Single });
        case TargetMode.Unlimited:
            return new UnlimitedCardSelector({ ...properties, mode: TargetMode.Unlimited });
        case TargetMode.UpTo:
            return new UpToXCardSelector({ ...properties, mode: TargetMode.UpTo });
        case TargetMode.UpToVariable:
            return new UpToVariableXCardSelector({ ...properties, mode: TargetMode.UpToVariable });
        default:
            Contract.fail(`Unsupported card selector mode: ${(properties as any).mode}`);
    }
}
