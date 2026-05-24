import { parseCardDataVersion } from '../../../../server/utils/cardData/CardDataVersion';

describe('CardDataVersion', function() {
    it('parses the last updated date from the card data version', function() {
        const versionInfo = parseCardDataVersion('20260423_00\n');

        expect(versionInfo).toEqual({
            lastUpdated: '2026-04-23',
            version: '20260423_00'
        });
    });

    it('throws for unexpected card data version formats', function() {
        expect(() => parseCardDataVersion('not-a-version')).toThrowError('Unexpected card data version format: \'not-a-version\'');
    });
});
