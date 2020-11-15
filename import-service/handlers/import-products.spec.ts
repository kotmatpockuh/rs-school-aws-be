import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../../shared/helpers/response.helper';
import { importProductsFile } from './import-products';
import { ErrorsEnum } from '../../shared/types/errors.enum';
import awsMock from 'aws-sdk-mock';
import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
} from 'aws-lambda';

describe('handler: import-products', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('on importProductsFile', () => {
        describe('given error do not exist', () => {
            it('should return data', async () => {
                const name = 'fakeName';
                const url = { data: name };

                awsMock.mock('S3', 'getSignedUrl', url);

                await expect(
                    importProductsFile(
                        ({
                            queryStringParameters: {
                                name: 'fakeName',
                            },
                        } as unknown) as APIGatewayProxyEventBase<
                            APIGatewayEventDefaultAuthorizerContext
                        >,
                        null,
                        null
                    )
                ).resolves.toEqual(formattedSuccessResponse(url));
            });
        });

        describe('given error exist', () => {
            describe('given name not exist', () => {
                it('should return error', async () => {
                    await expect(
                        importProductsFile(null, null, null)
                    ).resolves.toEqual(
                        formattedErrorResponse({
                            type: ErrorsEnum.WrongRequest,
                            statusCode: 400,
                        })
                    );
                });
            });
        });
    });
});
