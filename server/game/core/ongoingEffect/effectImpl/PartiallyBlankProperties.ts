import type { KeywordName } from '../../Constants';

export interface PartiallyBlankProperties {
    exceptKeyword?: KeywordName;
    exceptFromSource?: any;
}