import type { KeywordName } from '../../Constants';
import type { Game } from '../../Game';
import type { FormatMessage } from '../../chat/GameChat';
import { registerState } from '../../GameObjectUtils';
import { TextHelper } from '../../utils/TextHelper';
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';

export interface IReplaceKeywordProperties {

    /** The keyword to replace. Every instance of it on the target is replaced with {@link to}. */
    from: KeywordName;

    /** The keyword that replaces {@link from}. */
    to: KeywordName;
}

/**
 * Replaces every instance of one keyword on the target, printed or gained, with another keyword
 * (e.g. "replace any Raid it has or gains with Restore"). Numeric values carry over to the
 * replacement keyword.
 */
@registerState()
export class ReplaceKeyword extends OngoingEffectValueWrapperBase<IReplaceKeywordProperties> {
    public constructor(game: Game, properties: IReplaceKeywordProperties) {
        const effectDescription: FormatMessage = {
            format: 'apply a {0}-to-{1} replacement',
            args: [TextHelper.keyword(properties.from), TextHelper.keyword(properties.to)]
        };

        super(game, properties, effectDescription);
    }
}
