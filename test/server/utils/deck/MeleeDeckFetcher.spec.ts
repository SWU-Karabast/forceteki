import { MeleeDeckFetcher } from '../../../../server/utils/deck/MeleeDeckFetcher';

describe('MeleeDeckFetcher', function () {
    const originalFetch = global.fetch;

    afterEach(function () {
        global.fetch = originalFetch;
    });

    it('normalizes smart quotes in melee.gg card names', async function () {
        const html = `
            <div class="decklist-title">Smart Quote Test</div>
            <div class="decklist-category">
                <div class="decklist-category-title">Leader (1)</div>
                <div class="decklist-record">
                    <span class="decklist-record-name">Han Solo | Worth the Risk</span>
                </div>
            </div>
            <div class="decklist-category">
                <div class="decklist-category-title">Base (1)</div>
                <div class="decklist-record">
                    <span class="decklist-record-name">Energy Conversion Lab</span>
                </div>
            </div>
            <div class="decklist-category">
                <div class="decklist-category-title">Deck (1)</div>
                <div class="decklist-record">
                    <span class="decklist-record-quantity">1</span>
                    <span class="decklist-record-name">Benthic “Two Tubes” | The War Has Just Begun</span>
                </div>
            </div>
        `;

        global.fetch = jasmine.createSpy('fetch').and.resolveTo(new Response(html, { status: 200 }));

        const cardDataGetter = {
            setCodeMap: new Map([
                ['leader-set-code', 'han-solo-worth-the-risk'],
                ['base-set-code', 'energy-conversion-lab'],
                ['benthic-set-code', 'benthic-two-tubes-the-war-has-just-begun'],
            ]),
            cardMap: new Map([
                ['han-solo-worth-the-risk', {
                    id: 'han-solo-worth-the-risk',
                    title: 'Han Solo',
                    subtitle: 'Worth the Risk',
                    internalName: 'han-solo-worth-the-risk',
                }],
                ['energy-conversion-lab', {
                    id: 'energy-conversion-lab',
                    title: 'Energy Conversion Lab',
                    internalName: 'energy-conversion-lab',
                }],
                ['benthic-two-tubes-the-war-has-just-begun', {
                    id: 'benthic-two-tubes-the-war-has-just-begun',
                    title: 'Benthic "Two Tubes"',
                    subtitle: 'The War Has Just Begun',
                    internalName: 'benthic-two-tubes-the-war-has-just-begun',
                }],
            ]),
        } as any;

        const deck = await new MeleeDeckFetcher(cardDataGetter).fetchAsync('https://melee.gg/Decklist/View/3166d46f-d853-4698-8d8b-b45a005b0435');

        expect(deck.deck).toEqual([{ id: 'benthic-set-code', count: 1 }]);
    });
});
