import validData from '../fake-data/MOCK_DATA.json';
import { formatError } from '../helpers/error.helper';
import { ErrorsEnum } from '../types/errors.enum';
import { IProductItemInterface } from '../types/product-item.interface';

describe('handler: product-item', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('on getProductsList', () => {
        describe('given error do not exist', () => {
            it('should return data', async () => {
                const productId = 5;
                const item = (validData || []).find(
                    (item: IProductItemInterface) =>
                        item.id === Number(productId)
                );

                jest.doMock('../fake-data/MOCK_DATA.json', () => ({
                    __esModule: true,
                    default: validData,
                }));

                const { getProductsById } = await import('./product-item');

                await expect(
                    getProductsById(
                        {
                            pathParameters: {
                                productId: productId.toString(),
                            },
                        } as any,
                        null,
                        null
                    )
                ).resolves.toEqual({
                    statusCode: 200,
                    body: JSON.stringify(item),
                });
            });
        });

        describe('given error exist', () => {
            describe('given id do not exist', () => {
                it('should return error', async () => {
                    jest.doMock('../fake-data/MOCK_DATA.json', () => ({
                        __esModule: true,
                        default: validData,
                    }));

                    const { getProductsById } = await import('./product-item');

                    await expect(
                        getProductsById(null, null, null)
                    ).resolves.toEqual({
                        statusCode: 500,
                        body: JSON.stringify(
                            formatError(ErrorsEnum.WrongRequest)
                        ),
                    });
                });
            });

            describe('given item do not exist', () => {
                it('should return error', async () => {
                    jest.doMock('../fake-data/MOCK_DATA.json', () => ({
                        __esModule: true,
                        default: [],
                    }));

                    const { getProductsById } = await import('./product-item');

                    await expect(
                        getProductsById(
                            {
                                pathParameters: {
                                    productId: '999',
                                },
                            } as any,
                            null,
                            null
                        )
                    ).resolves.toEqual({
                        statusCode: 500,
                        body: JSON.stringify(
                            formatError(ErrorsEnum.NotFoundData)
                        ),
                    });
                });
            });

            describe('given data do not exist', () => {
                it('should return error', async () => {
                    jest.doMock('../fake-data/MOCK_DATA.json', () => ({
                        __esModule: true,
                        default: undefined,
                    }));

                    const { getProductsById } = await import('./product-item');

                    await expect(
                        getProductsById(
                            {
                                pathParameters: {
                                    productId: '999',
                                },
                            } as any,
                            null,
                            null
                        )
                    ).resolves.toEqual({
                        statusCode: 500,
                        body: JSON.stringify(
                            formatError(ErrorsEnum.CorruptedData)
                        ),
                    });
                });
            });
        });
    });
});
