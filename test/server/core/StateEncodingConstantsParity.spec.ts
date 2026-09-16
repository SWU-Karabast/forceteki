import { STATE_ENCODING_TAGS, STATE_RECORD_FORMAT_VERSION } from '../../../server/game/core/StateEncoding';
import * as model from '../../../scripts/stateSerializerModel';

/**
 * scripts/stateSerializerModel.js hand-duplicates STATE_ENCODING_TAGS / STATE_RECORD_FORMAT_VERSION from
 * server/game/core/StateEncoding.ts (documented at both duplication sites) because the generator is plain
 * CommonJS and cannot import the TypeScript leaf module directly. Both feed computeSchemaSurfaceHash,
 * which Plan 6 gates save compatibility on - a silent drift here would under/over-invalidate that hash
 * with no test failure. This spec converts the "keep them in sync by hand" obligation into an enforced
 * one (P3PA1-IC-1).
 */
describe('StateEncoding.ts / stateSerializerModel.js constant parity', function() {
    it('STATE_ENCODING_TAGS is identical between the two sources', function() {
        expect(model.STATE_ENCODING_TAGS).toEqual([...STATE_ENCODING_TAGS]);
    });

    it('STATE_RECORD_FORMAT_VERSION is identical between the two sources', function() {
        expect(model.STATE_RECORD_FORMAT_VERSION).toBe(STATE_RECORD_FORMAT_VERSION);
    });
});
