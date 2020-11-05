import { formatError } from '../helpers/error.helper';
import { ErrorsEnum } from '../types/errors.enum';
import validData from '../fake-data/MOCK_DATA.json';

describe('handler: product-list', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('on getProductsList', () => {
        describe('given error do not exist', () => {
            it('should return data', async () => {
                jest.doMock('../fake-data/MOCK_DATA.json', () => ({
                    __esModule: true,
                    default: validData,
                }));

                const { getProductsList } = await import('./product-list');

                await expect(
                    getProductsList(null, null, null)
                ).resolves.toEqual({
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                    },
                    body: JSON.stringify({
                        count: validData.length,
                        items: validData,
                    }),
                });
            });
        });

        describe('given error exist', () => {
            describe('given data do not exist', () => {
                it('should return error', async () => {
                    jest.doMock('../fake-data/MOCK_DATA.json', () => ({
                        __esModule: true,
                        default: undefined,
                    }));

                    const { getProductsList } = await import('./product-list');

                    await expect(
                        getProductsList(null, null, null)
                    ).resolves.toEqual({
                        statusCode: 500,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                        },
                        body: JSON.stringify(
                            formatError(ErrorsEnum.CorruptedData)
                        ),
                    });
                });
            });
        });
    });
});
